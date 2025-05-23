// src/components/Layout/Sidebar.jsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Sidebar = () => {
  const router = useRouter();
  
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: '📊',
      description: 'Overview & Statistics'
    },
    {
      title: 'Items',
      path: '/items',
      icon: '🍌',
      description: 'Manage Banana Types',
      subItems: [
        { title: 'View All Items', path: '/items' },
        { title: 'Add New Item', path: '/items/add' }
      ]
    },
    {
      title: 'Suppliers',
      path: '/suppliers',
      icon: '🚛',
      description: 'Supplier Management',
      subItems: [
        { title: 'View All Suppliers', path: '/suppliers' },
        { title: 'Add New Supplier', path: '/suppliers/add' }
      ]
    },
    {
      title: 'Customers',
      path: '/customers',
      icon: '👥',
      description: 'Customer Management',
      subItems: [
        { title: 'View All Customers', path: '/customers' },
        { title: 'Add New Customer', path: '/customers/add' }
      ]
    },
    {
      title: 'Purchases',
      path: '/purchases',
      icon: '📦',
      description: 'Purchase Orders',
      subItems: [
        { title: 'View Purchases', path: '/purchases' },
        { title: 'New Purchase', path: '/purchases/add' }
      ]
    },
    {
      title: 'Sales',
      path: '/sales',
      icon: '💰',
      description: 'Sales Management',
      subItems: [
        { title: 'View Sales', path: '/sales' },
        { title: 'New Sale', path: '/sales/add' }
      ]
    },
    {
      title: 'Transactions',
      path: '/transactions',
      icon: '💳',
      description: 'Payments & Receipts',
      subItems: [
        { title: 'All Transactions', path: '/transactions' },
        { title: 'Make Payment', path: '/transactions/payments' },
        { title: 'Receive Payment', path: '/transactions/receipts' }
      ]
    },
    {
      title: 'Expenses',
      path: '/expenses',
      icon: '📋',
      description: 'Track Expenses',
      subItems: [
        { title: 'View Expenses', path: '/expenses' },
        { title: 'Add Expense', path: '/expenses/add' }
      ]
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: '📈',
      description: 'Business Reports',
      subItems: [
        { title: 'Reports Dashboard', path: '/reports' },
        { title: 'Balance Sheet', path: '/reports/balance-sheet' },
        { title: 'Profit & Loss', path: '/reports/profit-loss' },
        { title: 'Custom Report', path: '/reports/custom-report' }
      ]
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(path);
  };

  const isSubItemActive = (path) => {
    return router.pathname === path;
  };

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🍌</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Banana Trade</h2>
            <p className="text-gray-400 text-sm">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <div className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors
                  ${isActive(item.path) 
                    ? 'bg-yellow-600 text-white' 
                    : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  }
                `}>
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs opacity-75">{item.description}</p>
                  </div>
                </div>
              </Link>
              
              {/* Sub-menu items */}
              {item.subItems && isActive(item.path) && (
                <ul className="ml-8 mt-2 space-y-1">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.path}>
                      <Link href={subItem.path}>
                        <div className={`
                          px-4 py-2 rounded-md cursor-pointer transition-colors text-sm
                          ${isSubItemActive(subItem.path)
                            ? 'bg-yellow-500 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }
                        `}>
                          {subItem.title}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium">System Active</p>
              <p className="text-xs text-gray-400">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;