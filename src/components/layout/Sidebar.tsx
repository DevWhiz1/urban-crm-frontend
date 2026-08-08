import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Building2, 
  Home, 
  Users, 
  Wrench, 
  FileText, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  UserPlus,
  List,
  Plus,
  BarChart3,
  UserCheck,
  X,
  Handshake,
  CreditCard,
  Briefcase,
  Receipt
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  roles?: string[];
  children?: MenuItem[];
}

const allMenuItems: MenuItem[] = [
  // ─── ADMIN / ACCOUNTANT ────────────────────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    roles: ['Admin', 'Accountant'],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FileText,
    roles: ['Admin'],
    children: [
      { id: 'add-project', label: 'Add Project', icon: Plus, path: '/dashboard/projects/add', roles: ['Admin'] },
      { id: 'list-projects', label: 'All Projects', icon: List, path: '/dashboard/projects', roles: ['Admin'] },
    ],
  },
  {
    id: 'project-contracts',
    label: 'Project Contracts',
    icon: Handshake,
    roles: ['Admin'],
    children: [
      { id: 'add-project-contract', label: 'Create Contract', icon: Plus, path: '/dashboard/project-contracts/add', roles: ['Admin'] },
      { id: 'list-project-contracts', label: 'All Contracts', icon: List, path: '/dashboard/project-contracts', roles: ['Admin'] },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    roles: ['Admin'],
    children: [
      { id: 'add-payment', label: 'Record Payment', icon: Plus, path: '/dashboard/payments/add', roles: ['Admin'] },
      { id: 'list-payments', label: 'All Payments', icon: List, path: '/dashboard/payments', roles: ['Admin'] },
      { id: 'list-contractor-payments', label: 'Contractor Payments', icon: List, path: '/dashboard/payments/all-contractor', roles: ['Admin'] },
    ],
  },
  {
    id: 'contractors',
    label: 'Contractors',
    icon: Wrench,
    roles: ['Admin'],
    children: [
      { id: 'list-contractors', label: 'All Contractors', icon: List, path: '/dashboard/contractors', roles: ['Admin'] },
    ],
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: UserCheck,
    roles: ['Admin'],
    children: [
      { id: 'list-clients', label: 'All Clients', icon: List, path: '/dashboard/clients', roles: ['Admin'] },
    ],
  },
  {
    id: 'employees',
    label: 'Employees',
    icon: Briefcase,
    roles: ['Admin'],
    children: [
      { id: 'add-employee', label: 'Add Employee', icon: Plus, path: '/dashboard/employees/add', roles: ['Admin'] },
      { id: 'list-employees', label: 'All Employees', icon: List, path: '/dashboard/employees', roles: ['Admin'] },
    ],
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: Receipt,
    roles: ['Admin'],
    children: [
      { id: 'add-expense', label: 'Add Expense', icon: Plus, path: '/dashboard/expenses/add', roles: ['Admin'] },
      { id: 'list-expenses', label: 'All Expenses', icon: List, path: '/dashboard/expenses', roles: ['Admin'] },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    roles: ['Admin'],
    children: [
      { id: 'add-user', label: 'Add User', icon: UserPlus, path: '/dashboard/users/add', roles: ['Admin'] },
      { id: 'list-users', label: 'All Users', icon: List, path: '/dashboard/users', roles: ['Admin'] },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    path: '/dashboard/reports',
    roles: ['Admin'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/dashboard/settings',
    roles: ['Admin'],
  },

  // ─── CLIENT PORTAL ─────────────────────────────────────────────────────────
  {
    id: 'client-dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/client/dashboard',
    roles: ['Client'],
  },
  {
    id: 'client-project',
    label: 'My Project',
    icon: FileText,
    path: '/client/project',
    roles: ['Client'],
  },
  {
    id: 'client-payments',
    label: 'Payments',
    icon: CreditCard,
    path: '/client/payments',
    roles: ['Client'],
  },
  {
    id: 'client-settings',
    label: 'Settings',
    icon: Settings,
    path: '/client/settings',
    roles: ['Client'],
  },

  // ─── CONTRACTOR PORTAL ─────────────────────────────────────────────────────
  {
    id: 'contractor-dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/contractor/dashboard',
    roles: ['Contractor'],
  },
  {
    id: 'contractor-contracts',
    label: 'My Contracts',
    icon: Handshake,
    path: '/contractor/contracts',
    roles: ['Contractor'],
  },
  {
    id: 'contractor-payments',
    label: 'Payments',
    icon: CreditCard,
    path: '/contractor/payments',
    roles: ['Contractor'],
  },
  {
    id: 'contractor-settings',
    label: 'Settings',
    icon: Settings,
    path: '/contractor/settings',
    roles: ['Contractor'],
  },
];

interface SidebarProps {
  isOpen: boolean;
  isDesktopExpanded?: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isDesktopExpanded = true, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role || 'Client';

  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isDesktopExpanded || isHovered;

  const filterMenuByRole = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => !item.roles || item.roles.includes(userRole))
      .map(item => {
        if (item.children) {
          return {
            ...item,
            children: filterMenuByRole(item.children)
          };
        }
        return item;
      })
      .filter(item => !item.children || item.children.length > 0);
  };

  const visibleMenuItems = filterMenuByRole(allMenuItems);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? []
        : [itemId]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (children: MenuItem[]) => 
    children.some(child => child.path && isActive(child.path));

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemExpanded = expandedItems.includes(item.id);
    const isItemActive = item.path ? isActive(item.path) : false;
    const isParentItemActive = hasChildren ? isParentActive(item.children!) : false;

    if (hasChildren) {
      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => {
              toggleExpanded(item.id);
            }}
            className={`w-full flex items-center ${isExpanded ? 'justify-between px-4' : 'justify-center px-0'} py-3 text-left rounded-lg transition-all duration-200 ${
              isParentItemActive
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={!isExpanded ? item.label : undefined}
          >
            <div className={`flex items-center ${isExpanded ? '' : 'justify-center w-full'}`}>
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isExpanded ? 'mr-3' : ''} ${isParentItemActive ? 'text-blue-600' : 'text-gray-500'}`} />
              {isExpanded && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </div>
            {isExpanded && (
              isItemExpanded ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-400" />
              )
            )}
          </button>
          
          {isExpanded && isItemExpanded && (
            <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-100 pl-4 overflow-hidden">
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.path!}
        onClick={() => {
          if (window.innerWidth < 1024) {
            onToggle();
          }
        }}
        title={!isExpanded ? item.label : undefined}
        className={`flex items-center ${isExpanded ? 'px-4' : 'justify-center px-0'} py-3 rounded-lg transition-all duration-200 mb-1 ${
          isItemActive
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
            : 'text-gray-700 hover:bg-gray-50'
        } ${level > 0 && isExpanded ? 'text-sm' : ''}`}
      >
        <item.icon className={`w-5 h-5 flex-shrink-0 ${isExpanded ? 'mr-3' : ''} ${isItemActive ? 'text-blue-600' : 'text-gray-500'}`} />
        {isExpanded && <span className="font-medium whitespace-nowrap">{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
        fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 h-full flex flex-col
        transition-all duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isExpanded ? 'lg:w-64' : 'lg:w-20'}
      `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo and Mobile Close Button */}
        <div className={`p-4 border-b border-gray-200 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} h-16`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="/logo.png" alt="Urban Design" className="w-8 h-8 flex-shrink-0 object-contain" />
            {isExpanded && (
              <div className="whitespace-nowrap transition-opacity duration-300">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Urban Design</h1>
                <p className="text-xs text-gray-500">{userRole} Portal</p>
              </div>
            )}
          </div>
          {isExpanded && (
            <button
              onClick={onToggle}
              className="lg:hidden p-1.5 -mr-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${isExpanded ? 'p-4' : 'p-2'}`}>
          <div className="space-y-1">
            {visibleMenuItems.map(item => renderMenuItem(item))}
          </div>
        </nav>
      </div>
    </>
  );
};