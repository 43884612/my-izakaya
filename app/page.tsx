'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { storeInfo } from '@/lib/stores';
import RefreshButton from '@/components/RefreshButton';

type Product = {
  sid: string;
  title: string;
  total: number;
  price: number;
  thumb: string;
};

// 🚀 最穩定寫法：使用相對路徑
const API_URL = "/api/update";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  const text = await res.text();
  if (text.startsWith('<!doctype') || text.includes('Error')) {
    throw new Error('API 錯誤頁面');
  }
  const jsonData = JSON.parse(text);
  if (!Array.isArray(jsonData.products)) {
    throw new Error('無效資料');
  }
  return {
    products: jsonData.products,
    updatedAt: jsonData.updatedAt || new Date().toISOString(),
  };
};

export default function Home() {
  const { data, error, mutate, isLoading } = useSWR(API_URL, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
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
  const errorMessage = error ? error.message : null;

  const stores = products.reduce((acc: any, p: Product) => {
    const info = storeInfo[p.sid] || { name: `未知分店 ${p.sid}`, addr: '地址不詳' };
    if (!acc[info.name]) {
      acc[info.name] = {
        addr: info.addr,
        map: `https://www.google.com/maps/search/${encodeURIComponent(info.addr)}`,
        products: [],
      };
    }
    acc[info.name].products.push(p);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">載入中...</p>
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

          {errorMessage && !hasData && (
            <p className="mt-2 text-red-500 text-sm">
              ⚠️ {errorMessage}（自動重試中...）
            </p>
          )}
        </div>

        {!hasData ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-5xl font-bold mb-8">非查詢時間</p>
            <div className="space-y-6">
              <p className="text-6xl text-orange-500 font-bold">8折</p>
              <p className="text-3xl text-gray-700">19:00 ∼ 19:59</p>
              <p className="text-7xl text-red-600 font-bold mt-10">65折</p>
              <p className="text-3xl text-gray-700">20:00 ∼ 03:00</p>
            </div>
          </div>
        ) : (
          Object.entries(stores).map(([storeName, store]: [string, any]) => (
            <div
              key={storeName}
              className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-200"
            >
              <h2 className="text-3xl font-bold mb-3 text-gray-800">{storeName}</h2>
              <p className="text-gray-600 mb-6">
                地址：
                <a
                  href={store.map}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 ml-2"
                >
                  {store.addr}
                </a>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {store.products.map((p: Product, i: number) => (
                  <div
                    key={i}
                    className="border border-gray-300 rounded-xl overflow-hidden shadow hover:shadow-2xl transition-all duration-300"
                  >
                    <img
                      src={p.thumb}
                      alt={p.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="p-4 bg-white">
                      <p className="font-semibold text-sm line-clamp-2 mb-2">
                        {p.title.replace('[i珍食]', '').trim()}
                      </p>
                      <div className="flex justify-between items-end">
                        <p className="text-red-600 font-bold text-lg">
                          剩餘 {p.total}
                        </p>
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
