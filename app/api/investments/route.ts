import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

// 1. GET: Ambil Riwayat Trading
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ message: 'User ID wajib' }, { status: 400 });

  try {
    const sql = `
      SELECT t.id, t.asset_ticker, t.type, t.price, t.quantity, t.total_amount, t.trade_date,
             a.name as asset_name, a.type as asset_type
      FROM trades t
      JOIN assets a ON t.asset_ticker = a.ticker
      WHERE t.user_id = ?
      ORDER BY t.trade_date DESC
    `;
    const trades = await query({ query: sql, values: [userId] });
    return NextResponse.json(trades);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal ambil data trading' }, { status: 500 });
  }
}

// 2. POST: Catat Transaksi (Dengan Auto-Register Asset)
export async function POST(request: Request) {
  try {
    // assetType ditambahkan dari frontend (Stock/Crypto/Gold)
    const { userId, accountId, ticker, type, price, quantity, date, assetType } = await request.json();

    if (!userId || !accountId || !ticker || !price || !quantity) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    // A. Pastikan Ticker Huruf Besar
    const cleanTicker = ticker.toUpperCase().trim();
    const cleanType = assetType || 'Stock'; // Default Stock jika kosong

    // B. Cek/Buat Aset di Database (PENTING AGAR INPUT MANUAL BERHASIL)
    // Kita gunakan INSERT IGNORE agar kalau sudah ada tidak error
    await query({
        query: `INSERT IGNORE INTO assets (ticker, name, type) VALUES (?, ?, ?)`,
        values: [cleanTicker, cleanTicker, cleanType]
    });

    // C. Hitung Total
    // Jika Stock (Saham), asumsi quantity adalah LOT, jadi dikali 100
    // Kecuali user input manual quantity lembar, tapi biar konsisten kita anggap input frontend sudah handle itu.
    // Di sini kita terima quantity mentah dari frontend.
    const total = parseFloat(price) * parseFloat(quantity);
    
    // D. Simpan Log Trading
    await query({
      query: `INSERT INTO trades (user_id, account_id, asset_ticker, type, price, quantity, total_amount, trade_date) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [userId, accountId, cleanTicker, type, price, quantity, total, date]
    });

    // E. Update Saldo Akun
    const operator = type === 'BUY' ? '-' : '+';
    await query({
      query: `UPDATE accounts SET balance = balance ${operator} ? WHERE id = ?`,
      values: [total, accountId]
    });

    return NextResponse.json({ message: 'Trading berhasil dicatat' }, { status: 201 });

  } catch (error) {
    console.error('Trading Error:', error);
    return NextResponse.json({ message: 'Gagal mencatat trading' }, { status: 500 });
  }
}