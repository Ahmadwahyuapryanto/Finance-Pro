'use client';

import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardCharts({ 
  portfolioData, 
  budgetData 
}: { 
  portfolioData: any[], 
  budgetData: any[] 
}) {

  // Format Data untuk Grafik Budget (Limit vs Terpakai)
  const budgetChartData = budgetData.map(b => ({
    name: b.category_name,
    Batas: parseFloat(b.amount_limit),
    Terpakai: parseFloat(b.spent || 0)
  }));

  // Format Data untuk Portfolio (Asset Allocation)
  const portfolioChartData = portfolioData.map(p => ({
    name: p.ticker,
    value: p.totalValue
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* 1. GRAFIK ALOKASI ASET (PIE CHART) */}
      <div className="bg-white p-6 rounded-lg shadow min-h-[350px]">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Alokasi Investasi</h3>
        {portfolioChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={portfolioChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                // PERBAIKAN 1: Menangani percent yang mungkin undefined
                label={(props: any) => {
                  const name = props?.name ?? '';
                  const percent = props?.percent ?? 0;
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
              >
                {portfolioChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              {/* PERBAIKAN 2: Ubah tipe value menjadi 'any' agar TypeScript tidak protes */}
              <Tooltip formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center mt-20">Belum ada data investasi</p>
        )}
      </div>

      {/* 2. GRAFIK BUDGET MONITORING (BAR CHART) */}
      <div className="bg-white p-6 rounded-lg shadow min-h-[350px]">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Monitoring Anggaran</h3>
        {budgetChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={budgetChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tickFormatter={(val) => `${val/1000}k`} />
              {/* PERBAIKAN 3: Ubah tipe value menjadi 'any' di sini juga */}
              <Tooltip formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
              <Legend />
              <Bar dataKey="Terpakai" stackId="a" fill="#ef4444" />
              <Bar dataKey="Batas" stackId="b" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center mt-20">Belum ada anggaran diset</p>
        )}
      </div>

    </div>
  );
}