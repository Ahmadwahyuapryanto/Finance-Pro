'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, Wallet, ArrowDownCircle, ArrowUpCircle, Calendar, AlignLeft, Banknote } from 'lucide-react';

type Transaction = {
  notes: string;
  id: number;
  account_name: string;
  category_name: string;
  amount: string;
  type: 'Income' | 'Expense';
  transaction_date: string;
};

type Account = { id: number; name: string };

export default function TransactionSection({ userId }: { userId: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    accountId: '',
    categoryId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId) {
      fetchData();
      fetch(`/api/accounts?userId=${userId}`).then(res => res.json()).then(setAccounts);
    }
  }, [userId]);

  const fetchData = async () => {
    const res = await fetch(`/api/transactions?userId=${userId}`);
    const data = await res.json();
    setTransactions(data);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const formPayload = new FormData();
    formPayload.append('file', file);

    try {
      const res = await fetch('/api/scan', { method: 'POST', body: formPayload });
      const data = await res.json();
      if (data.amount) {
        setFormData(prev => ({
          ...prev,
          amount: data.amount,
          date: data.date || prev.date,
          notes: data.notes || '',
          categoryId: 'OUT'
        }));
        alert(`Scan Berhasil! Merchant: ${data.notes}`);
      } else {
        alert('Gagal membaca data struk.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat scanning.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId || !formData.amount) return alert("Pilih akun dan isi nominal!");
    const selectedType = formData.categoryId === 'IN' ? 'Income' : 'Expense';
    
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        accountId: formData.accountId,
        categoryId: formData.categoryId === 'IN' ? 1 : 3,
        amount: formData.amount,
        date: formData.date,
        notes: formData.notes,
        type: selectedType
      }),
    });
    setFormData({ ...formData, amount: '', notes: '' });
    window.location.reload(); 
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
      
      {/* 1. FORM INPUT (Sticky) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit lg:sticky lg:top-6 order-last lg:order-first">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-lg font-bold text-slate-800">Catat Transaksi</h3>
                <p className="text-xs text-slate-500">Input manual atau scan struk</p>
            </div>
            
            {/* Tombol AI Scan */}
            <div className="relative">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition disabled:opacity-50 hover:scale-105"
                >
                    {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                    {isScanning ? 'Menganalisa...' : 'Scan Struk'}
                </button>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><Wallet size={12}/> Sumber Dana</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              value={formData.accountId}
              onChange={e => setFormData({...formData, accountId: e.target.value})}
              required
            >
              <option value="">-- Pilih Dompet --</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Jenis</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button type="button" onClick={() => setFormData({...formData, categoryId: 'OUT'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${formData.categoryId === 'OUT' || !formData.categoryId ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Keluar</button>
                    <button type="button" onClick={() => setFormData({...formData, categoryId: 'IN'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${formData.categoryId === 'IN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Masuk</button>
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Tanggal</label>
                <input 
                  type="date" 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><Banknote size={12}/> Nominal (Rp)</label>
            <input 
              type="number" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-lg placeholder:font-normal"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><AlignLeft size={12}/> Catatan</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Contoh: Makan Siang, Gaji..."
            />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl hover:bg-slate-800 font-bold shadow-lg shadow-slate-900/20 transition active:scale-[0.98]">
            Simpan Transaksi
          </button>
        </form>
      </div>

      {/* 2. TABEL RIWAYAT (Lebar) */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Wallet size={20}/></div>
            Riwayat Transaksi
        </h3>
        
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Detail Transaksi</th>
                <th className="px-5 py-4">Akun</th>
                <th className="px-5 py-4 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-10 text-slate-400">Belum ada transaksi tercatat</td></tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${t.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                {t.type === 'Income' ? <ArrowDownCircle size={18}/> : <ArrowUpCircle size={18}/>}
                            </div>
                            <div>
                                <div className="font-semibold text-slate-800">{t.notes || t.category_name || (t.type === 'Income' ? 'Pemasukan' : 'Pengeluaran')}</div>
                                <div className="text-xs text-slate-500">{t.transaction_date.split('T')[0]}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium border border-slate-200">{t.account_name}</span>
                    </td>
                    <td className={`px-5 py-4 text-right font-bold ${t.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'Income' ? '+' : '-'} Rp {parseFloat(t.amount).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}