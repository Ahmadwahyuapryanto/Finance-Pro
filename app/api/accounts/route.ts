import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

// 1. GET: Ambil daftar akun milik user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: 'User ID diperlukan' }, { status: 400 });
  }

  try {
    const accounts = await query({
      query: 'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at DESC',
      values: [userId],
    });

    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data' }, { status: 500 });
  }
}

// 2. POST: Tambah akun baru
export async function POST(request: Request) {
  try {
    const { userId, name, type, balance } = await request.json();

    if (!userId || !name || !type) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    const result: any = await query({
      query: 'INSERT INTO accounts (user_id, name, type, balance) VALUES (?, ?, ?, ?)',
      values: [userId, name, type, balance || 0],
    });

    return NextResponse.json({ 
      message: 'Akun berhasil dibuat', 
      id: result.insertId 
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Gagal membuat akun' }, { status: 500 });
  }
}