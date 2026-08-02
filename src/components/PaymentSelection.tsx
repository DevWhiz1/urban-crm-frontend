import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from './ui/Breadcrumbs';
import {
  CreditCard,
  Wrench,
  Package,
  Building,
  ArrowRight,
  DollarSign,
  Users,
  Truck
} from 'lucide-react';

export const PaymentSelection: React.FC = () => {
  const paymentTypes = [
    {
      id: 'contractor',
      title: 'Add Payment for Contractor',
      description: 'Record payments made to contractors for project work and services',
      icon: Wrench,
      color: 'bg-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      path: '/dashboard/payments/contractor'
    },
    {
      id: 'material',
      title: 'Add Material Payment',
      description: 'Record payments for materials, supplies, and equipment purchases',
      icon: Package,
      color: 'bg-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      path: '/dashboard/payments/material'
    },
    {
      id: 'project',
      title: 'Add Payment for Project',
      description: 'Record general project payments and miscellaneous expenses',
      icon: Building,
      color: 'bg-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      path: '/dashboard/payments/project'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Payments', path: '/dashboard/payments' },
          { label: 'Select Payment Type' }
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Record New Payment</h1>
        <p className="text-sm text-gray-500 mt-1">Select the category of payment you wish to record</p>
      </div>

      {/* Payment Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paymentTypes.map((type) => (
          <Link
            key={type.id}
            to={type.path}
            className="group relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className={`w-12 h-12 ${type.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <type.icon className={`w-6 h-6 ${type.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {type.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {type.description}
              </p>
            </div>

            <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
              <span className="mr-1.5">Continue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};