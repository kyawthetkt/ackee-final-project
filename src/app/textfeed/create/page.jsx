'use client';

// import dynamic from 'next/dynamic';

// const TextfeedCreate = dynamic(
//   () => import('@/components/textfeed/textfeed-create-feature'),
//   { ssr: false }
// );
import TextfeedCreate from '@/components/textfeed/textfeed-create-feature';

export default function Page() {
  return <TextfeedCreate />
}