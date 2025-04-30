"use client";

import dynamic from 'next/dynamic';
const Doxlist = dynamic(() => import('@/app/doxdotfun/components/doxlist'), {ssr: false})

export default function DoxlistPage() {
  return (
    <main className="flex min-h-100 flex-col items-center justify-center px-0 py-4 md:p-8">
      <Doxlist />
    </main>
  );
}