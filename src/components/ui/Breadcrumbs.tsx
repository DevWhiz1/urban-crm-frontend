import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const segmentLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  contractors: 'Contractors',
  clients: 'Clients',
  projects: 'Projects',
  'project-contracts': 'Project Contracts',
  payments: 'Payments',
  users: 'Users',
  reports: 'Reports',
  settings: 'Settings',
  add: 'Add New',
  contractor: 'Contractor Payment',
  'all-contractor': 'Contractor Payments',
  material: 'Material Payment',
  project: 'My Project',
  // Client portal
  client: 'Client Portal',
  // Contractor portal
  contracts: 'My Contracts',
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const location = useLocation();

  const getAutoBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/dashboard' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      if (segment === 'dashboard') return;

      const formattedLabel = segmentLabels[segment] || 
        segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      breadcrumbs.push({
        label: formattedLabel,
        path: currentPath,
      });
    });

    return breadcrumbs;
  };

  const finalItems = items || getAutoBreadcrumbs();

  if (!finalItems || finalItems.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center text-sm font-medium text-gray-500 mb-6 flex-wrap gap-1.5 ${className}`} aria-label="Breadcrumb">
      {finalItems.map((item, index) => {
        const isLast = index === finalItems.length - 1;
        const isHome = index === 0;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            {isLast ? (
              <span className="text-gray-900 font-semibold flex items-center gap-1.5" aria-current="page">
                {isHome && <Home className="w-4 h-4 text-gray-500" />}
                {item.label}
              </span>
            ) : item.onClick ? (
              <button
                onClick={item.onClick}
                className="hover:text-blue-600 transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                {isHome && <Home className="w-4 h-4 text-gray-400" />}
                {item.label}
              </button>
            ) : item.path ? (
              <Link
                to={item.path}
                className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
              >
                {isHome && <Home className="w-4 h-4 text-gray-400" />}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1.5">
                {isHome && <Home className="w-4 h-4 text-gray-400" />}
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
