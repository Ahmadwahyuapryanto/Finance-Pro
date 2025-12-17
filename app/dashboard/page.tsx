'use client';

import { useEffect, useState } from 'react';
import AccountSection from '@/components/AccountSection'; // Kita pakai ini untuk display akun aja
import DashboardCharts from '@/components/DashboardCharts';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Data State untuk Grafik
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
    } else {
      const u = JSON.parse(storedUser);
      setUser(u);
      loadDashboardData(u.id);
    }
  }, [router]);

  const loadDashboardData = async (userId: number) => {
    // 1. Ambil Data Investasi untuk Grafik
    const resInvest = await fetch(`/api/investments?userId=${userId}`);
    const dataInvest = await resInvest.json();
    // Proses sederhana hitung total value (sama seperti logic InvestmentSection)
    const holdings: any = {};
    dataInvest.forEach((t: any) => {
        if(!holdings[t.asset_ticker]) holdings[t.asset_ticker] = { ticker: t.asset_ticker, totalQty: 0, avgPrice: 0, totalValue: 0 };
        const item = holdings[t.asset_ticker];
        const qty = parseFloat(t.quantity);
        const price = parseFloat(t.price);
        if(t.type === 'BUY') {
            const curVal = item.totalQty * item.avgPrice;
            const newVal = (curVal + (qty*price));
            item.totalQty += qty;
            item.avgPrice = item.totalQty > 0 ? newVal / item.totalQty : 0;
        } else { item.totalQty -= qty; }
        item.totalValue = item.totalQty * item.avgPrice;
    });
    setPortfolio(Object.values(holdings).filter((i:any) => i.totalQty > 0.000001));

    // 2. Ambil Data Budget
    const resBudget = await fetch(`/api/budgets?userId=${userId}`);
    const dataBudget = await resBudget.json();
    setBudgets(dataBudget);

    // 3. Ambil Data Utang
    const resDebt = await fetch(`/api/debts?userId=${userId}`);
    const dataDebt = await resDebt.json();
    setDebts(dataDebt);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Ringkasan</h2>
        <p className="text-gray-500">Halo {user.name}, ini kondisi keuanganmu saat ini.</p>
      </div>

      {/* 1. KARTU DOMPET & AKUN (Hanya View) */}
      {/* Kita gunakan AccountSection yg sudah ada, dia otomatis handle view & add. 
          Kalau mau view only, nanti kita modif AccountSection sedikit, tapi sementara ok. */}
      <AccountSection userId={user.id} />

      {/* 2. GRAFIK PROFESIONAL */}
      <DashboardCharts portfolioData={portfolio} budgetData={budgets} />

      {/* 3. RINGKASAN UTANG/PIUTANG (Mini View) */}
      <div className="bg-white p-6 rounded-lg shadow">
         <h3 className="text-lg font-bold text-gray-800 mb-4">Catatan Utang Aktif</h3>
         {debts.length === 0 ? <p className="text-gray-400">Aman, tidak ada utang/piutang.</p> : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {debts.map((d: any) => (
                     <div key={d.id} className={`p-3 rounded border flex justify-between ${d.type === 'Payable' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                         <div>
                             <p className="font-bold text-gray-700">{d.person_name}</p>
                             <p className="text-xs text-gray-500">{d.type === 'Payable' ? 'Hutang Saya' : 'Piutang'}</p>
                         </div>
                         <p className="font-mono font-bold">Rp {parseFloat(d.amount).toLocaleString('id-ID')}</p>
                     </div>
                 ))}
             </div>
         )}
      </div>
    </div>
  );
}