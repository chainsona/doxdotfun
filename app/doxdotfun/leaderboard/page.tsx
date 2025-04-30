"use client";

import dynamic from 'next/dynamic';
const Leaderboard = dynamic(() => import('@/app/doxdotfun/components/leaders'), {ssr: false})

export default function LeaderboardPage() {
  return (
    <main className="flex min-h-100 flex-col items-center justify-center px-0 py-4 md:p-8">
      <Leaderboard />
    </main>
  );
}