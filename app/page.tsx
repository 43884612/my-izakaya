// app/page.tsx ← 最終完美版（直接全部蓋掉！）

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

type StoreInfo = {
  sid: string;
  name: string;
  addr: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  const text = await res.text();
  if (text.startsWith('<!doctype') || text.includes('Error')) throw new Error('API error');
  const json = JSON.parse(text);
  return {
    products: Array.isArray(json.products) ? json.products : [],
    updatedAt: json.updatedAt || new Date().toISOString(),
  };
};

export default function Home() {
  const [storeMap, setStoreMap] = useState<Map<string, StoreInfo>>(new Map());
  const [selectedSids, setSelectedSids] = useState<string[]>([]);

  // 載入全台店家對照表 + 使用者選擇
  useEffect(() => {
    fetch('/stores.json')
      .then(r => r.json())
      .then(stores => {
        const map = new Map<string, StoreInfo>();
        stores.forEach((s: StoreInfo) => map.set(s.sid, s));
        setStoreMap(map);
      });

    const saved = localStorage.getItem('my-izakaya-sids');
    if (saved) setSelectedSids(JSON.parse(saved));
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

  // 只顯示使用者選的店
  const filteredProducts = selectedSids.length > 0
    ? products.filter(p => selectedSids.includes(p.sid))
    : products;

  const hasData = filteredProducts.length > 0;

  // 整理成店家為單位
  const stores = filteredProducts.reduce((acc: any, p: Product) => {
    const info = storeMap.get(p.sid) || { name: `未知店家 ${p.sid}`, addr: '地址不詳' };
    if (!acc[info.name]) {
      acc[info.name] = {
        addr: info.addr,
        map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.addr)}`,
        products: [],
      };
    }
    acc[info.name].products.push(p);
    return acc;
  }, {});

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-2xl>載入中...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">i珍食即時查詢</h1>

        <div className="text-center mb-10">
          <RefreshButton onClick={handleRefresh} loading={manualLoading} />
          <p className="mt-4 text-lg text-gray-600 font-medium">
            最後更新：{new Date(updatedAt).toLocaleString('zh-TW', {
              timeZone: 'Asia/Taipei',
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit', second: '2-digit',
              hour12: false,
            })}
          </p>
        </div>

        {!hasData ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-5xl font-bold mb-8">非查詢時間或尚未設定店家</p>
            <a href="/manage" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl">
              點我去設定想查的店家
            </a>
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
                <a href={store.map} target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 underline hover:text-blue-800 ml-2">
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