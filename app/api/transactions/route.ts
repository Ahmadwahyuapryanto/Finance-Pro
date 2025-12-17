import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

// 1. GET: Ambil daftar transaksi user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ message: 'User ID wajib' }, { status: 400 });

  try {
    // Kita join tabel transactions dengan accounts dan categories agar dapat nama akun/kategorinya
    const sql = `
      SELECT t.id, t.amount, t.transaction_date, t.notes, 
             a.name as account_name, 
             c.name as category_name, c.type as type
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT 10
    `;
    
    const transactions = await query({ query: sql, values: [userId] });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal ambil data' }, { status: 500 });
  }
}

// 2. POST: Tambah Transaksi & Update Saldo
export async function POST(request: Request) {
  try {
    const { userId, accountId, categoryId, amount, date, notes, type } = await request.json();

    // Validasi
    if (!userId || !accountId || !amount || !type) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    // A. Simpan Transaksi
    await query({
      query: `INSERT INTO transactions (user_id, account_id, category_id, amount, transaction_date, notes) 
              VALUES (?, ?, ?, ?, ?, ?)`,
      values: [userId, accountId, categoryId, amount, date, notes]
    });

    // B. Update Saldo Akun (PENTING!)
    // Jika Income (+) saldo, Jika Expense (-) saldo
    const operator = type === 'Income' ? '+' : '-';
    
    await query({
      query: `UPDATE accounts SET balance = balance ${operator} ? WHERE id = ?`,
      values: [amount, accountId]
    });

    return NextResponse.json({ message: 'Transaksi berhasil disimpan' }, { status: 201 });

  } catch (error) {
    console.error('Transaction Error:', error);
    return NextResponse.json({ message: 'Gagal menyimpan transaksi' }, { status: 500 });
  }
}