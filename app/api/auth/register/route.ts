import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import bcrypt from 'bcryptjs';

// Ini fungsi untuk menangani request POST (kirim data)
export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    // 1. Validasi data sederhana
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { message: 'Semua data wajib diisi!' },
        { status: 400 }
      );
    }

    // 2. Cek apakah email sudah terdaftar
    // Kita pakai 'any' dulu agar mudah, nanti bisa diperketat tipe datanya
    const existingUsers: any = await query({
      query: 'SELECT * FROM users WHERE email = ?',
      values: [email],
    });

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar!' },
        { status: 409 }
      );
    }

    // 3. Acak password (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Masukkan ke Database
    await query({
      query: 'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
      values: [email, hashedPassword, fullName],
    });

    return NextResponse.json(
      { message: 'Registrasi berhasil!' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}