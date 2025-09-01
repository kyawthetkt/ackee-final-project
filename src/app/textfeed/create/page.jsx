// src/app/textfeed/create/ClientOnlyCreate.tsx  (Client Component)
'use client'

import dynamic from 'next/dynamic'

const TextfeedCreate = dynamic(
  () => import('@/components/textfeed/textfeed-create-feature'),
  { ssr: false }
)

export default function ClientOnlyCreate() {
  return <TextfeedCreate />
}
