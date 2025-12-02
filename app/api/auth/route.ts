// app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  // 從 Vercel 環境變數讀取正確密碼（超級安全）
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (password === correctPassword) {
    return NextResponse.json({ success: true }, { status: 200 });
  } else {
    return NextResponse.json({ error: '密碼錯誤' }, { status: 401 });
  }
}