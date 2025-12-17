'use client';
import InvestmentSection from '@/components/InvestmentSection';
import { useEffect, useState } from 'react';

export default function InvestmentPage() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  if (!user) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Trading & Portofolio</h2>
      <InvestmentSection userId={user.id} />
    </div>
  );
}