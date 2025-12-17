'use client';
import BudgetSection from '@/components/BudgetSection';
import { useEffect, useState } from 'react';

export default function BudgetPage() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  if (!user) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Anggaran</h2>
      <BudgetSection userId={user.id} />
    </div>
  );
}