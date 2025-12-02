// app/manage/page.tsx ← 完整密碼登入版（直接蓋掉）

'use client';

import { useState, useEffect } from 'react';

export default function ManagePage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [search, setSearch] = useState('');
  const [allStores, setAllStores] = useState<any[]>([]);
  const [selectedSids, setSelectedSids] = useState<string[]>([]);

  useEffect(() => {
    const auth = localStorage.getItem('izakaya-admin-auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = async () => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      localStorage.setItem('izakaya-admin-auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('密碼錯誤！');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
          <h1 className="text-4xl font-bold text-center mb-8 text-purple-800">i珍食後台登入</h1>
          <input
            type="password"
            placeholder="輸入管理員密碼"
            className="w-full p-4 text-xl border-2 border-purple-300 rounded-lg mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-lg text-xl">
            登入
          </button>
        </div>
      </div>
    );
  }

  // 登入後的完整管理介面（之後再補）
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">後台管理（開發中）</h1>
        <button onClick={() => {
          localStorage.removeItem('izakaya-admin-auth');
          setIsAuthenticated(false);
        }} className="text-red-600">登出</button>
      </div>
    </div>
  );
}