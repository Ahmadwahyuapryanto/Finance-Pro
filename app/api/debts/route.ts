import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

// 1. GET: Ambil Daftar Utang/Piutang (Hanya yang BELUM lunas)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ message: 'User ID wajib' }, { status: 400 });

  try {
    // Kita urutkan berdasarkan tanggal jatuh tempo terdekat
    const sql = `
      SELECT * FROM debts 
      WHERE user_id = ? AND is_paid = FALSE 
      ORDER BY due_date ASC
    `;
    const data = await query({ query: sql, values: [userId] });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal ambil data utang' }, { status: 500 });
  }
}

// 2. POST: Catat Utang Baru
export async function POST(request: Request) {
  try {
    const { userId, name, amount, date, type } = await request.json();

    await query({
      query: `INSERT INTO debts (user_id, person_name, amount, due_date, type) VALUES (?, ?, ?, ?, ?)`,
      values: [userId, name, amount, date, type]
    });

    return NextResponse.json({ message: 'Berhasil dicatat' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mencatat' }, { status: 500 });
  }
}

// 3. PATCH: Tandai Lunas
export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();

    await query({
      query: 'UPDATE debts SET is_paid = TRUE WHERE id = ?',
      values: [id]
    });

    return NextResponse.json({ message: 'Status diperbarui' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal update' }, { status: 500 });
  }
}