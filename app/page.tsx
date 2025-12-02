// app/page.tsx ← 最終完美首頁（直接全部蓋掉！）

'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import RefreshButton from '@/components/RefreshButton';

type Product = {
  sid: string;
  title: string;
  total: number;
  price: number;
  thumb: string;
};

// 從 localStorage 讀取使用者選擇的店家 sid
const getSelectedSids = (): string[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('my-izakaya-sids');
  return saved ? JSON.parse(saved) : [];
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  const text = await res.text();

  if (text.startsWith('<!doctype') || text.includes('Error')) {
    throw new Error('API 錯誤頁面');
  }

  try {
    const jsonData = JSON.parse(text);
    if (!Array.isArray(jsonData.products)) {
      throw new Error('無效資料格式');
    }
    return {
      products: jsonData.products,
      updatedAt: jsonData.updatedAt || new Date().toISOString(),
    };
  } catch (e) {
    console.error('JSON 解析失敗:', e);
    throw new Error('資料解析錯誤');
  }
};

export default function Home() {
  const [selectedSids, setSelectedSids] = useState<string[]>([]);

  // 載入使用者選擇的店家
  useEffect(() => {
    setSelectedSids(getSelectedSids());
  }, []);

  const { data, error, mutate, isLoading } = useSWR('/api/update', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });

  const [manualLoading, setManualLoading] = useState(false);
  const handleRefresh = async () => {
    setManualLoading(true);
    await mutate();
    setManualLoading(false);
  };

  const products: Product[] = data?.products || [];
  const updatedAt = data?.updatedAt || new Date().toISOString();
  const hasData = products.length > 0;

  // 過濾：只顯示使用者選的店家
  const filteredProducts = selectedSids.length > 0
    ? products.filter(p => selectedSids.includes(p.sid))
    : products;

  const filteredHasData = filteredProducts.length > 0;

  // 分店整理
  const stores = filteredProducts.reduce((acc: any, p: Product) => {
    const store = allStores.find(s => s.sid === p.sid) || { name: `未知分店 ${p.sid}`, addr: '地址不詳' };
    if (!acc[store.name]) {
      acc[store.name] = {
        addr: store.addr,
        map: `https://www.google.com/maps/search/${encodeURIComponent(store.addr)}`,
        products: [],
      };
    }
    acc[store.name].products.push(p);
    return acc;
  }, {});

  // 預載全台店家資料（用於顯示店名地址）
  const [allStores, setAllStores] = useState<any[]>([]);
  useEffect(() => {
    fetch('/stores.json').then(r => r.json()).then(setAllStores);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-2xl">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          i珍食即時查詢
        </h1>

        <div className="text-center mb-10">
          <RefreshButton onClick={handleRefresh} loading={manualLoading} />
          <p className="mt-4 text-lg text-gray-600 font-medium">
            最後更新：
            {new Date(updatedAt).toLocaleString('zh-TW', {
              timeZone: 'Asia/Taipei',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })}
          </p>
          {error && <p className="text-red-500">抓取失敗，試試更新</p>}
        </div>

        {!filteredHasData ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-5xl font-bold mb-8">
              {selectedSids.length === 0 ? '請先去管理頁面加入店家' : '目前無資料'}
            </p>
            {selectedSids.length === 0 && (
              <a href="/manage" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl">
                點我設定店家
              </a>
            )}
            <div className="space-y-6 mt-10">
              <p className="text-6xl text-orange-500 font-bold">8折</p>
              <p className="text-3xl text-gray-700">19:00 ∼ 19:59</p>
              <p className="text-7xl text-red-600 font-bold mt-10">65折</p>
              <p className="text-3xl text-gray-700">20:00 ∼ 03:00</p>
            </div>
          </div>
        ) : (
          Object.entries(stores).map(([storeName, store]: [string, any]) => (
            <div key={storeName} className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-200">
              <h2 className="text-3xl font-bold mb-3 text-gray-800">{storeName}</h2>
              <p className="text-gray-600 mb-6">
                地址：
                <a href={store.map} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">
                  {store.addr}
                </a>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {store.products.map((p: Product, i: number) => (
                  <div key={i} className="border rounded-xl overflow-hidden shadow hover:shadow-2xl transition">
                    <img src={p.thumb} alt={p.title} className="w-full h-48 object-cover" loading="lazy" />
                    <div className="p-4 bg-white">
                      <p className="font-semibold text-sm line-clamp-2 mb-2">
                        {p.title.replace('[i珍食]', '').trim()}
                      </p>
                      <div className="flex justify-between items-end">
                        <p className="text-red-600 font-bold text-lg">剩餘 {p.total}</p>
                        <p className="text-blue-600 font-bold text-xl">${p.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}