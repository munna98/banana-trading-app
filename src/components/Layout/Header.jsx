// src/components/Layout/Header.jsx
import React from 'react';
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();
  
  const getPageTitle = () => {
    const path = router.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path.includes('/items')) return 'Items Management';
    if (path.includes('/suppliers')) return 'Suppliers Management';
    if (path.includes('/customers')) return 'Customers Management';
    if (path.includes('/purchases')) return 'Purchase Management';
    if (path.includes('/sales')) return 'Sales Management';
    if (path.includes('/transactions')) return 'Transactions';
    if (path.includes('/expenses')) return 'Expenses';
    if (path.includes('/reports')) return 'Reports';
    
    return 'Banana Trading System';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {getCurrentDate()}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              Banana Trading Business
            </p>
            <p className="text-xs text-gray-500">
              Management System
            </p>
          </div>
          
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">🍌</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;