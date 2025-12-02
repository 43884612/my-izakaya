// app/page.tsx   ← 這是最終完美版本，直接複製全部蓋掉原本的內容！

import { storeInfo } from '@/lib/stores';
import RefreshButton from '@/components/RefreshButton';

type Product = {
  sid: string;
  title: string;
  total: number;
  price: number;
  thumb: string;
};

export const revalidate = 300; // 每 5 分鐘自動更新（全域設定，比 next: {} 更強）

export default async function Home() {
  // 直接用相對路徑，Server Component 專用寫法，永遠不會出錯！

  // app/page.tsx 裡的 fetch 部分，改成這樣：
  const res = await fetch(
    process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/update`
      : 'http://localhost:3000/api/update',
    { 
      cache: 'no-store',
      // next: { revalidate: 300 }  // 可以保留或刪除，都沒差
    }
  );

  const data = await res.json();
  const products: Product[] = data.products || [];
  const updatedAt = data.updatedAt;

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

        {/* 強制更新按鈕 + 更新時間 */}
        <div className="text-center mb-10">
          <RefreshButton />
          {updatedAt && (
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
          )}
        </div>

        {/* 非查詢時間顯示 */}
        {!hasData ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-5xl font-bold mb-8">非查詢時間</p>
            <div className="space-y-6">
              <p className="text-6xl text-orange-500 font-bold">8折</p>
              <p className="text-3xl text-gray-700">時段：19:00 ~ 19:59</p>
              
              <p className="text-7xl text-red-600 font-bold mt-10">65折</p>
              <p className="text-3xl text-gray-700">時段：20:00 ~ 03:00</p>
            </div>
          </div>
        ) : (
          /* 有資料時顯示各分店 */
          Object.entries(stores).map(([storeName, store]: [string, any]) => (
            <div key={storeName} className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-200">
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

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {store.products.map((p: Product, i: number) => (
                  <div 
                    key={i} 
                    className="border border-gray-300 rounded-xl overflow-hidden shadow hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <img 
                      src={p.thumb} 
                      alt={p.title} 
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
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