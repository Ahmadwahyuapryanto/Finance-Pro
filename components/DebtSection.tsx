'use client';

import { useState, useEffect } from 'react';
import { HandCoins, CheckCircle, Calendar, Plus, User, ArrowRight } from 'lucide-react';

type Debt = {
  id: number;
  person_name: string;
  amount: string;
  due_date: string;
  type: 'Payable' | 'Receivable';
};

export default function DebtSection({ userId }: { userId: number }) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', date: '', type: 'Payable' });

  useEffect(() => { if (userId) loadData(); }, [userId]);

  const loadData = async () => {
    const res = await fetch(`/api/debts?userId=${userId}`);
    const data = await res.json();
    setDebts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/debts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...form }),
    });
    setForm({ name: '', amount: '', date: '', type: 'Payable' });
    setShowForm(false);
    loadData();
  };

  const markAsPaid = async (id: number) => {
    if (!confirm('Tandai ini sudah lunas?')) return;
    await fetch('/api/debts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  const payables = debts.filter(d => d.type === 'Payable');
  const receivables = debts.filter(d => d.type === 'Receivable');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><HandCoins size={20} /></div>
                Utang & Piutang
            </h3>
        </div>
        <button 
            onClick={() => setShowForm(!showForm)}
            className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 transition"
        >
            <Plus size={16}/> Catat Baru
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-sm font-bold text-slate-700">Tambah Catatan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                    <select 
                        className="w-full p-3 border border-slate-300 rounded-xl text-slate-800 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                        value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    >
                        <option value="Payable">⚠️ Saya Berutang (Payable)</option>
                        <option value="Receivable">💰 Orang Berutang (Receivable)</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Nama Pihak</label>
                    <input 
                        type="text" placeholder="Nama Orang / Aplikasi"
                        className="w-full p-3 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Jumlah (Rp)</label>
                    <input 
                        type="number" placeholder="0"
                        className="w-full p-3 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                        value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Jatuh Tempo</label>
                    <input 
                        type="date"
                        className="w-full p-3 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                        value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                    />
                </div>
            </div>
            <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-700 transition">Simpan Catatan</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* KOLOM KIRI: SAYA BERUTANG (Merah) */}
          <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100">
              <h4 className="font-bold text-rose-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div> Saya Berutang
              </h4>
              {payables.length === 0 ? (
                  <div className="text-center py-6 text-rose-300/70 text-sm">Tidak ada hutang. Bagus!</div>
              ) : (
                  <ul className="space-y-3">
                      {payables.map(d => (
                          <li key={d.id} className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex justify-between items-center group hover:shadow-md transition">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <User size={14} className="text-rose-400"/>
                                      <p className="font-bold text-slate-800">{d.person_name}</p>
                                  </div>
                                  <p className="text-rose-600 font-bold">Rp {parseFloat(d.amount).toLocaleString('id-ID')}</p>
                                  {d.due_date && (
                                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 bg-slate-50 w-fit px-2 py-0.5 rounded">
                                          <Calendar size={10}/> Tempo: {d.due_date.split('T')[0]}
                                      </p>
                                  )}
                              </div>
                              <button onClick={() => markAsPaid(d.id)} className="text-slate-300 hover:text-rose-600 transition p-2 hover:bg-rose-50 rounded-full" title="Tandai Lunas">
                                  <CheckCircle size={24}/>
                              </button>
                          </li>
                      ))}
                  </ul>
              )}
          </div>

          {/* KOLOM KANAN: ORANG BERUTANG (Hijau) */}
          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
              <h4 className="font-bold text-emerald-700 mb-4 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Piutang (Milik Saya)
              </h4>
              {receivables.length === 0 ? (
                  <div className="text-center py-6 text-emerald-300/70 text-sm">Tidak ada yang berhutang padamu.</div>
              ) : (
                  <ul className="space-y-3">
                      {receivables.map(d => (
                          <li key={d.id} className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex justify-between items-center group hover:shadow-md transition">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <User size={14} className="text-emerald-400"/>
                                      <p className="font-bold text-slate-800">{d.person_name}</p>
                                  </div>
                                  <p className="text-emerald-600 font-bold">Rp {parseFloat(d.amount).toLocaleString('id-ID')}</p>
                                  {d.due_date && (
                                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 bg-slate-50 w-fit px-2 py-0.5 rounded">
                                          <Calendar size={10}/> Tempo: {d.due_date.split('T')[0]}
                                      </p>
                                  )}
                              </div>
                              <button onClick={() => markAsPaid(d.id)} className="text-slate-300 hover:text-emerald-600 transition p-2 hover:bg-emerald-50 rounded-full" title="Uang Diterima">
                                  <CheckCircle size={24}/>
                              </button>
                          </li>
                      ))}
                  </ul>
              )}
          </div>

      </div>
    </div>
  );
}