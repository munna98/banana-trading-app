import React, { useState, createContext, useContext, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  BarChart3,
  Package,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  DollarSign,
  CreditCard,
  ClipboardList,
  FileText,
  Truck,
  Landmark,
  Briefcase,
  BookOpen,
  Tags,
  Boxes,
  ArrowRightLeft,
  Plus,
  Download,
  Upload,
  BookText,
  BookOpenText, // Example for an overview sub-item if needed
} from 'lucide-react';

// Custom Banana SVG Icon Component (retained from your example)
const BananaIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.5 3c-1.5 0-2.8.6-3.8 1.5C12.7 3.6 11.4 3 9.9 3c-2.8 0-5.1 2.3-5.1 5.1 0 .8.2 1.5.5 2.2C3.6 11.4 2.5 13 2.5 14.9c0 2.8 2.3 5.1 5.1 5.1 1.5 0 2.8-.6 3.8-1.5.9.9 2.2 1.5 3.7 1.5 2.8 0 5.1-2.3 5.1-5.1 0-.8-.2-1.5-.5-2.2 1.7-1.1 2.8-2.7 2.8-4.6C22.5 5.3 20.3 3 17.5 3zm-6.4 14.5c-.5.5-1.1.8-1.8.8-1.4 0-2.6-1.1-2.6-2.6 0-.8.4-1.5 1-2 .3-.2.6-.3.9-.3.7 0 1.3.3 1.8.8.5.5.8 1.1.8 1.8s-.3 1.3-.8 1.8-.1.7-.1.7zm5.2-5.2c-.5.5-1.1.8-1.8.8s-1.3-.3-1.8-.8c-.5-.5-.8-1.1-.8-1.8s.3-1.3.8-1.8c.5-.5 1.1-.8 1.8-.8s1.3.3 1.8.8.5.5.8 1.1.8 1.8s-.3 1.3-.8 1.8z"/>
  </svg>
);

const menuItemsConfig = [
  {
    key: 'dashboard',
    path: '/',
    label: 'Dashboard',
    icon: BarChart3,
    description: 'Overview & statistics'
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: Package,
    description: 'Manage your stock',
    subItems: [
      // { key: 'inventoryOverview', path: '/inventory', label: 'Overview', icon: Home }, // Example
      { key: 'allItems', path: '/items', label: 'All Items', icon: Tags },
      { key: 'addItem', path: '/items/add', label: 'Add New Item', icon: Plus },
      { key: 'stockLevels', path: '/inventory/stock', label: 'Stock Levels', icon: Boxes },
    ]
  },
  {
    key: 'trading',
    label: 'Trading',
    icon: ArrowRightLeft,
    description: 'Purchases and Sales',
    subItems: [
        { key: 'purchases', path: '/purchases', label: 'View Purchases', icon: ShoppingCart },
        { key: 'newPurchase', path: '/purchases/add', label: 'New Purchase', icon: Plus },
        { key: 'sales', path: '/sales', label: 'View Sales', icon: DollarSign },
        { key: 'newSale', path: '/sales/add', label: 'New Sale', icon: Plus },
    ]
  },
  {
    key: 'parties',
    label: 'Parties',
    icon: Users,
    description: 'Suppliers & Customers',
    subItems: [
      { key: 'suppliers', path: '/suppliers', label: 'All Suppliers', icon: Truck },
      { key: 'addSupplier', path: '/suppliers/add', label: 'Add Supplier', icon: Plus },
      { key: 'customers', path: '/customers', label: 'All Customers', icon: Users },
      { key: 'addCustomer', path: '/customers/add', label: 'Add Customer', icon: Plus },
    ]
  },
  {
    key: 'financials',
    label: 'Financials',
    icon: Briefcase,
    description: 'Accounting & Payments',
    subItems: [
      { key: 'transactions', path: '/financials/transactions', label: 'All Transactions', icon: CreditCard },
      { key: 'Payment', path: '/transactions/payments', label: 'Payment Out', icon: Upload },
      { key: 'Receipt', path: '/transactions/receipts', label: 'Receipt In', icon: Download },
      { key: 'accounts', path: '/accounts', label: 'Chart of Accounts', icon: BookOpenText },
      { key: 'cashbook', path: '/cashbook', label: 'Cash Book', icon: BookText },
    ]
  },
  {
    key: 'banking',
    path: '/banking',
    label: 'Banking',
    icon: Landmark,
    description: 'Manage bank accounts'
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: FileText,
    description: 'Business intelligence',
    // path: '/reports', // if /reports is the main page for this section
    subItems: [
      { key: 'reportsDashboard', path: '/reports', label: 'Reports Dashboard', icon: FileText },
      { key: 'balanceSheet', path: '/reports/balance-sheet', label: 'Balance Sheet', icon: FileText },
      { key: 'profitAndLoss', path: '/reports/profit-loss', label: 'Profit & Loss', icon: FileText },
      { key: 'inventoryReports', path: '/reports/inventory', label: 'Inventory Reports', icon: FileText },
      { key: 'tradingReports', path: '/reports/trading', label: 'Trading Reports', icon: FileText },
    ]
  },
  { key: 'divider1', type: 'divider' }, // Visual separator
  {
    key: 'settings',
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    description: 'System configuration'
  },
];

const SidebarContext = createContext(null);

const SidebarItem = ({ item }) => {
  const router = useRouter();
  const { expandedMenus, toggleMenu } = useContext(SidebarContext);

  const hasSubmenu = item.subItems && item.subItems.length > 0;

  // An item is "active" if its own path matches, OR if it's a parent and one of its children's paths match.
  let isActive = false;
  if (item.path) {
    isActive = item.path === '/' ? router.pathname === '/' : router.pathname.startsWith(item.path);
  }
  if (!isActive && hasSubmenu) {
    isActive = item.subItems.some(sub => router.pathname === sub.path || router.pathname.startsWith(sub.path + (sub.path.endsWith('/') ? '' : '/')));
  }
  
  const isExpanded = hasSubmenu && expandedMenus[item.key];
  const IconComponent = item.icon;

  const handleItemClick = (e) => {
    if (hasSubmenu) {
      // If the item itself is also a link (e.g., an overview page for the category)
      // and the click is not on the chevron area, we might want to navigate.
      // For now, standard behavior: click toggles submenu.
      // Navigation to parent paths should be via explicit sub-items if needed (e.g. "Category Overview")
      // or if item.path is set and !hasSubmenu.
      toggleMenu(item.key);
      if (item.path && !e.target.closest('.chevron-container')) { // Example of complex click handling
        // To make parent also navigable: router.push(item.path);
        // This example simplifies: parent click toggles submenu.
      }
    } else if (item.path) {
      router.push(item.path);
    }
  };

  return (
    <li>
      <div
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer group transition-all duration-150 ease-in-out
          ${isActive
            ? 'bg-yellow-500 text-white'
            : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
          }`}
        onClick={handleItemClick}
      >
        <div className="flex items-center space-x-3">
          {IconComponent && <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200 transition-colors'}`} />}
          <div className="flex-1">
            <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-slate-50 transition-colors'}`}>{item.label}</span>
            {item.description && <p className={`text-xs ${isActive ? 'text-yellow-100' : 'text-slate-400 group-hover:text-slate-300 transition-colors'}`}>{item.description}</p>}
          </div>
        </div>
        {hasSubmenu && (
          // Add chevron-container class if more specific click target for toggle is needed
          <div className="chevron-container"> 
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        )}
      </div>
      {hasSubmenu && isExpanded && (
        <ul className="ml-5 pl-3 mt-1 space-y-1 border-l border-slate-600">
          {item.subItems.map(subItem => (
            <SubMenuItem key={subItem.key} subItem={subItem} />
          ))}
        </ul>
      )}
    </li>
  );
};

const SubMenuItem = ({ subItem }) => {
  const router = useRouter();
  const isActive = router.pathname === subItem.path;
  const SubIconComponent = subItem.icon;

  return (
    <li>
      <Link href={subItem.path} legacyBehavior>
        <a className={`flex items-center space-x-2.5 px-3 py-2 rounded-md cursor-pointer group transition-colors text-sm
          ${isActive
            ? 'bg-yellow-500 text-white shadow-sm' // Slightly more emphasis for active sub-item
            : 'text-slate-400 hover:bg-slate-600 hover:text-slate-100'
          }`}
        >
          {SubIconComponent ? 
            <SubIconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}`} /> 
            : <div className="w-4 h-4 flex items-center justify-start opacity-80 group-hover:opacity-100"><span className={`w-1.5 h-1.5 ${isActive? 'bg-white' : 'bg-slate-500 group-hover:bg-slate-300'} rounded-full transition-colors`}></span></div>
          }
          <span className={`${isActive ? 'text-white font-medium' : 'text-slate-300 group-hover:text-slate-100 transition-colors'}`}>{subItem.label}</span>
        </a>
      </Link>
    </li>
  );
};

const ModernBananaSidebar = () => {
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState({});

  // Effect to expand parent of active subitem on route change or initial load
  useEffect(() => {
    const newExpanded = { ...expandedMenus };
    let changed = false;
    menuItemsConfig.forEach(item => {
      if (item.subItems && item.subItems.some(sub => router.pathname === sub.path || router.pathname.startsWith(sub.path + '/'))) {
        if (!newExpanded[item.key]) {
          newExpanded[item.key] = true;
          changed = true;
        }
      }
    });
    if (changed) {
      setExpandedMenus(newExpanded);
    }
    // If you want to collapse non-active parent menus:
    // else if (item.subItems && !item.subItems.some(sub => router.pathname.startsWith(sub.path)) && newExpanded[item.key]) {
    //   newExpanded[item.key] = false;
    //   changed = true;
    // }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]); // Rerun when pathname changes

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };
  
  return (
    <SidebarContext.Provider value={{ expandedMenus, toggleMenu }}>
      <aside className="w-72 bg-slate-800 text-white h-screen flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-700">
          <Link href="/" legacyBehavior>
            <a className="flex items-center space-x-3 group">
              <BananaIcon className="w-10 h-10 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-150" />
              <div>
                <h1 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors duration-150">Banana Trade</h1>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-150">Management Suite</p>
              </div>
            </a>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto sidebar-scrollbar">
          <ul className="space-y-1">
            {menuItemsConfig.map((item) => 
              item.type === 'divider' ? (
                <li key={item.key || Math.random()} className="pt-3 pb-2 px-3"> {/* Ensure key for dividers */}
                  <hr className="border-slate-700" />
                </li>
              ) : (
                <SidebarItem key={item.key} item={item} />
              )
            )}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-700/80 rounded-lg p-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-md"></div>
              <div>
                <p className="text-sm font-medium text-slate-200">System Online</p>
                <p className="text-xs text-slate-400">All services operational.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <style jsx global>{`
        .sidebar-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: #475569; // slate-600
          border-radius: 3px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155; // slate-700
        }
      `}</style>
    </SidebarContext.Provider>
  );
};

export default ModernBananaSidebar;

/*
// HOW TO USE in a Next.js page (e.g., _app.js or a layout component):

// src/components/Layout.js
import ModernBananaSidebar from './ModernBananaSidebar'; // Adjust path as needed

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-slate-100">
      <ModernBananaSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

// Then in your _app.js:
// import Layout from '../components/Layout';
// function MyApp({ Component, pageProps }) {
//   return (
//     <Layout>
//       <Component {...pageProps} />
//     </Layout>
//   );
// }
// export default MyApp;
*/