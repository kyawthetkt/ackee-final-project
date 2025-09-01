// src/app/textfeed/create/page.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import dynamic from 'next/dynamic'

const TextfeedCreate = dynamic(
  () => import('@/components/textfeed/textfeed-create-feature'),
  { ssr: false } // ⬅️ critical
)

export default function Page() {
  return <TextfeedCreate />
}