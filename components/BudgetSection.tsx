'use client';

import { useState, useEffect } from 'react';
import { PieChart, Plus, X } from 'lucide-react';

type Budget = {
  id: number;
  category_name: string;
  amount_limit: string;
  spent: string;
};

type Category = { id: number; name: string };

export default function BudgetSection({ userId }: { userId: number }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ categoryId: '', amount: '' });

  useEffect(() => {
    if (userId) {
      loadBudgets();
      setCategories([
        { id: 3, name: 'Makanan' }, { id: 4, name: 'Transportasi' },
        { id: 5, name: 'Belanja' }, { id: 6, name: 'Tagihan' }, { id: 7, name: 'Hiburan' }
      ]);
    }
  }, [userId]);

  const loadBudgets = async () => {
    const res = await fetch(`/api/budgets?userId=${userId}`);
    const data = await res.json();
    setBudgets(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.amount) return;
    await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...formData }),
    });
    setFormData({ categoryId: '', amount: '' });
    setShowForm(false);
    loadBudgets();
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]';
    if (percent >= 75) return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
    return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><PieChart size={20} /></div>
                Anggaran Bulanan
            </h3>
            <p className="text-xs text-slate-500 ml-11">Jaga pengeluaranmu agar tetap hemat</p>
        </div>
        
        <button 
            onClick={() => setShowForm(!showForm)}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${showForm ? 'bg-slate-100 text-slate-600' : 'bg-purple-600 text-white shadow-md hover:bg-purple-700'}`}
        >
            {showForm ? <><X size={16}/> Batal</> : <><Plus size={16}/> Set Budget</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-purple-50 rounded-xl border border-purple-100 animate-in slide-in-from-top-2">
            <h4 className="text-sm font-bold text-purple-900 mb-3">Buat Anggaran Baru</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select 
                    className="p-3 border border-purple-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    required
                >
                    <option value="">-- Kategori --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input 
                    type="number" placeholder="Batas Maksimal (Rp)"
                    className="p-3 border border-purple-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    required
                />
                <button type="submit" className="bg-purple-600 text-white rounded-xl p-3 text-sm font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/20">Simpan</button>
            </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.length === 0 ? (
            <div className="col-span-2 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400">Belum ada anggaran yang diatur.</p>
            </div>
        ) : (
            budgets.map((b) => {
                const limit = parseFloat(b.amount_limit);
                const spent = parseFloat(b.spent || '0');
                const percent = Math.min((spent / limit) * 100, 100);
                const realPercent = (spent / limit) * 100;

                return (
                    <div key={b.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition bg-white group relative overflow-hidden">
                        <div className="flex justify-between items-center mb-3 relative z-10">
                            <span className="font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-lg text-sm">{b.category_name}</span>
                            <span className="text-xs font-medium text-slate-400">
                                {realPercent.toFixed(0)}% Terpakai
                            </span>
                        </div>
                        
                        <div className="flex items-end gap-1 mb-2 relative z-10">
                            <span className={`text-xl font-bold ${realPercent > 100 ? 'text-rose-600' : 'text-slate-800'}`}>
                                Rp {spent.toLocaleString('id-ID')}
                            </span>
                            <span className="text-xs text-slate-400 mb-1"> / {limit.toLocaleString('id-ID')}</span>
                        </div>

                        <div className="w-full bg-slate-100 rounded-full h-3 relative z-10">
                            <div 
                                className={`h-3 rounded-full transition-all duration-700 ease-out ${getProgressColor(realPercent)}`} 
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>

                        {/* Background Decoration */}
                        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 ${realPercent > 100 ? 'bg-rose-500' : 'bg-purple-500'}`}></div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
}