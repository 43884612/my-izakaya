// app/page.tsx ← 最終無敵防崩版（直接全部複製蓋掉！）

import { storeInfo } from '@/lib/stores';
import RefreshButton from '@/components/RefreshButton';

type Product = {
  sid: string;
  title: string;
  total: number;
  price: number;
  thumb: string;
};

// 預設空資料（萬一 API 完全掛掉也不會白屏）
const fallbackData = {
  products: [] as Product[],
  updatedAt: new Date().toISOString(),
};

export const revalidate = 300; // 每 5 分鐘自動再試

export default async function Home() {
  let data = fallbackData;
  let errorMessage = null;

  try {
    // 萬能 URL：支援 Vercel + 本地開發 + 自訂域名
    const apiUrl = 
      process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/api/update`
        : process.env.NEXT_PUBLIC_URL
        ? `${process.env.NEXT_PUBLIC_URL}/api/update`
        : 'http://localhost:3000/api/update';

    const res = await fetch(apiUrl, {
      cache: 'no-store', // 每次都抓最新
      next: { tags: ['izakaya-data'] }, // 可被 router.refresh() 清除快取
    });

    // 檢查是否真的拿到 JSON（避免拿到 HTML 404 頁面）
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType?.includes('application/json')) {
      data = await res.json();
    } else {
      // API 回傳錯誤或 HTML
      const text = await res.text();
      console.error('API 非 JSON 回應:', res.status, text.substring(0, 200));
      errorMessage = `API 錯誤 ${res.status}`;
    }
  } catch (error) {
    console.error('抓取 i珍食 資料失敗:', error);
    errorMessage = '網路連線異常';
  }

  const products: Product[] = data.products || [];
  const updatedAt = data.updatedAt || new Date().toISOString();

  // 分店整理
  const stores = products.reduce((acc: any, p: Product) => {
    const info = storeInfo[p.sid] || { name: `未知分店 ${p.sid}`, addr: "地址不詳" };
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

  const hasData = Object.keys(stores).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">i珍食即時查詢</h1>

        <div className="text-center mb-10">
          <RefreshButton />
          <p className="mt-4 text-lg text-gray-600 font-medium">
            最後更新：{new Date(updatedAt).toLocaleString('zh-TW', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
          {errorMessage && (
            <p className="mt-2 text-red-500 text-sm">⚠️ {errorMessage}，請稍後再試</p>
          )}
        </div>

        {/* 完全不會白屏的內容顯示 */}
        {!hasData ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-5xl font-bold mb-8">非查詢時間</p>
            <div className="space-y-6">
              <p className="text-6xl text-orange-500 font-bold">8折</p>
              <p className="text-3xl text-gray-700">時段：19:00 ~ 19:59</p>
              <p className="text-7xl text-red-600 font-bold mt-10">65折</p>
              <p className="text-3xl text-gray-700">時段：20:00 ~ 03:00</p>
            </div>
            {errorMessage && (
              <p className="mt-10 text-yellow-600 text-xl">資料抓取中... 請稍後點更新</p>
            )}
          </div>
        ) : (
          /* 有資料時顯示 */
          Object.entries(stores).map(([storeName, store]: [string, any]) => (
            <div key={storeName} className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-200">
              <h2 className="text-3xl font-bold mb-3 text-gray-800">{storeName}</h2>
              <p className="text-gray-600 mb-6">
                地址：
                <a href={store.map} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 ml-2">
                  {store.addr}
                </a>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {store.products.map((p: Product, i: number) => (
                  <div key={i} className="border border-gray-300 rounded-xl overflow-hidden shadow hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <img src={p.thumb} alt={p.title} className="w-full h-48 object-cover" loading="lazy" />
                    <div className="p-4 bg-white">
                      <p className="font-semibold text-sm line-clamp-2 mb-2">
                        {p.title.replace("[i珍食]", "").trim()}
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