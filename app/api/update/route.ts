// app/api/update/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

const base_url = "https://opennow.foodomo.com/app/wxapp.php";
const params = {
  i: "1",
  m: "ht_wmps",
  c: "entry",
  do: "mobile",
  lang: "zh-cn",
  ctrl: "wmall",
  ac: "store",
  op: "goods",
  ta: "list",
  from: "vue",
  u: "wap",
  cid: "exp",
  child_id: "expChild",
  keyword: "",
  type: "is_recommend",
  value: "",
  page: "1",
  psize: "40",
  newstype: "1",
};

const sids = ["2661", "2558", "2728", "3240", "3254"]; // 從 input.csv 來的

async function queryGood(sid: string) {
  try {
    const res = await axios.get(base_url, {
      params: { ...params, sid },
      timeout: 10000,
    });
    const goods = res.data?.message?.message?.goods || [];
    return goods
      .filter((item: any) => item.title && item.total != null && item.price && item.thumb)
      .map((item: any) => ({
        sid,
        title: item.title,
        total: item.total,
        price: item.price,
        thumb: item.thumb,
      }));
  } catch (error) {
    console.error(`SID ${sid} 抓取失敗:`, error);
    return [];
  }
}

export async function GET() {
  const allResults: any[] = [];

  for (const sid of sids) {
    const result = await queryGood(sid);
    allResults.push(...result);
    await new Promise(r => setTimeout(r, 300)); // 避免被擋
  }

  // 存到 Vercel KV（推薦）或直接回傳
  return NextResponse.json({ products: allResults, updatedAt: new Date().toISOString() });
}