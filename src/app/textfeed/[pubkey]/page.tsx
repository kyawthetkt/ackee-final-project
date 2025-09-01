'use client'

import { useParams } from 'next/navigation'
import { PublicKey } from '@solana/web3.js'
import { useTextfeedProgramAccount } from '@/components/textfeed/textfeed-data-access'
import { ExplorerLink } from '@/components/cluster/cluster-ui'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UseMutationResult } from '@tanstack/react-query'

import { useAnchorProvider } from '@/components/solana/solana-provider'
import { CommentList } from '@/components/textfeed/comment-list-feature'

export default function PostDetailPage() {
  const params = useParams()
  const pubkey = params?.pubkey as string

  if (!pubkey) {
    return <div className="p-6 text-center text-gray-300">No post selected.</div>
  }

  return <PostDetail account={new PublicKey(pubkey)} />
}
 
type AddCommentMutation = UseMutationResult<
  string,  
  Error,               
  { text: string }, 
  unknown          
>

type AddReactionMutation = {
  mutateAsync: ({ reaction_type }: { reaction_type: number }) => Promise<void>;
  isPending: boolean;
};

function PostDetail({ account }: { account: PublicKey }) {
  const provider = useAnchorProvider()
  const pubkey = provider.wallet?.publicKey

  const { accountQuery, addCommentMutation, addReactionMutation, userReactionQuery } =
    useTextfeedProgramAccount({ account })

  if (accountQuery.isLoading) {
    return <div className="p-6 text-center text-gray-300">Loading…</div>
  }

  if (!accountQuery.data) {
    return <div className="p-6 text-center text-gray-300">Post not found.</div>
  }

  const post = accountQuery.data
  const alreadyReacted = !!userReactionQuery.data

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray">{post.title}</h1>
      <p className="text-gray-600">{post.description}</p>

      <div className="flex justify-between text-sm text-gray-400">
        <span>👍 {post.likes.toString()}</span>
        <span>👎 {post.dislikes.toString()}</span>
        <span>{new Date(post.timestamp.toNumber() * 1000).toLocaleString()}</span>
      </div>

      <div className="text-sm text-gray-400">
        Author:{' '}
        <ExplorerLink
          path={`account/${post.author.toBase58()}`}
          label={post.author.toBase58()}
        />
      </div>

      <ReactionButtons
        addReaction={addReactionMutation}
        pubkey={pubkey}
        alreadyReacted={alreadyReacted}
      />

      <CommentForm addComment={addCommentMutation} />

      <CommentList post={account} />
    </div>
  )
}

function ReactionButtons({
  addReaction,
  pubkey,
  alreadyReacted,
}: {
  addReaction: AddReactionMutation
  pubkey: PublicKey
  alreadyReacted: boolean
}) {
  return (
    <div className="flex gap-4 mt-4">
      <Button
        disabled={!pubkey || addReaction.isPending || alreadyReacted}
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={() => addReaction.mutateAsync({ reaction_type: 1 })}
      >
        👍 Like
      </Button>
      <Button
        disabled={!pubkey || addReaction.isPending || alreadyReacted}
        className="bg-red-600 hover:bg-red-700 text-white"
        onClick={() => addReaction.mutateAsync({ reaction_type: 0 })}
      >
        👎 Dislike
      </Button>
    </div>
  )
}

function CommentForm({ addComment }: { addComment: AddCommentMutation }) {
  const [text, setText] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await addComment.mutateAsync({ text })
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        className="w-full px-4 py-2 bg-gray-100 border border-gray-120 rounded-md text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-100"
        rows={3}
      />

      <Button
        type="submit"
        disabled={addComment.isPending}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        {addComment.isPending ? 'Submitting…' : 'Add Comment'}
      </Button>
    </form>
  )
}
