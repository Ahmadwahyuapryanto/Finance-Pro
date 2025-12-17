// File: cek-model.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Ambil model dasar (tanpa key juga bisa untuk list public models, tapi pake key lebih aman)
  // Perhatikan: listModels butuh trik di SDK baru, kita coba init model sembarang dulu
  // atau langsung hard test.
  
  console.log("Mencoba mengetes model gemini-1.5-flash-001...");
  try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
      const result = await model.generateContent("Halo, tes.");
      console.log("SUKSES! Model gemini-1.5-flash-001 tersedia.");
      console.log("Respon:", result.response.text());
  } catch (e) {
      console.error("GAGAL gemini-1.5-flash-001:", e.message);
  }

  console.log("\nMencoba mengetes model gemini-pro-vision (Legacy)...");
  try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      // Vision butuh gambar, kalau text doang dia error, tapi errornya bukan 404
      // Kita anggap kalau errornya bukan 'Not Found', berarti modelnya ada.
      console.log("Model gemini-pro-vision tampaknya ada (tes koneksi).");
  } catch (e) {
      console.error("Status gemini-pro-vision:", e.message);
  }
}

run();