// components/RefreshButton.tsx
'use client';

import { useState } from 'react';

interface RefreshButtonProps {
  onClick: () => void;
  loading: boolean;
}

export default function RefreshButton({ onClick, loading }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-5 px-12 rounded-xl text-2xl shadow-2xl transform hover:scale-105 transition-all duration-200"
    >
      {loading ? '更新中...' : '強制更新'}
    </button>
  );
}