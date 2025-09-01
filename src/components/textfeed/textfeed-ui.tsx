'use client'

import { PublicKey } from '@solana/web3.js'
import { useTextfeedProgram, useTextfeedProgramAccount } from './textfeed-data-access'
import { ExplorerLink } from '../cluster/cluster-ui'
import { ellipsify } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import Link from 'next/link'

export function TextfeedList() {
  const { accounts, getProgramAccount } = useTextfeedProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and are on the correct cluster.
        </span>
      </div>
    )
  }

  return (
    // <div className="flex flex-col items-center justify-center p-8 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
    <div className="space-y-6 w-full">
      <div className="flex justify-end">
      <Link href="/textfeed/create" className="text-blue-500 hover:underline">
        Create Post
      </Link>
    </div>

      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="max-w-lg mx-auto grid lg:grid-cols-1 gap-6">
          {accounts.data.map((account) => (
            <PostCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl">No posts yet</h2>
          <p>Create one above to get started.</p>
        </div>
      )}
    </div>
    // </div>
  )
}

function PostCard({ account }: { account: PublicKey }) {
  const { accountQuery } = useTextfeedProgramAccount({ account })
  const data = accountQuery.data

  if (accountQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!data) {
    return null
  }

  return (
    <Card className="bg-card text-card-foreground border border-border shadow-md">
      <CardHeader>
       <Link href={`/textfeed/${account.toBase58()}`}>
          <CardTitle className="text-lg font-bold">{data.title}</CardTitle>
      </Link>
        <CardDescription>
          Author:{' '}
          <ExplorerLink
            path={`account/${data.author.toBase58()}`}
            label={ellipsify(data.author.toBase58())}
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-2">{data.description}</p>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>👍 {data.likes.toString()}</span>
          <span>👎 {data.dislikes.toString()}</span>
          <span>{new Date(data.timestamp.toNumber() * 1000).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}