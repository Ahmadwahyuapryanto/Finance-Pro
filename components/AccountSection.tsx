'use client';

import { useState, useEffect } from 'react';
import { Wallet, Plus, CreditCard, Landmark } from 'lucide-react';

type Account = {
  id: number;
  name: string;
  type: string;
  balance: string;
};

export default function AccountSection({ userId }: { userId: number }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', type: 'Bank', balance: '' });

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`/api/accounts?userId=${userId}`);
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userId) fetchAccounts(); }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newAccount.name) return;
    await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...newAccount }),
    });
    setIsAdding(false);
    setNewAccount({ name: '', type: 'Bank', balance: '' });
    fetchAccounts();
  };

  // Helper untuk warna gradient berdasarkan tipe akun
  const getGradient = (type: string) => {
    switch(type) {
        case 'Bank': return 'from-blue-600 to-indigo-700';
        case 'E-Wallet': return 'from-emerald-500 to-teal-700';
        case 'Cash': return 'from-orange-400 to-red-500';
        case 'Investment': return 'from-purple-600 to-pink-700';
        default: return 'from-slate-600 to-slate-800';
    }
  };

  const getIcon = (type: string) => {
      if (type === 'Cash') return <Wallet className="opacity-80" />;
      if (type === 'Bank') return <Landmark className="opacity-80" />;
      return <CreditCard className="opacity-80" />;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-lg font-bold text-slate-800">Dompet & Akun</h2>
            <p className="text-slate-500 text-sm">Sumber dana aktif Anda</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm font-medium flex items-center gap-2 transition"
        >
          {isAdding ? 'Batal' : <><Plus size={16}/> Tambah</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                    type="text" placeholder="Nama Akun (misal: BCA)" 
                    className="p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={newAccount.name} onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                />
                <select 
                    className="p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={newAccount.type} onChange={(e) => setNewAccount({...newAccount, type: e.target.value})}
                >
                    <option value="Cash">Tunai</option>
                    <option value="Bank">Bank</option>
                    <option value="E-Wallet">E-Wallet</option>
                    <option value="Investment">Investasi</option>
                </select>
                <input 
                    type="number" placeholder="Saldo Awal" 
                    className="p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newAccount.balance} onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                />
            </div>
            <button type="submit" className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 w-full md:w-auto shadow-lg shadow-indigo-200">Simpan Akun</button>
        </form>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
            <div className="h-24 bg-slate-100 rounded-xl"></div>
        </div>
      ) : accounts.length === 0 ? (
        <p className="text-slate-500 text-center py-4">Belum ada akun.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className={`relative overflow-hidden p-5 rounded-2xl text-white shadow-lg bg-gradient-to-br ${getGradient(acc.type)} transition hover:scale-[1.02] cursor-pointer`}>
              {/* Dekorasi Background */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    {getIcon(acc.type)}
                </div>
                <span className="text-xs font-medium bg-black/20 px-2 py-1 rounded-full border border-white/10">{acc.type}</span>
              </div>
              
              <div>
                <p className="text-sm opacity-80 mb-1">{acc.name}</p>
                <p className="text-2xl font-bold tracking-tight">
                  Rp {parseFloat(acc.balance).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}