'use client';

// import dynamic from 'next/dynamic';

// const TextfeedCreate = dynamic(
//   () => import('@/components/textfeed/textfeed-create-feature'),
//   { ssr: false }
// );
import PostDetailPage from "@/components/textfeed/textfeed-post-detail";

export default function Page() {
  return <PostDetailPage />
}