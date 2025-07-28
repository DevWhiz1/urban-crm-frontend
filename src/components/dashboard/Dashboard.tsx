import React from 'react';
import { Users, Wrench, FileText, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  // const stats = [
  //   { label: 'Total Contractors', value: '24', icon: Wrench, color: 'bg-blue-500', change: '+12%' },
  //   { label: 'Active Projects', value: '8', icon: FileText, color: 'bg-green-500', change: '+5%' },
  //   { label: 'Team Members', value: '16', icon: Users, color: 'bg-purple-500', change: '+8%' },
  //   { label: 'Monthly Revenue', value: '$45.2K', icon: TrendingUp, color: 'bg-orange-500', change: '+15%' }
  // ];

  // const recentProjects = [
  //   { name: 'Downtown Office Complex', status: 'In Progress', progress: 75, dueDate: '2024-02-15' },
  //   { name: 'Residential Villa', status: 'Planning', progress: 25, dueDate: '2024-03-01' },
  //   { name: 'Shopping Mall Renovation', status: 'Completed', progress: 100, dueDate: '2024-01-20' },
  //   { name: 'Industrial Warehouse', status: 'In Progress', progress: 60, dueDate: '2024-02-28' }
  // ];

  // const recentActivities = [
  //   { action: 'New contractor added', user: 'John Smith', time: '2 hours ago', type: 'success' },
  //   { action: 'Project milestone completed', user: 'Sarah Johnson', time: '4 hours ago', type: 'success' },
  //   { action: 'Payment pending review', user: 'Mike Wilson', time: '6 hours ago', type: 'warning' },
  //   { action: 'New user registered', user: 'Emma Davis', time: '1 day ago', type: 'info' }
  // ];

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'Completed': return 'text-green-600 bg-green-100';
  //     case 'In Progress': return 'text-blue-600 bg-blue-100';
  //     case 'Planning': return 'text-orange-600 bg-orange-100';
  //     default: return 'text-gray-600 bg-gray-100';
  //   }
  // };

  // const getActivityIcon = (type: string) => {
  //   switch (type) {
  //     case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
  //     case 'warning': return <AlertCircle className="w-4 h-4 text-orange-500" />;
  //     default: return <Clock className="w-4 h-4 text-blue-500" />;
  //   }
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Navigate To Projects, Contractor to Manage them.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className="text-sm text-gray-500">Due: {project.dueDate}</span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Recent Activities */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span>
                    </p>
                    <p className="text-sm text-gray-500">by {activity.user}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};