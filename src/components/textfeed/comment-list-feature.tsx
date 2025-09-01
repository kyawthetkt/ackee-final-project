'use client'

import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { useTextfeedProgram } from '@/components/textfeed/textfeed-data-access'
import Link from 'next/link'

export function CommentList({ post }: { post: PublicKey }) {
  const { program } = useTextfeedProgram()

  // PDA: seeds = [b"comment", post.key()]
  const [commentPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('comment'), post.toBuffer()],
    program.programId
  )

  const { data, isLoading, error } = useQuery({
    queryKey: ['comments', post.toBase58()],
    queryFn: () => program.account.commentAccount.fetch(commentPda),
  });

  if (isLoading) return <p className="text-gray-400">Loading comments…</p>
  if (error) return <p className="text-red-500">.</p>
  if (!data) return <p className="text-gray-400">No comments yet</p>

  // Assuming CommentAccount has a `comments: string[]` field
  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">Comments</h2>
      {data.comments?.length ? (
        <ul className="space-y-2">
          {data.comments?.map((c: any, idx: number) => (
            <li
                key={idx}
                className="p-3 bg-white mt-3 rounded-md text-white shadow-sm space-y-1"
            >
                <p className="text-sm text-gray-600">
                Author:{' '}
                <Link
                    href={`https://explorer.solana.com/address/${c.author.toBase58()}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:underline"
                >
                    Author: {typeof c.author === 'string' ? c.author : c.author.toBase58?.() ?? ''}
                </Link>
                </p>

                <p className='text-gray-600'>{c.text}</p>
                <div className="flex justify-between text-xs text-gray-400">
                <span>{new Date(Number(c.timestamp) * 1000).toLocaleString()}</span>
                {/* <span>👍 {c.likes?.toString?.() ?? c.likes}</span> */}
                {/* <span>👎 {c.dislikes?.toString?.() ?? c.dislikes}</span> */}
                </div>
            </li>
        ))}

        </ul>
      ) : (
        <p className="text-gray-400">No comments yet</p>
      )}
    </div>
  )
}
