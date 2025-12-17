import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json({ message: 'API Key belum disetting' }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'Tidak ada gambar' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileBase64 = buffer.toString('base64');

    // --- GUNAKAN MODEL SESUAI REQUEST ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Analisis screenshot aplikasi trading ini.
      Ekstrak data transaksi:
      1. Ticker/Nama Aset: (Contoh: BBCA, BTC, ANTM). Ambil kode singkatnya jika ada.
      2. Harga (Price): Harga per unit.
      3. Jumlah (Quantity): Jumlah lot atau coin.
      4. Tipe (Type): BUY (Beli) atau SELL (Jual).
      5. Jenis Aset (AssetType): Tebak apakah ini 'Stock', 'Crypto', atau 'Gold'.

      Output JSON Murni:
      {
        "ticker": "BBCA",
        "price": "10250",
        "quantity": "10",
        "type": "BUY",
        "assetType": "Stock"
      }
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

    console.log("AI Investment Result:", text);

    // Pembersihan JSON
    let cleanText = text.replace(/```json|```/g, '').trim();
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(cleanText);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('AI Scan Error:', error);
    return NextResponse.json({ message: 'Gagal scan trading.' }, { status: 500 });
  }
}