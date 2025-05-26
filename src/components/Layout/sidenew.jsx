import React, { useState } from 'react';
import { 
  Package, 
  Users, 
  UserCheck, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  PiggyBank,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// Custom Banana SVG Icon Component
const BananaIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.5 3c-1.5 0-2.8.6-3.8 1.5C12.7 3.6 11.4 3 9.9 3c-2.8 0-5.1 2.3-5.1 5.1 0 .8.2 1.5.5 2.2C3.6 11.4 2.5 13 2.5 14.9c0 2.8 2.3 5.1 5.1 5.1 1.5 0 2.8-.6 3.8-1.5.9.9 2.2 1.5 3.7 1.5 2.8 0 5.1-2.3 5.1-5.1 0-.8-.2-1.5-.5-2.2 1.7-1.1 2.8-2.7 2.8-4.6C22.5 5.3 20.3 3 17.5 3zm-6.4 14.5c-.5.5-1.1.8-1.8.8-1.4 0-2.6-1.1-2.6-2.6 0-.8.4-1.5 1-2 .3-.2.6-.3.9-.3.7 0 1.3.3 1.8.8.5.5.8 1.1.8 1.8s-.3 1.3-.8 1.8-.1.7-.1.7zm5.2-5.2c-.5.5-1.1.8-1.8.8s-1.3-.3-1.8-.8c-.5-.5-.8-1.1-.8-1.8s.3-1.3.8-1.8c.5-.5 1.1-.8 1.8-.8s1.3.3 1.8.8c.5.5.8 1.1.8 1.8s-.3 1.3-.8 1.8z"/>
  </svg>
);

const SidebarMenuItem = ({ icon: Icon, label, isActive = false, hasSubmenu = false, isExpanded = false, onClick, children }) => {
  return (
    <div>
      <div 
        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
          isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {hasSubmenu && (
          isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        )}
      </div>
      {hasSubmenu && isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

const SubMenuItem = ({ label, isActive = false, onClick }) => (
  <div 
    className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
    }`}
    onClick={onClick}
  >
    {label}
  </div>
);

const BananaTradingSidebar = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const handleMenuClick = (itemKey, hasSubmenu = false) => {
    if (hasSubmenu) {
      toggleMenu(itemKey);
    } else {
      setActiveItem(itemKey);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BananaIcon className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-lg font-bold text-gray-800">Banana Trading</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <SidebarMenuItem 
          icon={BarChart3} 
          label="Dashboard" 
          isActive={activeItem === 'dashboard'}
          onClick={() => handleMenuClick('dashboard')}
        />

        {/* Inventory Section */}
        <SidebarMenuItem 
          icon={Package} 
          label="Inventory" 
          hasSubmenu={true}
          isExpanded={expandedMenus.inventory}
          onClick={() => handleMenuClick('inventory', true)}
        >
          <SubMenuItem label="Items" isActive={activeItem === 'items'} onClick={() => setActiveItem('items')} />
          <SubMenuItem label="Stock Levels" isActive={activeItem === 'stock'} onClick={() => setActiveItem('stock')} />
        </SidebarMenuItem>

        {/* Trading Section */}
        <SidebarMenuItem 
          icon={TrendingUp} 
          label="Trading" 
          hasSubmenu={true}
          isExpanded={expandedMenus.trading}
          onClick={() => handleMenuClick('trading', true)}
        >
          <SubMenuItem label="Purchases" isActive={activeItem === 'purchases'} onClick={() => setActiveItem('purchases')} />
          <SubMenuItem label="Sales" isActive={activeItem === 'sales'} onClick={() => setActiveItem('sales')} />
        </SidebarMenuItem>

        {/* Contacts Section */}
        <SidebarMenuItem 
          icon={Users} 
          label="Contacts" 
          hasSubmenu={true}
          isExpanded={expandedMenus.contacts}
          onClick={() => handleMenuClick('contacts', true)}
        >
          <SubMenuItem label="Suppliers" isActive={activeItem === 'suppliers'} onClick={() => setActiveItem('suppliers')} />
          <SubMenuItem label="Customers" isActive={activeItem === 'customers'} onClick={() => setActiveItem('customers')} />
        </SidebarMenuItem>

        {/* Payments & Receipts Section */}
        <SidebarMenuItem 
          icon={CreditCard} 
          label="Payments" 
          hasSubmenu={true}
          isExpanded={expandedMenus.payments}
          onClick={() => handleMenuClick('payments', true)}
        >
          <SubMenuItem label="Payments Out" isActive={activeItem === 'payments-out'} onClick={() => setActiveItem('payments-out')} />
          <SubMenuItem label="Receipts In" isActive={activeItem === 'receipts-in'} onClick={() => setActiveItem('receipts-in')} />
        </SidebarMenuItem>

        {/* Accounting Section */}
        <SidebarMenuItem 
          icon={Receipt} 
          label="Accounting" 
          hasSubmenu={true}
          isExpanded={expandedMenus.accounting}
          onClick={() => handleMenuClick('accounting', true)}
        >
          <SubMenuItem label="Transactions" isActive={activeItem === 'transactions'} onClick={() => setActiveItem('transactions')} />
          <SubMenuItem label="Accounts" isActive={activeItem === 'accounts'} onClick={() => setActiveItem('accounts')} />
          <SubMenuItem label="Cash Book" isActive={activeItem === 'cashbook'} onClick={() => setActiveItem('cashbook')} />
        </SidebarMenuItem>

        {/* Banking Section */}
        <SidebarMenuItem 
          icon={PiggyBank} 
          label="Banking" 
          isActive={activeItem === 'banking'}
          onClick={() => handleMenuClick('banking')}
        />

        {/* Reports Section */}
        <SidebarMenuItem 
          icon={BarChart3} 
          label="Reports" 
          hasSubmenu={true}
          isExpanded={expandedMenus.reports}
          onClick={() => handleMenuClick('reports', true)}
        >
          <SubMenuItem label="Financial Reports" isActive={activeItem === 'financial-reports'} onClick={() => setActiveItem('financial-reports')} />
          <SubMenuItem label="Inventory Reports" isActive={activeItem === 'inventory-reports'} onClick={() => setActiveItem('inventory-reports')} />
          <SubMenuItem label="Trading Reports" isActive={activeItem === 'trading-reports'} onClick={() => setActiveItem('trading-reports')} />
        </SidebarMenuItem>

        {/* Settings */}
        <div className="pt-4 border-t border-gray-200">
          <SidebarMenuItem 
            icon={Settings} 
            label="Settings" 
            isActive={activeItem === 'settings'}
            onClick={() => handleMenuClick('settings')}
          />
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>System Online</span>
        </div>
      </div>
    </div>
  );
};

export default BananaTradingSidebar;