'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, Camera, Loader2 } from 'lucide-react';

type Trade = {
  id: number;
  asset_ticker: string;
  asset_name: string;
  type: 'BUY' | 'SELL';
  price: string;
  quantity: string;
  total_amount: string;
  trade_date: string;
};

type PortfolioItem = {
  ticker: string;
  totalQty: number;
  avgPrice: number;
  totalValue: number;
};

export default function InvestmentSection({ userId }: { userId: number }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // State Form
  const [form, setForm] = useState({
    accountId: '',
    ticker: '',      // Manual Input
    assetType: 'Stock', // Pilihan Tipe
    type: 'BUY',
    price: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0]
  });

  // State AI
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Data
  useEffect(() => {
    if (userId) {
      fetchData();
      fetch(`/api/accounts?userId=${userId}`).then(res => res.json()).then(setAccounts);
    }
  }, [userId]);

  const fetchData = async () => {
    const res = await fetch(`/api/investments?userId=${userId}`);
    const data = await res.json();
    setTrades(data);
    calculatePortfolio(data);
  };

  const calculatePortfolio = (tradeData: Trade[]) => {
    const holdings: Record<string, PortfolioItem> = {};
    const sortedTrades = [...tradeData].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());

    sortedTrades.forEach(t => { 
      const qty = parseFloat(t.quantity);
      const price = parseFloat(t.price);
      
      if (!holdings[t.asset_ticker]) {
        holdings[t.asset_ticker] = { ticker: t.asset_ticker, totalQty: 0, avgPrice: 0, totalValue: 0 };
      }
      const item = holdings[t.asset_ticker];

      if (t.type === 'BUY') {
        const currentTotalVal = item.totalQty * item.avgPrice;
        const buyVal = qty * price;
        const newTotalQty = item.totalQty + qty;
        item.avgPrice = newTotalQty > 0 ? (currentTotalVal + buyVal) / newTotalQty : 0;
        item.totalQty = newTotalQty;
      } else {
        item.totalQty -= qty;
      }
      item.totalValue = item.totalQty * item.avgPrice;
    });
    setPortfolio(Object.values(holdings).filter(i => i.totalQty > 0.000001));
  };

  // --- FITUR BARU: AI SCAN SCREENSHOT ---
  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('/api/investments/scan', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if (data.ticker) {
            setForm(prev => ({
                ...prev,
                ticker: data.ticker,
                price: data.price || '',
                quantity: data.quantity || '',
                type: data.type === 'SELL' ? 'SELL' : 'BUY',
                assetType: data.assetType || 'Stock'
            }));
            alert(`Scan Berhasil! Aset: ${data.ticker}`);
        } else {
            alert('Gagal mendeteksi data trading.');
        }
    } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat scan.');
    } finally {
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accountId || !form.price || !form.quantity || !form.ticker) return alert("Lengkapi data!");

    let finalQuantity = parseFloat(form.quantity);
    
    // Konversi Lot ke Lembar KHUSUS SAHAM
    if (form.assetType === 'Stock') {
        finalQuantity = finalQuantity * 100;
    }

    await fetch('/api/investments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          userId, 
          ...form, 
          quantity: finalQuantity 
      }),
    });

    setForm({ ...form, ticker: '', price: '', quantity: '' });
    fetchData(); 
    window.location.reload(); 
  };

  // Hitung Estimasi Total Realtime
  const rawPrice = parseFloat(form.price) || 0;
  const rawQty = parseFloat(form.quantity) || 0;
  const multiplier = form.assetType === 'Stock' ? 100 : 1; 
  const estimatedTotal = rawPrice * rawQty * multiplier;

  // ... (Kode logic di atas tetap sama, ganti mulai dari return)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
      
      {/* 1. PORTFOLIO CARD */}
      <div className="lg:col-span-2 space-y-8">
        {/* Kartu Portfolio */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><TrendingUp size={20} /></div>
                Portofolio Aset
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolio.length === 0 ? (
                    <div className="col-span-2 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-400">Belum ada aset investasi.</p>
                    </div>
                ) : (
                    portfolio.map((item) => (
                        <div key={item.ticker} className="group p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">{item.ticker}</h4>
                                    <span className="text-xs font-medium text-slate-500">Avg: Rp {item.avgPrice.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    {item.totalQty.toLocaleString('id-ID')} Unit
                                </div>
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs text-slate-400">Total Value</span>
                                <span className="font-bold text-slate-800">Rp {item.totalValue.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Tabel History yang Lebih Bersih */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Riwayat Trading Terakhir</h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-4 py-3">Tgl</th>
                            <th className="px-4 py-3">Aset</th>
                            <th className="px-4 py-3">Tipe</th>
                            <th className="px-4 py-3 text-right">Harga</th>
                            <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {trades.slice(0, 5).map(t => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 text-slate-600">{t.trade_date.split('T')[0]}</td>
                                <td className="px-4 py-3 font-semibold text-slate-800">{t.asset_ticker}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {t.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right text-slate-600">{parseFloat(t.price).toLocaleString('id-ID')}</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900">{parseFloat(t.total_amount).toLocaleString('id-ID')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* 2. FORM INPUT MODERN */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit sticky top-6">
        
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Input Order</h3>
            
            <div className="relative">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleScan} />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-indigo-100 transition disabled:opacity-50 border border-indigo-100"
                >
                    {isScanning ? <><Loader2 className="w-3 h-3 animate-spin" /> Menganalisa...</> : <><Camera className="w-3 h-3" /> AI Scan</>}
                </button>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Sumber Dana</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={form.accountId} onChange={e => setForm({...form, accountId: e.target.value})} required
            >
              <option value="">-- Pilih Akun --</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} (Rp {parseFloat(acc.balance).toLocaleString()})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Tipe Aset</label>
                <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.assetType} onChange={e => setForm({...form, assetType: e.target.value})}
                >
                    <option value="Stock">Saham</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Gold">Emas</option>
                    <option value="Mutual Fund">Reksadana</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Posisi</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button type="button" onClick={() => setForm({...form, type: 'BUY'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${form.type === 'BUY' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>BUY</button>
                    <button type="button" onClick={() => setForm({...form, type: 'SELL'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${form.type === 'SELL' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>SELL</button>
                </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Ticker / Kode</label>
            <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold uppercase focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-300 tracking-wider"
                value={form.ticker} onChange={e => setForm({...form, ticker: e.target.value.toUpperCase()})} placeholder="CONTOH: BBCA" required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Harga</label>
                <input 
                  type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0" required
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Jml {form.assetType === 'Stock' ? '(Lot)' : ''}</label>
                <input 
                  type="number" step="any" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" required
                />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-lg shadow-slate-900/20">
             <div className="text-xs opacity-70">Total Estimasi</div>
             <div className="text-xl font-bold">Rp {estimatedTotal.toLocaleString('id-ID')}</div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/30 transition active:scale-[0.98]">
            Konfirmasi Transaksi
          </button>
        </form>
      </div>

    </div>
  );
}