import React, { useState, useEffect, useMemo } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
import {
    Building2,
    Banknote,
    TrendingUp,
    TrendingDown,
    Eye,
    PackageCheck,
    Users,
    Calendar,
    CreditCard,
    FileText,
    Printer,
    ArrowLeft,
    Filter,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowDownLeft,
    ArrowUpRight,
    Receipt,
    ExternalLink,
    Tag,
    User,
    CheckCircle2,
    CheckCircle,
    RotateCcw,
    Edit,
    Trash2
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Notification } from './ui/Notification';
import { fetchAllProjects, fetchProjectPaymentSummary } from '../services/projectSummaryApi';
import { updatePayment, deletePayment } from '../services/paymentApi';
import { formatPKRCurrency } from '../utils/paymentValidation';
import { DeleteConfirmationModal } from './ui/DeleteConfirmationModal';
import { PaymentEditModal } from './PaymentEditModal';

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

    // Active View Tab: 'payments' | 'materials'
    const [activeTab, setActiveTab] = useState<'payments' | 'materials'>('payments');

    // Modals
    const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<Payment | null>(null);
    const [selectedMaterialDetail, setSelectedMaterialDetail] = useState<Material | null>(null);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        paymentId: '',
        paymentName: '',
        isInactive: false
    });
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    // Filter & Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [contractorFilter, setContractorFilter] = useState('ALL');
    const [providerFilter, setProviderFilter] = useState('ALL');
    const [methodFilter, setMethodFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('date_desc');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });

    useEffect(() => {
        loadProjects();
    }, []);

    // Reset pagination on filter or tab change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm, typeFilter, contractorFilter, providerFilter, methodFilter, sortBy, selectedProject]);

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
            resetFilters();
        } catch (error) {
            showNotification('error', 'Failed to load project payment summary');
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setTypeFilter('ALL');
        setContractorFilter('ALL');
        setProviderFilter('ALL');
        setMethodFilter('ALL');
        setSortBy('date_desc');
        setCurrentPage(1);
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ show: true, type, message });
    };

    const handleProjectClick = (projectId: string) => {
        loadProjectSummary(projectId);
    };

    const handleBackToProjects = () => {
        setSelectedProject(null);
        resetFilters();
    };

    const handleInitiateDelete = (payment: Payment) => {
        setDeleteModal({
            isOpen: true,
            paymentId: payment._id,
            paymentName: `Payment of ${formatPKRCurrency(payment.amount.toString())}`,
            isInactive: payment.isActive === false
        });
    };

    const handleConfirmDeactivatePayment = async () => {
        try {
            await updatePayment(deleteModal.paymentId, { isActive: false });
            if (selectedProject) {
                setSelectedProject(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        payments: prev.payments.map(p => p._id === deleteModal.paymentId ? { ...p, isActive: false } : p)
                    };
                });
            }
            showNotification('success', 'Payment deactivated successfully');
        } catch (error) {
            showNotification('error', 'Failed to deactivate payment.');
            throw error;
        }
    };

    const handleActivatePayment = async (payment: Payment) => {
        try {
            await updatePayment(payment._id, { isActive: true });
            if (selectedProject) {
                setSelectedProject(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        payments: prev.payments.map(p => p._id === payment._id ? { ...p, isActive: true } : p)
                    };
                });
            }
            showNotification('success', 'Payment activated successfully');
        } catch (error) {
            showNotification('error', 'Failed to activate payment.');
        }
    };

    const handleConfirmDeletePayment = async () => {
        try {
            await deletePayment(deleteModal.paymentId);
            if (selectedProject) {
                setSelectedProject(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        payments: prev.payments.filter(p => p._id !== deleteModal.paymentId)
                    };
                });
            }
            showNotification('success', 'Payment deleted successfully');
        } catch (error) {
            showNotification('error', 'Failed to delete payment.');
            throw error;
        }
    };

    const handlePaymentUpdated = (updatedPayment: any) => {
        if (selectedProject) {
            setSelectedProject(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    payments: prev.payments.map(p => p._id === updatedPayment._id ? { ...p, ...updatedPayment } : p)
                };
            });
        }
        showNotification('success', 'Payment updated successfully');
    };

    // Filter Contractor Payments
    const filteredPayments = useMemo(() => {
        if (!selectedProject?.payments) return [];
        return selectedProject.payments.filter(p => {
            const matchesSearch =
                (p.contractor?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.workDescription || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.paymentMethod || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.createdBy?.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.amount.toString().includes(searchTerm);

            const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
            const matchesContractor = contractorFilter === 'ALL' || p.contractor?.companyName === contractorFilter;
            const matchesMethod = methodFilter === 'ALL' || p.paymentMethod.toLowerCase() === methodFilter.toLowerCase();

            return matchesSearch && matchesType && matchesContractor && matchesMethod;
        }).sort((a, b) => {
            if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortBy === 'amount_desc') return b.amount - a.amount;
            if (sortBy === 'amount_asc') return a.amount - b.amount;
            return 0;
        });
    }, [selectedProject, searchTerm, typeFilter, contractorFilter, methodFilter, sortBy]);

    // Filter Material Payments
    const filteredMaterials = useMemo(() => {
        if (!selectedProject?.materials) return [];
        return selectedProject.materials.filter(m => {
            const matchesSearch =
                m.materialDetail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.materialProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.totalAmount.toString().includes(searchTerm);

            const matchesProvider = providerFilter === 'ALL' || m.materialProvider === providerFilter;

            return matchesSearch && matchesProvider;
        }).sort((a, b) => {
            if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortBy === 'amount_desc') return b.totalAmount - a.totalAmount;
            if (sortBy === 'amount_asc') return a.totalAmount - b.totalAmount;
            return 0;
        });
    }, [selectedProject, searchTerm, providerFilter, sortBy]);

    // Unique filter options
    const uniqueContractors = useMemo(() => {
        if (!selectedProject?.payments) return [];
        const set = new Set<string>();
        selectedProject.payments.forEach(p => {
            if (p.contractor?.companyName) set.add(p.contractor.companyName);
        });
        return Array.from(set);
    }, [selectedProject]);

    const uniqueProviders = useMemo(() => {
        if (!selectedProject?.materials) return [];
        const set = new Set<string>();
        selectedProject.materials.forEach(m => {
            if (m.materialProvider) set.add(m.materialProvider);
        });
        return Array.from(set);
    }, [selectedProject]);

    // Paginated datasets
    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPayments, currentPage, itemsPerPage]);

    const paginatedMaterials = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredMaterials.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredMaterials, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => {
        const totalItems = activeTab === 'payments' ? filteredPayments.length : filteredMaterials.length;
        return Math.ceil(totalItems / itemsPerPage) || 1;
    }, [activeTab, filteredPayments.length, filteredMaterials.length, itemsPerPage]);

    const handlePrintPDF = (type: 'payments' | 'materials') => {
        if (!selectedProject) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = generatePrintContent(selectedProject, type);
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    const generateReceiptNumber = () => {
        return `UD-${Date.now().toString().slice(-8)}`;
    };

    const generatePrintContent = (summary: PaymentSummary, type: 'payments' | 'materials') => {
        const receiptNo = generateReceiptNumber();
        const isPayments = type === 'payments';

        return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${summary.projectName} - ${isPayments ? 'Contractor Payments' : 'Material Payments'} Summary</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; color: #1e293b; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
            .company-name { font-size: 22px; font-weight: bold; color: #1e293b; }
            .summary-section { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
            .summary-item { text-align: center; }
            .summary-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
            .summary-value { font-size: 16px; font-weight: bold; margin-top: 4px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 600; }
            .amount { font-weight: bold; text-align: right; }
            .credit { color: #059669; }
            .debit { color: #dc2626; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company-name">Urban Design & Construction</div>
              <div style="color: #64748b; font-size: 13px;">${isPayments ? 'Contractor Payments Statement' : 'Material Expenses Statement'}</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              <div>Ref: ${receiptNo}</div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="summary-section">
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Project Name</div>
                <div class="summary-value">${summary.projectName}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Project Cost</div>
                <div class="summary-value">${formatPKRCurrency(summary.projectCost.toString())}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Received</div>
                <div class="summary-value credit">${formatPKRCurrency(summary.totalPaymentReceived.toString())}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">${isPayments ? 'Total Contractor Outflow' : 'Total Material Cost'}</div>
                <div class="summary-value debit">${formatPKRCurrency((isPayments ? summary.totalDebits : summary.totalMaterialPayments).toString())}</div>
              </div>
            </div>
          </div>

          <table>
            <thead>
              ${isPayments ? `
                <tr>
                  <th>Date</th>
                  <th>Contractor</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Created By</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              ` : `
                <tr>
                  <th>Date</th>
                  <th>Material Detail</th>
                  <th>Provider</th>
                  <th>Qty & Rate</th>
                  <th>Recorded Date</th>
                  <th style="text-align: right;">Total Amount</th>
                </tr>
              `}
            </thead>
            <tbody>
              ${isPayments ? filteredPayments.map(p => `
                <tr>
                  <td>${new Date(p.date).toLocaleDateString()}</td>
                  <td><strong>${p.contractor?.companyName || 'N/A'}</strong></td>
                  <td>${p.type.toUpperCase()}</td>
                  <td>${p.paymentMethod}</td>
                  <td>${p.status}</td>
                  <td>${p.workDescription || p.notes || '-'}</td>
                  <td>${p.createdBy?.userName || 'System'}</td>
                  <td class="amount ${p.type === 'credit' ? 'credit' : 'debit'}">${formatPKRCurrency(p.amount.toString())}</td>
                </tr>
              `).join('') : filteredMaterials.map(m => `
                <tr>
                  <td>${new Date(m.date).toLocaleDateString()}</td>
                  <td><strong>${m.materialDetail}</strong></td>
                  <td>${m.materialProvider}</td>
                  <td>${m.MaterialQuantity} @ ${formatPKRCurrency(m.MaterialRate.toString())}</td>
                  <td>${new Date(m.createdAt).toLocaleDateString()}</td>
                  <td class="amount debit">${formatPKRCurrency(m.totalAmount.toString())}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
            case 'ongoing': return 'text-blue-700 bg-blue-50 border-blue-200';
            case 'planning': return 'text-amber-700 bg-amber-50 border-amber-200';
            case 'on_hold': return 'text-orange-700 bg-orange-50 border-orange-200';
            case 'cancelled': return 'text-rose-700 bg-rose-50 border-rose-200';
            default: return 'text-slate-700 bg-slate-100 border-slate-200';
        }
    };

    const filteredProjectsList = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasActiveFilters = searchTerm !== '' || typeFilter !== 'ALL' || contractorFilter !== 'ALL' || providerFilter !== 'ALL' || methodFilter !== 'ALL' || sortBy !== 'date_desc';

    // PROJECT PAYMENT BREAKDOWN VIEW (WHEN PROJECT SELECTED)
    if (selectedProject) {
        return (
            <div className="pb-12">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', path: '/dashboard' },
                            { label: 'Payments', path: '/dashboard/payments' },
                            { label: 'Project Summaries', onClick: handleBackToProjects },
                            { label: selectedProject.projectName }
                        ]}
                    />

                    {/* Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{selectedProject.projectName}</h1>
                                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                    {selectedProject.projectType || 'Construction'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Financial Breakdown & Single-Line Statements</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBackToProjects}
                                className="flex items-center text-slate-700 border-slate-300 hover:bg-slate-50 text-xs"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                                All Projects
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintPDF('payments')}
                                className="flex items-center text-xs"
                            >
                                <Printer className="w-3.5 h-3.5 mr-1.5" />
                                Print Payments
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintPDF('materials')}
                                className="flex items-center text-xs"
                            >
                                <Printer className="w-3.5 h-3.5 mr-1.5" />
                                Print Materials
                            </Button>
                        </div>
                    </div>

                    {/* Summary Stats Cards (Compact 5-Column Grid) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {/* Project Cost */}
                        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project Cost</span>
                                <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
                                    <Building2 className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-base sm:text-lg font-bold text-slate-900 truncate" title={formatPKRCurrency(selectedProject.projectCost.toString())}>
                                    {formatPKRCurrency(selectedProject.projectCost.toString())}
                                </p>
                                <span className="text-[10px] text-slate-400 font-medium">Total Contract Value</span>
                            </div>
                        </div>

                        {/* Total Received */}
                        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Received</span>
                                <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
                                    <ArrowDownLeft className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-base sm:text-lg font-bold text-emerald-600 truncate" title={formatPKRCurrency(selectedProject.totalPaymentReceived.toString())}>
                                    {formatPKRCurrency(selectedProject.totalPaymentReceived.toString())}
                                </p>
                                <span className="text-[10px] text-emerald-600/80 font-medium">Client Payments</span>
                            </div>
                        </div>

                        {/* Total Debits (Contractor) */}
                        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contractor Debits</span>
                                <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center border border-amber-100">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-base sm:text-lg font-bold text-amber-600 truncate" title={formatPKRCurrency(selectedProject.totalDebits.toString())}>
                                    {formatPKRCurrency(selectedProject.totalDebits.toString())}
                                </p>
                                <span className="text-[10px] text-slate-400 font-medium">{selectedProject.payments.length} Payments Paid</span>
                            </div>
                        </div>

                        {/* Material Payments (Teal Color Palette) */}
                        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Material Cost</span>
                                <div className="w-7 h-7 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center border border-teal-100">
                                    <PackageCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-base sm:text-lg font-bold text-teal-600 truncate" title={formatPKRCurrency(selectedProject.totalMaterialPayments.toString())}>
                                    {formatPKRCurrency(selectedProject.totalMaterialPayments.toString())}
                                </p>
                                <span className="text-[10px] text-slate-400 font-medium">{selectedProject.materials.length} Materials Recorded</span>
                            </div>
                        </div>

                        {/* Net Amount */}
                        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Balance</span>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${selectedProject.net >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    <Banknote className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className={`text-base sm:text-lg font-bold truncate ${selectedProject.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} title={formatPKRCurrency(selectedProject.net.toString())}>
                                    {formatPKRCurrency(selectedProject.net.toString())}
                                </p>
                                <span className="text-[10px] text-slate-400 font-medium">Received vs Outflow</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Table Container */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Tabs Header */}
                        <div className="border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-4 bg-slate-50/50 gap-4">
                            <nav className="flex space-x-6">
                                <button
                                    onClick={() => setActiveTab('payments')}
                                    className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'payments'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <Users className="w-4 h-4" />
                                    Contractor Payments
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${activeTab === 'payments' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {selectedProject.payments.length}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('materials')}
                                    className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'materials'
                                        ? 'border-teal-600 text-teal-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <PackageCheck className="w-4 h-4" />
                                    Material Payments
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${activeTab === 'materials' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {selectedProject.materials.length}
                                    </span>
                                </button>
                            </nav>

                            {/* Search & Counter Summary */}
                            <div className="pb-3 text-xs text-slate-500 font-medium flex items-center gap-2">
                                Showing <span className="font-bold text-slate-800">{activeTab === 'payments' ? filteredPayments.length : filteredMaterials.length}</span> of <span className="font-bold text-slate-800">{activeTab === 'payments' ? selectedProject.payments.length : selectedProject.materials.length}</span> records
                            </div>
                        </div>

                        {/* Filter Toolbar */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={activeTab === 'payments' ? "Search contractor, notes, amount..." : "Search material, provider..."}
                                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                {activeTab === 'payments' ? (
                                    <>
                                        {/* Type Filter */}
                                        <select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                                        >
                                            <option value="ALL">All Payment Types</option>
                                            <option value="debit">DEBIT (Outflow)</option>
                                            <option value="credit">CREDIT (Inflow)</option>
                                        </select>

                                        {/* Contractor Filter */}
                                        <select
                                            value={contractorFilter}
                                            onChange={(e) => setContractorFilter(e.target.value)}
                                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                                        >
                                            <option value="ALL">All Contractors</option>
                                            {uniqueContractors.map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>

                                        {/* Payment Method Filter */}
                                        <select
                                            value={methodFilter}
                                            onChange={(e) => setMethodFilter(e.target.value)}
                                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                                        >
                                            <option value="ALL">All Payment Methods</option>
                                            <option value="cash">Cash</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="online">Online / UPI</option>
                                        </select>
                                    </>
                                ) : (
                                    <>
                                        {/* Provider Filter */}
                                        <select
                                            value={providerFilter}
                                            onChange={(e) => setProviderFilter(e.target.value)}
                                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                                        >
                                            <option value="ALL">All Material Providers</option>
                                            {uniqueProviders.map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                    </>
                                )}

                                {/* Sort Selector */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                                >
                                    <option value="date_desc">Sort: Newest First</option>
                                    <option value="date_asc">Sort: Oldest First</option>
                                    <option value="amount_desc">Amount: High → Low</option>
                                    <option value="amount_asc">Amount: Low → High</option>
                                </select>
                            </div>

                            {hasActiveFilters && (
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                                        <Filter className="w-3 h-3" /> Filters applied
                                    </span>
                                    <button
                                        onClick={resetFilters}
                                        className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:underline"
                                    >
                                        <RotateCcw className="w-3 h-3" /> Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Single-Line Bank Statement Table */}
                        <div className="overflow-x-auto">
                            {activeTab === 'payments' ? (
                                paginatedPayments.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-slate-600">No contractor payments found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4">Contractor</th>
                                                <th className="py-3 px-4">Type</th>
                                                <th className="py-3 px-4 text-right">Amount</th>
                                                <th className="py-3 px-4">Method & Status</th>
                                                <th className="py-3 px-4">Description / Notes</th>
                                                <th className="py-3 px-4">Created By</th>
                                                <th className="py-3 px-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                                            {paginatedPayments.map((payment) => {
                                                const isDebit = payment.type === 'debit';
                                                return (
                                                    <tr
                                                        key={payment._id}
                                                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                                        onClick={() => setSelectedPaymentDetail(payment)}
                                                    >
                                                        {/* Date */}
                                                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                                                            {new Date(payment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </td>

                                                        {/* Contractor */}
                                                        <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                                                            <div className="flex items-center gap-1.5">
                                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                                <span>{payment.contractor?.companyName || 'N/A'}</span>
                                                            </div>
                                                        </td>

                                                        {/* Type Badge */}
                                                        <td className="py-3 px-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isDebit
                                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                }`}>
                                                                {isDebit ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownLeft className="w-3 h-3 mr-0.5" />}
                                                                {payment.type}
                                                            </span>
                                                        </td>

                                                        {/* Amount */}
                                                        <td className={`py-3 px-4 text-right font-bold whitespace-nowrap text-sm ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                            {formatPKRCurrency(payment.amount.toString())}
                                                        </td>

                                                        {/* Method & Status */}
                                                        <td className="py-3 px-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="capitalize font-medium text-slate-700">{payment.paymentMethod}</span>
                                                                <span className="text-slate-300">•</span>
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                                                                    {payment.status}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Description */}
                                                        <td className="py-3 px-4 max-w-xs truncate text-slate-500">
                                                            {payment.workDescription || payment.notes || <span className="text-slate-300 italic">No notes</span>}
                                                        </td>

                                                        {/* Created By */}
                                                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                                                            {payment.createdBy?.userName || 'System'}
                                                        </td>

                                                        {/* Action */}
                                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                                            <div className="flex items-center justify-center gap-1">
                                                                {payment.receiptPhoto && (
                                                                    <span className="p-1 text-blue-600 bg-blue-50 rounded border border-blue-100" title="Has receipt attachment">
                                                                        <Receipt className="w-3 h-3" />
                                                                    </span>
                                                                )}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedPaymentDetail(payment);
                                                                    }}
                                                                    className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingPayment(payment);
                                                                    }}
                                                                    className="p-1.5 text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                                                                    title="Edit Payment"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                {payment.isActive === false && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleActivatePayment(payment);
                                                                        }}
                                                                        className="p-1.5 text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                                                                        title="Activate Payment"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleInitiateDelete(payment);
                                                                    }}
                                                                    className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                                                    title={payment.isActive === false ? "Permanently Delete" : "Deactivate"}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )
                            ) : (
                                paginatedMaterials.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <PackageCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-slate-600">No material payments found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4">Material Detail</th>
                                                <th className="py-3 px-4">Provider</th>
                                                <th className="py-3 px-4">Quantity & Rate</th>
                                                <th className="py-3 px-4 text-right">Total Amount</th>
                                                <th className="py-3 px-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                                            {paginatedMaterials.map((material) => (
                                                <tr
                                                    key={material._id}
                                                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                                    onClick={() => setSelectedMaterialDetail(material)}
                                                >
                                                    {/* Date */}
                                                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                                                        {new Date(material.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>

                                                    {/* Material Detail */}
                                                    <td className="py-3 px-4 font-semibold text-slate-900">
                                                        {material.materialDetail}
                                                    </td>

                                                    {/* Provider */}
                                                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                                                        {material.materialProvider}
                                                    </td>

                                                    {/* Qty & Rate */}
                                                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                                                        <span className="font-semibold text-slate-800">{material.MaterialQuantity}</span> @ {formatPKRCurrency(material.MaterialRate.toString())}
                                                    </td>

                                                    {/* Total Amount */}
                                                    <td className="py-3 px-4 text-right font-bold text-teal-600 whitespace-nowrap text-sm">
                                                        {formatPKRCurrency(material.totalAmount.toString())}
                                                    </td>

                                                    {/* Action */}
                                                    <td className="py-3 px-4 text-center whitespace-nowrap">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedMaterialDetail(material);
                                                            }}
                                                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1 mx-auto"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            )}
                        </div>

                        {/* Pagination Bar */}
                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                            <div className="flex items-center gap-3">
                                <span>
                                    Page <strong className="text-slate-800">{currentPage}</strong> of <strong className="text-slate-800">{totalPages}</strong>
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-slate-400">Rows per page:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-700"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                                </button>

                                <div className="flex items-center gap-1 px-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && currentPage > 3) {
                                            pageNum = currentPage - 3 + i;
                                            if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center transition-colors ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage >= totalPages}
                                    className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAYMENT DETAIL MODAL */}
                {selectedPaymentDetail && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                            {/* Modal Header */}
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${selectedPaymentDetail.type === 'debit' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {selectedPaymentDetail.type === 'debit' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Contractor Payment Details</h3>
                                        <p className="text-xs text-slate-500">ID: {selectedPaymentDetail._id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPaymentDetail(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto space-y-5">
                                {/* Total Amount Highlight */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-slate-500 font-medium">Transaction Amount</span>
                                        <div className={`text-2xl font-bold ${selectedPaymentDetail.type === 'debit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {formatPKRCurrency(selectedPaymentDetail.amount.toString())}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${selectedPaymentDetail.type === 'debit'
                                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                        }`}>
                                        {selectedPaymentDetail.type}
                                    </span>
                                </div>

                                {/* Key Points Grid */}
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                                        <span className="text-slate-400 block font-medium">Contractor</span>
                                        <span className="font-bold text-slate-900 text-sm">{selectedPaymentDetail.contractor?.companyName || 'N/A'}</span>
                                    </div>

                                    <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                                        <span className="text-slate-400 block font-medium">Payment Date</span>
                                        <span className="font-bold text-slate-900 text-sm">
                                            {new Date(selectedPaymentDetail.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                                        <span className="text-slate-400 block font-medium">Payment Method</span>
                                        <span className="font-semibold text-slate-800 capitalize">{selectedPaymentDetail.paymentMethod}</span>
                                    </div>

                                    <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                                        <span className="text-slate-400 block font-medium">Status</span>
                                        <span className="font-semibold text-emerald-700 capitalize">{selectedPaymentDetail.status}</span>
                                    </div>

                                    {selectedPaymentDetail.transactionId && (
                                        <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 col-span-2">
                                            <span className="text-slate-400 block font-medium">Transaction / Ref ID</span>
                                            <span className="font-mono text-xs font-bold text-slate-800">{selectedPaymentDetail.transactionId}</span>
                                        </div>
                                    )}

                                    {selectedPaymentDetail.createdBy && (
                                        <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 col-span-2">
                                            <span className="text-slate-400 block font-medium">Recorded By</span>
                                            <span className="font-semibold text-slate-800">{selectedPaymentDetail.createdBy.userName}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedPaymentDetail.workDescription && (
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Work Description</h4>
                                        <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                                            {selectedPaymentDetail.workDescription}
                                        </p>
                                    </div>
                                )}

                                {selectedPaymentDetail.notes && (
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Notes & Remarks</h4>
                                        <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                                            {selectedPaymentDetail.notes}
                                        </p>
                                    </div>
                                )}

                                {selectedPaymentDetail.receiptPhoto && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Receipt Attachment</h4>
                                        <div
                                            onClick={() => setZoomImage(selectedPaymentDetail.receiptPhoto || null)}
                                            className="relative rounded-xl border border-slate-200 overflow-hidden cursor-pointer group bg-slate-100 max-h-48 flex items-center justify-center"
                                        >
                                            <img
                                                src={selectedPaymentDetail.receiptPhoto}
                                                alt="Receipt Voucher"
                                                className="object-contain max-h-48 w-full group-hover:scale-105 transition-transform duration-200"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5">
                                                <ExternalLink className="w-4 h-4" /> Click to Zoom
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-[10px] text-slate-400">Created: {new Date(selectedPaymentDetail.createdAt).toLocaleString()}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedPaymentDetail(null)}
                                    className="text-xs"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MATERIAL DETAIL MODAL */}
                {selectedMaterialDetail && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                            {/* Modal Header */}
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                                        <PackageCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Material Purchase Details</h3>
                                        <p className="text-xs text-slate-500">ID: {selectedMaterialDetail._id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedMaterialDetail(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto space-y-5">
                                {/* Total Amount Highlight */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-slate-500 font-medium">Total Cost</span>
                                        <div className="text-2xl font-bold text-teal-700">
                                            {formatPKRCurrency(selectedMaterialDetail.totalAmount.toString())}
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                                        Material Outflow
                                    </span>
                                </div>

                                {/* Detail Grid */}
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 col-span-2">
                                        <span className="text-slate-400 block font-medium">Material Description</span>
                                        <span className="font-bold text-slate-900 text-sm">{selectedMaterialDetail.materialDetail}</span>
                                    </div>

                                    <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                                        <span className="text-slate-400 block font-medium">Provider / Supplier</span>
                                        <span className="font-bold text-slate-900 text-sm">{selectedMaterialDetail.materialProvider}</span>
                                    </div>

                                    <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                                        <span className="text-slate-400 block font-medium">Purchase Date</span>
                                        <span className="font-bold text-slate-900 text-sm">
                                            {new Date(selectedMaterialDetail.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                                        <span className="text-slate-400 block font-medium">Quantity</span>
                                        <span className="font-bold text-slate-900 text-sm">{selectedMaterialDetail.MaterialQuantity}</span>
                                    </div>

                                    <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                                        <span className="text-slate-400 block font-medium">Unit Rate</span>
                                        <span className="font-bold text-slate-900 text-sm">{formatPKRCurrency(selectedMaterialDetail.MaterialRate.toString())}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-[10px] text-slate-400">Recorded: {new Date(selectedMaterialDetail.createdAt).toLocaleString()}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedMaterialDetail(null)}
                                    className="text-xs"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* RECEIPT IMAGE ZOOM LIGHTBOX */}
                {zoomImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                        <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
                            <button
                                onClick={() => setZoomImage(null)}
                                className="absolute -top-10 right-0 p-1.5 text-white hover:text-slate-300 bg-slate-800/80 rounded-full"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <img
                                src={zoomImage}
                                alt="Receipt Attachment Zoom"
                                className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-700"
                            />
                        </div>
                    </div>
                )}

                <PaymentEditModal
                    isOpen={!!editingPayment}
                    onClose={() => setEditingPayment(null)}
                    payment={editingPayment as any}
                    onSuccess={handlePaymentUpdated}
                />

                <DeleteConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                    onConfirmDeactivate={handleConfirmDeactivatePayment}
                    onConfirmDelete={handleConfirmDeletePayment}
                    itemName={deleteModal.paymentName}
                    itemType="Payment"
                    isInactive={deleteModal.isInactive}
                />

                <Notification
                    show={notification.show}
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(prev => ({ ...prev, show: false }))}
                />
            </div>
        );
    }

    // PROJECT SELECTOR LIST (TABULAR FORM AS REQUESTED)
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumbs />

            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Payment Summaries</h1>
                    <p className="text-sm text-slate-500 mt-1">Select a project to view financial breakdown, contractor debits, and material statements</p>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        label=""
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search projects by name or code..."
                        className="pl-10 text-xs"
                    />
                </div>
            </div>

            {/* Projects Tabular Form Table */}
            {loadingProjects ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-slate-600 font-medium">Loading project summaries...</p>
                </div>
            ) : filteredProjectsList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-semibold">No matching projects found</p>
                    <p className="text-xs text-slate-400 mt-1">Try refining your search keyword</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-900">Projects Directory</h2>
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                            {filteredProjectsList.length} Projects
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Code</th>
                                    <th className="py-3.5 px-4">Project Name</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                                {filteredProjectsList.map((project) => (
                                    <tr
                                        key={project._id}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                        onClick={() => handleProjectClick(project._id)}
                                    >
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                                            {project.projectCode}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap group-hover:text-blue-600 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-blue-600" />
                                                <span>{project.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(project.status)}`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProjectClick(project._id);
                                                }}
                                                className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View Breakdown
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Notification
                show={notification.show}
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};