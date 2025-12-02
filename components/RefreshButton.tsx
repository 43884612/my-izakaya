// components/RefreshButton.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function RefreshButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.refresh()}
      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-5 px-12 rounded-xl text-2xl shadow-2xl transform hover:scale-105 transition-all duration-200"
    >
      強制更新
    </button>
  );
}