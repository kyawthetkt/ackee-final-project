import dynamic from 'next/dynamic'

// Ensure Node runtime (avoid Edge + SES weirdness with web3)
export const runtime = 'nodejs'

// Load the client component purely on the client
const ClientPostDetail = dynamic(() => import('@/components/textfeed/textfeed-post-detail'), { ssr: false })

export default function Page() {
  return <ClientPostDetail />
}
