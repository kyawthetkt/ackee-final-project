'use client'

import { getTextfeedProgram, getTextfeedProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner';
import { SystemProgram } from '@solana/web3.js'

export function useTextfeedProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getTextfeedProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getTextfeedProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['textfeed', 'all', { cluster }],
    queryFn: () => program.account.post.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createPostMutation = useMutation({
    mutationKey: ['textfeed', 'create_post', { cluster }],
    mutationFn: ({ title, description }: { title: string, description: string }) => {

      const [postPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("post"),  provider.wallet.publicKey.toBuffer(),  Buffer.from(title) ],
        program.programId
      );

      return program.methods.createPost(title, description).accounts({
        author: provider.wallet.publicKey,
        // post: postPda,
        // systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc();

    },
    retry: false,
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to initialize account')
    },
  })

  return {
    program,
    programId,
    accounts,
    createPostMutation,
    getProgramAccount,
  }
}

export function useTextfeedProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const { program } = useTextfeedProgram()
  
  const accountQuery = useQuery({
    queryKey: ['post', 'fetch', { cluster, account }],
    queryFn: () => program.account.post.fetch(account),
  });

  const addCommentMutation = useMutation({
    mutationKey: ['post', 'addComment', { cluster, account }],

    mutationFn: async ({ text }: { text: string }) => {
      const [commentAccountPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("comment"),
          account.toBuffer()
        ],
        program.programId
      );

      return program.methods
        .addComment(text)
        .accounts({
          commenter: provider.wallet.publicKey,
          // post: account,
          // commentAccount: commentAccountPda,
          // systemProgram: SystemProgram.programId
        })
        .rpc();
    },
    retry: false,
    onSuccess: async (tx) => {
      transactionToast(tx);
      await accountQuery.refetch();
    },
  });

  const pubkey = provider.wallet?.publicKey

  const userReactionQuery = useQuery({
  queryKey: ['post', 'reaction', { cluster, account, user: pubkey?.toBase58() }],
  enabled: !!pubkey, // query only runs if wallet is connected
  queryFn: async () => {
    const [reactionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("reaction"), account.toBuffer(), pubkey!.toBuffer()],
      program.programId
    )
    try {
      const reaction = await program.account.reaction.fetch(reactionPda)
      return { pda: reactionPda, data: reaction }
    } catch {
      return null // no reaction yet
    }
  },
})

  const addReactionMutation = useMutation({
    mutationKey: ['post', 'addReaction', { cluster, account }],

    mutationFn: async ({ reaction_type }: { reaction_type: number }) => {
      const [reactionAccountPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("reaction"),
          account.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      return program.methods
        .addReaction(reaction_type)
        .accounts({
          reactor: provider.wallet.publicKey,
          // post: account,
          // reaction: reactionAccountPda,
          // systemProgram: SystemProgram.programId
        })
        .rpc();
    },
    retry: false,
    onSuccess: async (tx) => {
      transactionToast(tx);
      await accountQuery.refetch();
    },
  });


  return {
    accountQuery,
    addCommentMutation,
    addReactionMutation,
    userReactionQuery
  }
}
