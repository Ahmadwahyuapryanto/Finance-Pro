'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Wallet, LineChart, PieChart, 
  HandCoins, LogOut, Menu, X, CreditCard
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Ringkasan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transaksi', href: '/dashboard/transactions', icon: Wallet },
    { name: 'Investasi', href: '/dashboard/investments', icon: LineChart },
    { name: 'Anggaran', href: '/dashboard/budgets', icon: PieChart },
    { name: 'Utang Piutang', href: '/dashboard/debts', icon: HandCoins },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-slate-900 text-white z-50 px-4 py-3 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-500 p-1 rounded">
                <CreditCard size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Finance Pro</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:block border-r border-slate-800
      `}>
        <div className="h-full flex flex-col p-6">
          {/* Logo */}
          <div className="h-10 flex items-center gap-3 mb-10 text-white">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <CreditCard size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight">Finance Pro</h1>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Management</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-medium' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="pt-6 border-t border-slate-800">
            <button 
              onClick={() => {
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Keluar Aplikasi</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}