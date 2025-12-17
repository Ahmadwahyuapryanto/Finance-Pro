import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json({ message: 'API Key Gemini belum disetting' }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'Tidak ada gambar diupload' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileBase64 = buffer.toString('base64');

    // Kita pakai model yang terbukti ada di akunmu
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // --- STRATEGI BARU: MINTA FORMAT TEKS BIASA ---
    // Kita hindari JSON.parse karena rentan error di model lama
    const prompt = `
      Analisis gambar struk belanja ini.
      Cari 3 informasi utama dan tuliskan dalam format berikut:
      
      HARGA: [Hanya angka total bayar, hapus Rp/titik]
      TANGGAL: [Format YYYY-MM-DD]
      TOKO: [Nama Toko]

      Contoh jawaban yang benar:
      HARGA: 50000
      TANGGAL: 2024-12-17
      TOKO: Indomaret

      Jangan tambahkan kalimat pembuka atau penutup. Langsung data saja.
    `;

    const imagePart = {
      inlineData: {
        data: fileBase64,
        mimeType: file.type,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log("--- DEBUG AI TEXT ---");
    console.log(text); // Kita lihat jawabannya di terminal
    console.log("---------------------");

    // --- PARSING MANUAL (LEBIH AMAN DARI JSON) ---
    // Kita cari teks berdasarkan kata kuncinya menggunakan Regex
    
    // 1. Ambil Harga (Cari angka setelah kata HARGA:)
    const amountMatch = text.match(/HARGA:\s*(\d+)/i);
    const amount = amountMatch ? amountMatch[1] : null;

    // 2. Ambil Tanggal (Cari teks setelah TANGGAL:)
    const dateMatch = text.match(/TANGGAL:\s*([0-9-]+)/i);
    let date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    // 3. Ambil Toko (Cari teks setelah TOKO: sampai akhir baris)
    const notesMatch = text.match(/TOKO:\s*(.+)/i);
    const notes = notesMatch ? notesMatch[1].trim() : "Merchant";

    // Cek hasil parsing
    if (!amount) {
        return NextResponse.json({ message: 'Gagal menemukan total harga dalam struk.' }, { status: 422 });
    }

    // Susun data manual
    const data = {
        amount: amount,
        date: date,
        notes: notes
    };

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('AI Scan Error (Server):', error);
    return NextResponse.json({ 
        message: 'Terjadi kesalahan sistem saat memproses gambar.',
        detail: error.message 
    }, { status: 500 });
  }
}