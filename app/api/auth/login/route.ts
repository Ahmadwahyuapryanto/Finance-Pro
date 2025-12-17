import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Cek User di Database
    const users: any = await query({
      query: 'SELECT * FROM users WHERE email = ?',
      values: [email],
    });

    // Jika user tidak ditemukan
    if (users.length === 0) {
      return NextResponse.json(
        { message: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    const user = users[0];

    // 2. Bandingkan Password (Input vs Hash di Database)
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json(
        { message: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    // 3. Login Berhasil!
    // Kita kirim balik data user (kecuali password) untuk disimpan di browser
    const userData = {
      id: user.id,
      email: user.email,
      name: user.full_name,
      currency: user.currency_pref
    };

    return NextResponse.json(
      { 
        message: 'Login berhasil!',
        user: userData 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}