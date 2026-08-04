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
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    roles: ['Admin', 'Contractor', 'Client']
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FileText,
    roles: ['Admin', 'Contractor', 'Client'],
    children: [
      { id: 'add-project', label: 'Add Project', icon: Plus, path: '/dashboard/projects/add', roles: ['Admin'] },
      { id: 'list-projects', label: 'All Projects', icon: List, path: '/dashboard/projects', roles: ['Admin', 'Contractor', 'Client'] }
    ]
  },
  {
    id: 'project-contracts',
    label: 'Project Contracts',
    icon: Handshake,
    roles: ['Admin', 'Contractor'],
    children: [
      { id: 'add-project-contract', label: 'Create Contract', icon: Plus, path: '/dashboard/project-contracts/add', roles: ['Admin'] },
      { id: 'list-project-contracts', label: 'All Contracts', icon: List, path: '/dashboard/project-contracts', roles: ['Admin', 'Contractor'] }
    ]
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    roles: ['Admin', 'Contractor', 'Client'],
    children: [
      { id: 'add-payment', label: 'Record Payment', icon: Plus, path: '/dashboard/payments/add', roles: ['Admin'] },
      { id: 'list-payments', label: 'All Payments', icon: List, path: '/dashboard/payments', roles: ['Admin', 'Contractor', 'Client'] },
      { id: 'list-contarctor-payments', label: 'All Contractor Payments', icon: List, path: '/dashboard/payments/all-contractor', roles: ['Admin', 'Contractor'] }
    ]
  },
  {
    id: 'contractors',
    label: 'Contractors',
    icon: Wrench,
    roles: ['Admin'],
    children: [
      { id: 'list-contractors', label: 'All Contractors', icon: List, path: '/dashboard/contractors', roles: ['Admin'] }
    ]
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: UserCheck,
    roles: ['Admin'],
    children: [
      { id: 'list-clients', label: 'All Clients', icon: List, path: '/dashboard/clients', roles: ['Admin'] }
    ]
  },
  {
    id: 'employees',
    label: 'Employees',
    icon: Briefcase,
    roles: ['Admin'],
    children: [
      { id: 'add-employee', label: 'Add Employee', icon: Plus, path: '/dashboard/employees/add', roles: ['Admin'] },
      { id: 'list-employees', label: 'All Employees', icon: List, path: '/dashboard/employees', roles: ['Admin'] }
    ]
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: Receipt,
    roles: ['Admin'],
    children: [
      { id: 'add-expense', label: 'Add Expense', icon: Plus, path: '/dashboard/expenses/add', roles: ['Admin'] },
      { id: 'list-expenses', label: 'All Expenses', icon: List, path: '/dashboard/expenses', roles: ['Admin'] }
    ]
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    roles: ['Admin'],
    children: [
      { id: 'add-user', label: 'Add User', icon: UserPlus, path: '/dashboard/users/add', roles: ['Admin'] },
      { id: 'list-users', label: 'All Users', icon: List, path: '/dashboard/users', roles: ['Admin'] }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    path: '/dashboard/reports',
    roles: ['Admin']
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/dashboard/settings',
    roles: ['Admin']
  }
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role || 'Client';

  const [expandedItems, setExpandedItems] = useState<string[]>(['projects', 'project-contracts', 'payments', 'contractors', 'clients']);

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
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (children: MenuItem[]) => 
    children.some(child => child.path && isActive(child.path));

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isItemActive = item.path ? isActive(item.path) : false;
    const isParentItemActive = hasChildren ? isParentActive(item.children!) : false;

    if (hasChildren) {
      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => toggleExpanded(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-200 ${
              isParentItemActive
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <item.icon className={`w-5 h-5 mr-3 ${isParentItemActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className="font-medium">{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {isExpanded && (
            <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-100 pl-4">
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
        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${
          isItemActive
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
            : 'text-gray-700 hover:bg-gray-50'
        } ${level > 0 ? 'text-sm' : ''}`}
      >
        <item.icon className={`w-5 h-5 mr-3 ${isItemActive ? 'text-blue-600' : 'text-gray-500'}`} />
        <span className="font-medium">{item.label}</span>
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
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 h-full flex flex-col
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Urban Design" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Urban Design</h1>
              <p className="text-xs text-gray-500">{userRole} Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {visibleMenuItems.map(item => renderMenuItem(item))}
          </div>
        </nav>
      </div>
    </>
  );
};