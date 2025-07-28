import React from 'react';
import { Link } from 'react-router-dom';
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
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      path: '/dashboard/payments/contractor'
    },
    {
      id: 'material',
      title: 'Add Material Payment',
      description: 'Record payments for materials, supplies, and equipment purchases',
      icon: Package,
      color: 'from-green-600 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      path: '/dashboard/payments/material'
    },
    {
      id: 'project',
      title: 'Add Payment for Project',
      description: 'Record general project payments and miscellaneous expenses',
      icon: Building,
      color: 'from-purple-600 to-violet-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      path: '/dashboard/payments/project'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Management</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the type of payment you want to record. Each payment type is designed for specific business needs.
          </p>
        </div>

        {/* Payment Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {paymentTypes.map((type) => (
            <Link
              key={type.id}
              to={type.path}
              className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Gradient Header */}
              <div className={`h-32 bg-gradient-to-r ${type.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 p-6 h-full flex items-center justify-center">
                  <type.icon className="w-12 h-12 text-white" />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full"></div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {type.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {type.description}
                </p>
                
                {/* Action Button */}
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 ${type.bgColor} rounded-lg flex items-center justify-center`}>
                    <type.icon className={`w-5 h-5 ${type.iconColor}`} />
                  </div>
                  <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                    <span className="mr-2">Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-2xl transition-colors"></div>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Payment Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contractor Payments</h3>
              <p className="text-gray-600 text-sm">Track payments to contractors for labor and services</p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Material Payments</h3>
              <p className="text-gray-600 text-sm">Record payments for materials and supplies</p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Payments</h3>
              <p className="text-gray-600 text-sm">Manage general project expenses and payments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};