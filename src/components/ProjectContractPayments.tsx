import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Handshake, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  ArrowLeft,
  Search,
  Printer,
  Calendar,
  User,
  FileText,
  CreditCard
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Notification } from './ui/Notification';
import { 
  fetchAllProjectsForContracts, 
  fetchProjectContracts, 
  fetchContractPaymentSummary 
} from '../services/contractPaymentApi';
import { formatPKRCurrency } from '../utils/paymentValidation';

interface Project {
  _id: string;
  name: string;
  projectCode: string;
  status: string;
}

interface ProjectContract {
  _id: string;
  project: {
    _id: string;
    name: string;
  };
  contractor: {
    _id: string;
    companyName: string;
  };
  contractType: string;
  totalAmount: number;
  startDate: string;
  endDate?: string;
  isTerminated: boolean;
  Description: string;
  payments: any[];
}

interface ContractPaymentSummary {
  projectContractId: string;
  projectName: string;
  contractorName: string;
  contractType: string;
  totalAmount: number;
  totalPayments: number;
  net: number;
  payments: ContractPayment[];
  contract: ProjectContract;
}

interface ContractPayment {
  _id: string;
  project: string;
  contractor?: {
    _id: string;
    companyName: string;
  } | null;
  contract: string;
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

export const ProjectContractPayments: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contracts, setContracts] = useState<ProjectContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractPaymentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
      const projectsData = await fetchAllProjectsForContracts();
      setProjects(projectsData);
    } catch (error) {
      showNotification('error', 'Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadProjectContracts = async (projectId: string) => {
    try {
      setLoading(true);
      const contractsData = await fetchProjectContracts(projectId);
      setContracts(contractsData.contracts);
      const project = projects.find(p => p._id === projectId);
      setSelectedProject(project || null);
    } catch (error) {
      showNotification('error', 'Failed to load project contracts');
    } finally {
      setLoading(false);
    }
  };

  const loadContractSummary = async (contractId: string) => {
    try {
      setLoading(true);
      const summaryData = await fetchContractPaymentSummary(contractId);
      setSelectedContract(summaryData);
    } catch (error) {
      showNotification('error', 'Failed to load contract payment summary');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
  };

  const handleProjectClick = (projectId: string) => {
    loadProjectContracts(projectId);
  };

  const handleContractClick = (contractId: string) => {
    loadContractSummary(contractId);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setContracts([]);
    setSelectedContract(null);
  };

  const handleBackToContracts = () => {
    setSelectedContract(null);
  };

  const handlePrintPDF = () => {
    if (!selectedContract) return;
    
    const printWindow = window.open('', '_self');
    if (!printWindow) return;

    const content = generatePrintContent(selectedContract);
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const generateReceiptNumber = () => {
    return `UD-${Date.now().toString().slice(-8)}`;
  };

  const generatePrintContent = (summary: ContractPaymentSummary) => {
    const receiptNo = generateReceiptNumber();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contract Payment Summary - ${summary.contractorName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              line-height: 1.4;
            }
            .header { 
              display: flex;
              align-items: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #ddd;
              padding-bottom: 20px;
            }
            .logo {
              width: 80px;
              height: 80px;
              margin-right: 20px;
              background: url('/logo.png') no-repeat center;
              background-size: contain;
            }
            .company-info {
              flex: 1;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            .receipt-info {
              text-align: right;
              font-size: 14px;
            }
            .summary-section {
              background: #f8f9fa;
              padding: 20px;
              margin-bottom: 30px;
              border-radius: 8px;
              border: 1px solid #e9ecef;
            }
            .summary-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #333;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .summary-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #dee2e6;
            }
            .summary-label {
              font-weight: 600;
              color: #495057;
            }
            .summary-value {
              font-weight: bold;
              color: #212529;
            }
            .amount-positive { color: #28a745; }
            .amount-negative { color: #dc3545; }
            .payments-section {
              margin-bottom: 30px;
            }
            .payments-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #dee2e6;
              padding: 12px 8px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #495057;
            }
            .amount-cell {
              text-align: right;
              font-weight: bold;
            }
            .credit { color: #28a745; }
            .debit { color: #dc3545; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #ddd;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #666;
            }
            .contact-info {
              text-align: right;
            }
            .total-summary {
              background: #e3f2fd;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
              border: 1px solid #bbdefb;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-weight: bold;
            }
            .net-amount {
              font-size: 16px;
              padding-top: 8px;
              border-top: 1px solid #90caf9;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo"></div>
            <div class="company-info">
              <div class="company-name">Urban Design & Construction</div>
              <div style="color: #666; font-size: 14px;">Contract Payment Summary</div>
            </div>
            <div class="receipt-info">
              <div><strong>Receipt No:</strong> ${receiptNo}</div>
              <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
              <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
            </div>
          </div>

          <div class="summary-section">
            <div class="summary-title">Contract Information</div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Project Name:</span>
                <span class="summary-value">${summary.projectName}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Contractor:</span>
                <span class="summary-value">${summary.contractorName}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Contract Type:</span>
                <span class="summary-value">${summary.contractType}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Contract Amount:</span>
                <span class="summary-value">${formatPKRCurrency(summary.totalAmount.toString())}</span>
              </div>
            </div>
          </div>

          <div class="payments-section">
            <div class="payments-title">Payment Details</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                  <th>Description</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                ${summary.payments.map(payment => `
                  <tr>
                    <td>${new Date(payment.date).toLocaleDateString()}</td>
                    <td class="${payment.type}">${payment.type.toUpperCase()}</td>
                    <td class="amount-cell ${payment.type}">${formatPKRCurrency(payment.amount.toString())}</td>
                    <td>${payment.paymentMethod}</td>
                    <td>${payment.status}</td>
                    <td>${payment.transactionId || '-'}</td>
                    <td>${payment.workDescription || '-'}</td>
                    <td>${payment.createdBy?.userName || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="total-summary">
            <div class="total-row">
              <span>Contract Amount:</span>
              <span>${formatPKRCurrency(summary.totalAmount.toString())}</span>
            </div>
            <div class="total-row">
              <span>Total Payments:</span>
              <span class="amount-negative">${formatPKRCurrency(summary.totalPayments.toString())}</span>
            </div>
            <div class="total-row net-amount ${summary.net >= 0 ? 'amount-positive' : 'amount-negative'}">
              <span>Net Amount:</span>
              <span>${formatPKRCurrency(summary.net.toString())}</span>
            </div>
          </div>

          <div class="footer">
            <div>
              <div><strong>Urban Design & Construction</strong></div>
              <div>MR-11 C-1 Block B-17 Multi Gardens</div>
            </div>
            <div class="contact-info">
              <div><strong>Contact Information</strong></div>
              <div>Phone: 0333 3834040</div>
              <div>Phone: 0315 5874112</div>
            </div>
          </div>
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

  // Contract Payment Summary View
  if (selectedContract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                variant="outline"
                onClick={handleBackToContracts}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Contracts
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedContract.contractorName}</h1>
                <p className="text-gray-600">{selectedContract.projectName} - Contract Payment Summary</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handlePrintPDF}
              className="flex items-center"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Summary
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contract Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPKRCurrency(selectedContract.totalAmount.toString())}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Handshake className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-red-600">{formatPKRCurrency(selectedContract.totalPayments.toString())}</p>
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
                  <p className={`text-2xl font-bold ${selectedContract.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPKRCurrency(selectedContract.net.toString())}
                  </p>
                </div>
                <div className={`w-12 h-12 ${selectedContract.net >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                  <DollarSign className={`w-6 h-6 ${selectedContract.net >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedContract.payments.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6">
              <h2 className="text-xl font-semibold text-white">Contract Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Contract Type</p>
                  <p className="font-semibold text-lg">{selectedContract.contractType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Project Name</p>
                  <p className="font-semibold text-lg">{selectedContract.projectName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-semibold">{new Date(selectedContract.contract.startDate).toLocaleDateString()}</p>
                </div>
                {selectedContract.contract.endDate && (
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-semibold">{new Date(selectedContract.contract.endDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payments List */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Payment History ({selectedContract.payments.length})</h2>
            </div>
            <div className="p-6">
              {selectedContract.payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No payments found for this contract</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedContract.payments.map((payment) => (
                    <div key={payment._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">{new Date(payment.date).toLocaleDateString()}</p>
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
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-medium">{payment.paymentMethod}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-medium">{payment.status}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Created By</p>
                          <p className="font-medium">{payment.createdBy?.userName || 'N/A'}</p>
                        </div>
                        {payment.transactionId && (
                          <div>
                            <p className="text-sm text-gray-600">Transaction ID</p>
                            <p className="font-medium">{payment.transactionId}</p>
                          </div>
                        )}
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
                  ))}
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

  // Project Contracts List View
  if (selectedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
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
                <h1 className="text-3xl font-bold text-gray-900">{selectedProject.name}</h1>
                <p className="text-gray-600">Project Contracts</p>
              </div>
            </div>
          </div>

          {/* Contracts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading contracts...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No contracts found for this project</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contracts.map((contract) => (
                <div
                  key={contract._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleContractClick(contract._id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{contract.contractor.companyName}</h3>
                      <p className="text-sm text-gray-600 mb-2">{contract.contractType}</p>
                      <p className="text-lg font-bold text-blue-600">{formatPKRCurrency(contract.totalAmount.toString())}</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Handshake className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{new Date(contract.startDate).toLocaleDateString()}</span>
                    </div>
                    {contract.endDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">{new Date(contract.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payments:</span>
                      <span className="font-medium">{contract.payments.length}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContractClick(contract._id);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Payments
                  </Button>
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
  }

  // Projects List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Contract Payments</h1>
          <p className="text-gray-600">View contract payment details for all projects</p>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
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
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-orange-600" />
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
                    View Contracts
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