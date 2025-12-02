// components/RefreshButton.tsx ← 接收 onClick，解決按鈕不更新
'use client';

import { useState } from 'react';

interface RefreshButtonProps {
  onClick: () => void;
}

export default function RefreshButton({ onClick }: RefreshButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await onClick(); // 呼叫父組件的 fetchData
    setLoading(false);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-5 px-12 rounded-xl text-2xl shadow-2xl transform hover:scale-105 transition-all duration-200"
    >
      {loading ? '更新中...' : '強制更新'}
    </button>
  );
}