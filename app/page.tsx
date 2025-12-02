// app/page.tsx ← 最終宇宙無敵版（直接全部蓋掉！）

import { storeInfo } from '@/lib/stores';
import RefreshButton from '@/components/RefreshButton';

type Product = {
  sid: string;
  title: string;
  total: number;
  price: number;
  thumb: string;
};

// 解決 DYNAMIC_SERVER_USAGE 錯誤 + 強制每次請求都重新抓資料
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 萬一全部掛掉也不會白屏的預設資料
const fallbackData = {
  products: [] as Product[],
  updatedAt: new Date().toISOString(),
};

export default async function Home() {
  let data = fallbackData;
  let errorMessage: string | null = null;

  try {
    // 自動判斷本地 / Vercel / 自訂域名
    const apiUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api/update`
        : process.env.NEXT_PUBLIC_URL
          ? `${process.env.NEXT_PUBLIC_URL}/api/update`
          : 'http://localhost:3000/api/update';

    const res = await fetch(apiUrl, {
      cache: 'no-store',
      next: { tags: ['izakaya-data'] },
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await res.json();
      } else {
        errorMessage = '資料格式異常';
      }
    } else {
      errorMessage = `API 錯誤 ${res.status}`;
    }
  } catch (error) {
    console.error('抓取 i珍食 資料失敗:', error);
    errorMessage = '連線異常';
  }

  const products: Product[] = data.products || [];
  const updatedAt = data.updatedAt || new Date().toISOString();

  // 分店整理
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

  const hasData = products.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          i珍食即時查詢
        </h1>

        {/* 按鈕 + 正確的台灣時間 */}
        <div className="text-center mb-10">
          <RefreshButton />
          <p className="mt-4 text-lg text-gray-600 font-medium">
            最後更新：
            {new Date(updatedAt).toLocaleString('zh-TW', {
              timeZone: 'Asia/Taipei',   // 強制台灣時區（永遠正確！）
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })}
          </p>
          {errorMessage && (
            <p className="mt-2 text-red-500 text-sm">
              ⚠️ {errorMessage}（晚上 7 點後才會有商品喔）
            </p>
          )}
        </div>

        {/* 沒資料時顯示（白天正常、掛掉也不會白屏） */}
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
          /* 有資料時顯示各分店 */
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