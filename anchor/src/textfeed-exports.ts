// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TextFeedIDL from '../target/idl/textfeed.json'
import type { Textfeed } from '../target/types/textfeed'

// Re-export the generated IDL and type
export { Textfeed, TextFeedIDL }

// The programId is imported from the program IDL.
export const TEXTFEED_PROGRAM_ID = new PublicKey(TextFeedIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getTextfeedProgram(provider: AnchorProvider, address?: PublicKey): Program<Textfeed> {
  return new Program({ ...TextFeedIDL, address: address ? address.toBase58() : TextFeedIDL.address } as Textfeed, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getTextfeedProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey("Fov2FcuzX37TPe8fRq94UcWgaBW37NEpp4FK2MRY3hri")
    case 'mainnet-beta':
    default:
      return TEXTFEED_PROGRAM_ID
  }
}
