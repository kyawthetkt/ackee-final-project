'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
// import { ExplorerLink } from '../cluster/cluster-ui'
// import { useTextfeedProgram } from './textfeed-data-access'
import { TextfeedList } from './textfeed-ui'
// import { AppHero } from '../app-hero'
// import { ellipsify } from '@/lib/utils'

export default function TextFeedListFeature() {
  const { publicKey } = useWallet()
  // const { programId } = useTextfeedProgram()

  return <TextfeedList />

  return publicKey ? (
      <TextfeedList />
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
