import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

// 1. GET: Ambil Anggaran + Progress Pemakaian Bulan Ini
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ message: 'User ID wajib' }, { status: 400 });

  try {
    // Query ini menggabungkan tabel budgets, categories, dan transactions
    // Tujuannya: Hitung total transaksi (SUM) hanya untuk bulan ini & kategori ini
    const sql = `
      SELECT 
        b.id, 
        b.amount_limit,
        c.name as category_name,
        COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON t.category_id = c.id 
           AND t.user_id = b.user_id
           AND MONTH(t.transaction_date) = MONTH(CURRENT_DATE())
           AND YEAR(t.transaction_date) = YEAR(CURRENT_DATE())
      WHERE b.user_id = ?
      GROUP BY b.id, b.amount_limit, c.name
    `;
    
    // Kita perlu paksa tipe data returned agar angka desimal tidak jadi string aneh
    const budgets = await query({ query: sql, values: [userId] });
    return NextResponse.json(budgets);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Gagal ambil data budget' }, { status: 500 });
  }
}

// 2. POST: Buat/Update Anggaran Baru
export async function POST(request: Request) {
  try {
    const { userId, categoryId, amount } = await request.json();

    // Cek apakah budget untuk kategori ini sudah ada?
    const existing: any = await query({
        query: 'SELECT id FROM budgets WHERE user_id = ? AND category_id = ?',
        values: [userId, categoryId]
    });

    if (existing.length > 0) {
        // Update jika sudah ada
        await query({
            query: 'UPDATE budgets SET amount_limit = ? WHERE id = ?',
            values: [amount, existing[0].id]
        });
    } else {
        // Insert baru jika belum ada
        await query({
            query: 'INSERT INTO budgets (user_id, category_id, amount_limit) VALUES (?, ?, ?)',
            values: [userId, categoryId, amount]
        });
    }

    return NextResponse.json({ message: 'Budget tersimpan' }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Gagal menyimpan budget' }, { status: 500 });
  }
}