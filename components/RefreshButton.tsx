// components/RefreshButton.tsx ← 修好按鈕不更新問題
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    // 強制清快取 + 刷新
    router.refresh();
    // 加個小延遲，確保資料載入
    await new Promise(r => setTimeout(r, 500));
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