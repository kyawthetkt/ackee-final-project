// 'use client';

// import dynamic from 'next/dynamic';

// const TextFeedListFeature = dynamic(
//   () => import('@/components/textfeed/textfeed-list-feature'),
//   { ssr: false }
// );
import TextFeedListFeature from '@/components/textfeed/textfeed-list-feature';

export default function Page() {
  return <TextFeedListFeature />
}