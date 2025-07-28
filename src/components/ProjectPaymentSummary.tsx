import React, { useState, useEffect } from 'react';
import { 
  Building, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Download,
  Package,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Printer,
  ArrowLeft,
  Filter,
  Search
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Notification } from './ui/Notification';
import { fetchAllProjects, fetchProjectPaymentSummary } from '../services/projectSummaryApi';
import { formatPKRCurrency } from '../utils/paymentValidation';

interface Project {
  _id: string;
  name: string;
  projectCode: string;
  status: string;
}

interface PaymentSummary {
  projectId: string;
  projectName: string;
  projectType: string;
  projectCost: number;
  totalPaymentReceived: number;
  totalDebits: number;
  totalMaterialPayments: number;
  net: number;
  payments: Payment[];
  materials: Material[];
}

interface Payment {
  _id: string;
  project: string;
  contractor?: {
    _id: string;
    companyName: string;
  } | null;
  contract?: {
    _id: string;
    contractType: string;
  };
  type: 'credit' | 'debit';
  date: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  workDescription?: string;
  status: string;
  receiptPhoto?: string;
  notes?: string;
  createdBy?: {
    _id: string;
    userName: string;
  } | null;
  createdAt: string;
}

interface Material {
  _id: string;
  project: string;
  materialDetail: string;
  materialProvider: string;
  MaterialQuantity: number;
  MaterialRate: number;
  totalAmount: number;
  date: string;
  createdAt: string;
}

export const ProjectPaymentSummary: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'payments' | 'materials'>('payments');
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error',
    message: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const projectsData = await fetchAllProjects();
      setProjects(projectsData);
    } catch (error) {
      showNotification('error', 'Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadProjectSummary = async (projectId: string) => {
    try {
      setLoading(true);
      const summaryData = await fetchProjectPaymentSummary(projectId);
      setSelectedProject(summaryData);
    } catch (error) {
      showNotification('error', 'Failed to load project summary');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
  };

  const handleProjectClick = (projectId: string) => {
    loadProjectSummary(projectId);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setActiveTab('payments');
  };

  const handlePrintPDF = (type: 'payments' | 'materials') => {
    if (!selectedProject) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = generatePrintContent(selectedProject, type);
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const generatePrintContent = (summary: PaymentSummary, type: 'payments' | 'materials') => {
    const data = type === 'payments' ? summary.payments : summary.materials;
    const title = type === 'payments' ? 'Contractor Payments' : 'Material Payments';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${summary.projectName} - ${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background: #f8f9fa; padding: 20px; margin-bottom: 30px; border-radius: 8px; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .summary-item { text-align: center; }
            .summary-label { font-size: 14px; color: #666; }
            .summary-value { font-size: 24px; font-weight: bold; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .amount { font-weight: bold; }
            .credit { color: #10b981; }
            .debit { color: #ef4444; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${summary.projectName}</h1>
            <h2>${title} Report</h2>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h3>Project Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Project Cost</div>
                <div class="summary-value">${formatPKRCurrency(summary.projectCost.toString())}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Received</div>
                <div class="summary-value credit">${formatPKRCurrency(summary.totalPaymentReceived.toString())}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Net Amount</div>
                <div class="summary-value ${summary.net >= 0 ? 'credit' : 'debit'}">${formatPKRCurrency(summary.net.toString())}</div>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                ${type === 'payments' ? `
                  <th>Date</th>
                  <th>Contractor</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Description</th>
                ` : `
                  <th>Date</th>
                  <th>Material Detail</th>
                  <th>Provider</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Total Amount</th>
                `}
              </tr>
            </thead>
            <tbody>
              ${data.map(item => {
                if (type === 'payments') {
                  const payment = item as Payment;
                  return `
                    <tr>
                      <td>${new Date(payment.date).toLocaleDateString()}</td>
                      <td>${payment.contractor?.companyName || 'N/A'}</td>
                      <td class="${payment.type}">${payment.type.toUpperCase()}</td>
                      <td class="amount ${payment.type}">${formatPKRCurrency(payment.amount.toString())}</td>
                      <td>${payment.paymentMethod}</td>
                      <td>${payment.status}</td>
                      <td>${payment.workDescription || '-'}</td>
                    </tr>
                  `;
                } else {
                  const material = item as Material;
                  return `
                    <tr>
                      <td>${new Date(material.date).toLocaleDateString()}</td>
                      <td>${material.materialDetail}</td>
                      <td>${material.materialProvider}</td>
                      <td>${material.MaterialQuantity}</td>
                      <td>${formatPKRCurrency(material.MaterialRate.toString())}</td>
                      <td class="amount">${formatPKRCurrency(material.totalAmount.toString())}</td>
                    </tr>
                  `;
                }
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'ongoing': return 'text-blue-600 bg-blue-100';
      case 'planning': return 'text-orange-600 bg-orange-100';
      case 'on_hold': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentTypeColor = (type: string) => {
    return type === 'credit' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                variant="outline"
                onClick={handleBackToProjects}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedProject.projectName}</h1>
                <p className="text-gray-600">Payment Summary & Details</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handlePrintPDF('payments')}
                className="flex items-center"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Payments
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePrintPDF('materials')}
                className="flex items-center"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Materials
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Project Cost</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPKRCurrency(selectedProject.projectCost.toString())}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Received</p>
                  <p className="text-2xl font-bold text-green-600">{formatPKRCurrency(selectedProject.totalPaymentReceived.toString())}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>


            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Debits</p>
                  <p className="text-2xl font-bold text-red-600">{formatPKRCurrency(selectedProject.totalDebits.toString())}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>


            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Material Payments</p>
                  <p className="text-2xl font-bold text-red-600">{formatPKRCurrency(selectedProject.totalMaterialPayments.toString())}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Amount</p>
                  <p className={`text-2xl font-bold ${selectedProject.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPKRCurrency(selectedProject.net.toString())}
                  </p>
                </div>
                <div className={`w-12 h-12 ${selectedProject.net >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                  <DollarSign className={`w-6 h-6 ${selectedProject.net >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'payments'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Contractor Payments ({selectedProject.payments.length})
                </button>
                <button
                  onClick={() => setActiveTab('materials')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'materials'
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Package className="w-4 h-4 inline mr-2" />
                  Material Payments ({selectedProject.materials.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'payments' ? (
                <div className="space-y-4">
                  {selectedProject.payments.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No contractor payments found for this project</p>
                    </div>
                  ) : (
                    selectedProject.payments.map((payment) => (
                      <div key={payment._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="font-medium">{new Date(payment.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Contractor</p>
                            <p className="font-medium">{payment.contractor?.companyName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Type</p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentTypeColor(payment.type)}`}>
                              {payment.type.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Amount</p>
                            <p className={`font-bold text-lg ${payment.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPKRCurrency(payment.amount.toString())}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="font-medium">{payment.paymentMethod}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-medium">{payment.status}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Created By</p>
                            <p className="font-medium">{payment.createdBy?.userName || 'N/A'}</p>
                          </div>
                        </div>

                        {payment.workDescription && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600">Work Description</p>
                            <p className="font-medium">{payment.workDescription}</p>
                          </div>
                        )}

                        {payment.notes && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600">Notes</p>
                            <p className="font-medium">{payment.notes}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedProject.materials.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No material payments found for this project</p>
                    </div>
                  ) : (
                    selectedProject.materials.map((material) => (
                      <div key={material._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="font-medium">{new Date(material.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Material Detail</p>
                            <p className="font-medium">{material.materialDetail}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Provider</p>
                            <p className="font-medium">{material.materialProvider}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-bold text-lg text-blue-600">
                              {formatPKRCurrency(material.totalAmount.toString())}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="font-medium">{material.MaterialQuantity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Rate per Unit</p>
                            <p className="font-medium">{formatPKRCurrency(material.MaterialRate.toString())}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Notification
          show={notification.show}
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Payment Summary</h1>
          <p className="text-gray-600">View detailed payment information for all projects</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              label=""
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {loadingProjects ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleProjectClick(project._id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">Code: {project.projectCode}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project._id);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};