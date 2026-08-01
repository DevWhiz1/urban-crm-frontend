import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { 
  Users, 
  Wrench, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  DollarSign,
  Building,
  UserCheck,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  RefreshCw,
  Eye,
  Star,
  CreditCard,
  Banknote,
  Target
} from 'lucide-react';
import { fetchDashboardStats, DashboardStats } from '../../services/dashboardApi';
import { PaymentAnalytics } from './PaymentAnalytics';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const dashboardData = await fetchDashboardStats();
      setStats(dashboardData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
            <p className="text-gray-600 mb-4">Unable to load dashboard statistics. Please try again.</p>
            <button
              onClick={loadDashboardStats}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={loadDashboardStats}
              className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.projects.totalRevenue)}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  All Projects
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900">{stats.projects.active}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Target className="w-4 h-4 mr-1" />
                  {stats.projects.total} Total
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Contractors */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Contractors</p>
                <p className="text-3xl font-bold text-gray-900">{stats.contractors.active}</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <Star className="w-4 h-4 mr-1" />
                  {stats.contractors.averageRating}/5 Avg Rating
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Active Clients */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Clients</p>
                <p className="text-3xl font-bold text-gray-900">{stats.clients.active}</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <UserCheck className="w-4 h-4 mr-1" />
                  {stats.clients.newThisMonth} New This Month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Project Statistics */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building className="w-5 h-5 text-blue-600 mr-2" />
                Project Statistics
              </h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Projects</span>
                <span className="font-semibold text-gray-900">{stats.projects.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active</span>
                <span className="font-semibold text-green-600">{stats.projects.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-semibold text-blue-600">{stats.projects.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Planning</span>
                <span className="font-semibold text-yellow-600">{stats.projects.planning}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Value</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(stats.projects.averageProjectValue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Analytics */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                Payment Analytics
              </h3>
              <Banknote className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="font-semibold text-gray-900">{formatCurrency(stats.payments.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Paid This Month</span>
                <span className="font-semibold text-green-600">{formatCurrency(stats.payments.paidThisMonth)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">{formatCurrency(stats.payments.pendingAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="font-semibold text-red-600">{formatCurrency(stats.payments.overdueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Contractor Performance */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Wrench className="w-5 h-5 text-orange-600 mr-2" />
                Contractor Performance
              </h3>
              <Star className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Contractors</span>
                <span className="font-semibold text-gray-900">{stats.contractors.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active</span>
                <span className="font-semibold text-green-600">{stats.contractors.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="font-semibold text-orange-600">{stats.contractors.averageRating}/5</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Top Contractor</span>
                  <span className="font-semibold text-gray-900 text-right max-w-32 truncate">{stats.contractors.topContractor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                Monthly Revenue
              </h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.monthlyRevenue.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-20">{month.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((month.revenue / Math.max(...stats.monthlyRevenue.map(m => m.revenue))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-20 text-right">{formatCurrency(month.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Status Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="w-5 h-5 text-blue-600 mr-2" />
                Project Status Distribution
              </h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.projectStatusDistribution.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full mr-3 ${
                        status.status === 'active' ? 'bg-green-500' :
                        status.status === 'completed' ? 'bg-blue-500' :
                        status.status === 'planning' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}
                    ></div>
                    <span className="text-sm text-gray-600 capitalize">{status.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">{status.count}</span>
                    <span className="text-xs text-gray-500">({status.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 text-purple-600 mr-2" />
              Recent Activity
            </h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'project' ? 'bg-blue-500' :
                    activity.type === 'contractor' ? 'bg-orange-500' :
                    activity.type === 'client' ? 'bg-purple-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Analytics Section */}
      <div className="mt-8">
        <PaymentAnalytics />
      </div>
     </div>
  );
};