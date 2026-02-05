'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GalleryIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/yvu');
  }, [router]);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}
