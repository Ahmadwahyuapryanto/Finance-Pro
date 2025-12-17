'use client';
import DebtSection from '@/components/DebtSection';
import { useEffect, useState } from 'react';

export default function DebtPage() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  if (!user) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manajemen Utang Piutang</h2>
      <DebtSection userId={user.id} />
    </div>
  );
}