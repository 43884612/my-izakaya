// app/manage/page.tsx ← 台灣最強 i珍食管理後台（直接全部蓋掉！）

'use client';

import { useState, useEffect } from 'react';

type Store = {
  sid: string;
  name: string;
  addr: string;
};

export default function ManagePage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [selectedSids, setSelectedSids] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // 檢查是否已登入
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

  // 登入後載入資料
  useEffect(() => {
    if (!isAuthenticated) return;

    // 載入全台店家
    fetch('/stores.json')
      .then(r => r.json())
      .then(data => {
        setAllStores(data);
        setLoading(false);
      });

    // 載入已選擇的店家
    const saved = localStorage.getItem('my-izakaya-sids');
    if (saved) setSelectedSids(JSON.parse(saved));
  }, [isAuthenticated]);

  const filteredStores = allStores.filter(store =>
    store.name.toLowerCase().includes(search.toLowerCase()) ||
    store.sid.includes(search)
  );

  const toggleStore = (sid: string) => {
    const newSids = selectedSids.includes(sid)
      ? selectedSids.filter(s => s !== sid)
      : [...selectedSids, sid];

    setSelectedSids(newSids);
    localStorage.setItem('my-izakaya-sids', JSON.stringify(newSids));
  };

  const selectedStores = allStores.filter(s => selectedSids.includes(s.sid));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-8 text-purple-800">i珍食後台登入</h1>
          <input
            type="password"
            placeholder="輸入管理員密碼"
            className="w-full p-4 text-xl border-2 border-purple-300 rounded-lg mb-6 focus:border-purple-600 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-lg text-xl transition"
          >
            登入
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-2xl">載入 7000 家店家中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-purple-800">i珍食店家管理</h1>
            <button
              onClick={() => {
                localStorage.removeItem('izakaya-admin-auth');
                setIsAuthenticated(false);
              }}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              登出
            </button>
          </div>

          <input
            type="text"
            placeholder="搜尋店名或 sid（例如：中山、2661）"
            className="w-full p-4 text-xl border-2 border-purple-300 rounded-lg focus:border-purple-600 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 已加入店家 */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-green-700">
              已加入查詢 ({selectedStores.length} 家)
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedStores.map(store => (
                <div key={store.sid} className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-semibold">{store.name}</div>
                    <div className="text-sm text-gray-600">{store.addr}</div>
                  </div>
                  <button
                    onClick={() => toggleStore(store.sid)}
                    className="text-red-600 hover:text-red-800"
                  >
                    移除
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 搜尋結果 */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">
              搜尋結果 ({filteredStores.length} 家)
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredStores.slice(0, 100).map(store => (
                <div key={store.sid} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-medium">{store.name}</div>
                    <div className="text-sm text-gray-600 truncate">{store.addr}</div>
                  </div>
                  <button
                    onClick={() => toggleStore(store.sid)}
                    className={`px-6 py-2 rounded-lg font-medium transition ${
                      selectedSids.includes(store.sid)
                        ? 'bg-gray-400 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={selectedSids.includes(store.sid)}
                  >
                    {selectedSids.includes(store.sid) ? '已加入' : '加入'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <a
            href="/"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-5 rounded-xl text-2xl transition transform hover:scale-105"
          >
            回到首頁查詢
          </a>
        </div>
      </div>
    </div>
  );
}