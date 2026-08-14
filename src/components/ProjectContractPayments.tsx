import React, { useState, useEffect, useMemo } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
import {
    Building,
    Building2,
    Handshake,
    Banknote,
    TrendingUp,
    TrendingDown,
    Eye,
    ArrowLeft,
    Search,
    Printer,
    Calendar,
    User,
    FileText,
    CreditCard,
    FileSpreadsheet,
    ArrowUpRight,
    ArrowDownLeft,
    X,
    ExternalLink,
    Receipt,
    Filter,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    CheckCircle,
    Edit,
    Trash2,
    Download
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Notification } from './ui/Notification';
import {
    fetchAllProjectsForContracts,
    fetchPaginatedProjectsForContracts,
    fetchProjectContracts,
    fetchContractPaymentSummary
} from '../services/contractPaymentApi';
import { updatePayment, deletePayment } from '../services/paymentApi';
import { formatPKRCurrency } from '../utils/paymentValidation';
import { DeleteConfirmationModal } from './ui/DeleteConfirmationModal';
import { PaymentEditModal } from './PaymentEditModal';
import { getPaginatedProjectPayments } from '../services/projectSummaryApi';
import { useNavigate } from "react-router-dom";
import { Pagination } from './shared/Pagination';

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
    projectId: string;
    contractorId: string;
    projectName: string;
    contractorName: string;
    contractType: string;
    totalAmount: number;
    totalPayments: number;
    totalPaymentCount: number;
    net: number;
    contract: ProjectContract;
}

interface ContractPayment {
    _id: string;
    paymentId: string;
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
    isActive?: boolean;
}

export const ProjectContractPayments: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [contracts, setContracts] = useState<ProjectContract[]>([]);
    const [selectedContract, setSelectedContract] = useState<ContractPaymentSummary | null>(null);
    const [payments, setPayments] = useState<ContractPayment[]>([]);
    const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<ContractPayment | null>(null);
    const [editingPayment, setEditingPayment] = useState<ContractPayment | null>(null);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        paymentId: '',
        paymentName: '',
        isInactive: false
    });
    const [zoomImage, setZoomImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(true);

    // Global Search State
    const [searchTerm, setSearchTerm] = useState('');

    // Payment Filter & Pagination States
    const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [methodFilter, setMethodFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('date_desc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Project Pagination States
    const [projectsCurrentPage, setProjectsCurrentPage] = useState(1);
    const [projectsTotalPages, setProjectsTotalPages] = useState(1);
    const [projectsTotalItems, setProjectsTotalItems] = useState(0);

    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });

    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [debouncedProjectSearch, setDebouncedProjectSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(paymentSearchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [paymentSearchTerm]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedProjectSearch(searchTerm);
            setProjectsCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        loadProjects();
    }, [projectsCurrentPage, debouncedProjectSearch]);

    // Reset pagination on contract change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedContract]);

    const loadProjects = async () => {
        try {
            setLoadingProjects(true);
            const { data, pagination } = await fetchPaginatedProjectsForContracts({
                page: projectsCurrentPage,
                limit: 10,
                search: debouncedProjectSearch
            });
            setProjects(data);
            if (pagination) {
                setProjectsTotalPages(pagination.totalPages || 1);
                setProjectsTotalItems(pagination.total || 0);
            }
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
            setSearchTerm('');
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
            resetPaymentFilters();
        } catch (error) {
            showNotification('error', 'Failed to load contract payment summary');
        } finally {
            setLoading(false);
        }
    };

    const loadTableData = async () => {
        if (!selectedContract) return;
        setLoadingData(true);
        try {
            const params: any = { 
                page: currentPage, 
                limit: itemsPerPage,
                contract: selectedContract.projectContractId 
            };
            if (debouncedSearch) params.search = debouncedSearch;
            if (typeFilter !== 'ALL') params.type = typeFilter;
            if (methodFilter !== 'ALL') params.method = methodFilter;
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (sortBy !== 'date_desc') params.sort = sortBy;

            const projectId = selectedContract.contract.project?._id || (selectedContract.contract as any).project;
            if(!projectId) throw new Error("Missing Project ID");

            const { data, pagination } = await getPaginatedProjectPayments(projectId, params);
            setPayments(data);
            if (pagination) {
                setTotalPages(pagination.totalPages || 1);
                setTotalCount(pagination.total || 0);
            }
        } catch (error) {
            showNotification('error', 'Failed to load payments');
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (selectedContract) {
            loadTableData();
        }
    }, [selectedContract, currentPage, debouncedSearch]);

    const resetPaymentFilters = () => {
        setPaymentSearchTerm('');
        setTypeFilter('ALL');
        setMethodFilter('ALL');
        setStatusFilter('ALL');
        setSortBy('date_desc');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
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
        resetPaymentFilters();
    };

    const handleBackToContracts = () => {
        setSelectedContract(null);
        resetPaymentFilters();
    };

    const handleInitiateDelete = (payment: ContractPayment) => {
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
            setPayments(prev => prev.map(p => p._id === deleteModal.paymentId ? { ...p, isActive: false } : p));
            showNotification('success', 'Payment deactivated successfully');
        } catch (error) {
            showNotification('error', 'Failed to deactivate payment.');
            throw error;
        }
    };

    const handleActivatePayment = async (payment: ContractPayment) => {
        try {
            await updatePayment(payment._id, { isActive: true });
            setPayments(prev => prev.map(p => p._id === payment._id ? { ...p, isActive: true } : p));
            showNotification('success', 'Payment activated successfully');
        } catch (error) {
            showNotification('error', 'Failed to activate payment.');
        }
    };

    const handleConfirmDeletePayment = async () => {
        try {
            await deletePayment(deleteModal.paymentId);
            setPayments(prev => prev.filter(p => p._id !== deleteModal.paymentId));
            showNotification('success', 'Payment deleted successfully');
            loadContractSummary(selectedContract!.projectContractId);
        } catch (error) {
            showNotification('error', 'Failed to delete payment.');
            throw error;
        }
    };

    const handlePaymentUpdated = (updatedPayment: any) => {
        setPayments(prev => prev.map(p => p._id === updatedPayment._id ? { ...p, ...updatedPayment } : p));
        showNotification('success', 'Payment updated successfully');
        if (selectedContract) loadContractSummary(selectedContract.projectContractId);
    };

    // Server-side pagination replaces local filtering and sorting
    const paginatedPayments = payments;

    const handlePrintPDF = () => {
        if (!selectedContract) return;
        navigate(`/dashboard/statements?type=contractor&project=${selectedContract.projectId}&contractor=${selectedContract.contractorId}`);
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

    const filteredProjects = projects;

    const hasActivePaymentFilters = paymentSearchTerm !== '' || typeFilter !== 'ALL' || methodFilter !== 'ALL' || statusFilter !== 'ALL' || sortBy !== 'date_desc';

    // Contract Payment Summary View
    if (selectedContract) {
        return (
            <div className="pb-12">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', path: '/dashboard' },
                            { label: 'Payments', path: '/dashboard/payments' },
                            { label: 'Contractor Payments', onClick: handleBackToProjects },
                            { label: selectedContract.projectName, onClick: handleBackToContracts },
                            { label: selectedContract.contractorName }
                        ]}
                    />

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{selectedContract.contractorName}</h1>
                                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                                    {selectedContract.contractType}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{selectedContract.projectName} — Contractor Payment Statement</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrintPDF}
                                className="flex items-center text-xs"
                            >
                                <Printer className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Print Statement</span>
                            </Button>
                        </div>
                    </div>

                    {/* Summary Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Amount</span>
                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                                    <Handshake className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <p className="text-lg sm:text-xl font-bold text-slate-900 break-words leading-tight">
                                    {formatPKRCurrency(selectedContract.totalAmount.toString())}
                                </p>
                                <span className="text-xs text-slate-400 font-medium mt-1 inline-block">Agreed Contract Value</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Payments Paid</span>
                                <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <p className="text-lg sm:text-xl font-bold text-amber-600 break-words leading-tight">
                                    {formatPKRCurrency(selectedContract.totalPayments.toString())}
                                </p>
                                <span className="text-xs text-slate-400 font-medium mt-1 inline-block">Outflow Paid to Contractor</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remaining Balance</span>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${selectedContract.net >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    <Banknote className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <p className={`text-lg sm:text-xl font-bold break-words leading-tight ${selectedContract.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {formatPKRCurrency(selectedContract.net.toString())}
                                </p>
                                <span className="text-xs text-slate-400 font-medium mt-1 inline-block">Contract Net Payable</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transactions</span>
                                <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <p className="text-lg sm:text-xl font-bold text-slate-900 break-words leading-tight">{selectedContract.totalPaymentCount}</p>
                                <span className="text-xs text-slate-400 font-medium mt-1 inline-block">Recorded Vouchers</span>
                            </div>
                        </div>
                    </div>

                    {/* Payments Statement Table Container */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        {/* Header & Counter */}
                        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900">Contract Payment History</h2>
                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                    {selectedContract.totalPaymentCount} Total Vouchers
                                </span>
                            </div>

                            <div className="text-xs text-slate-500 font-medium">
                                Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-bold text-slate-800">{totalCount}</span> records
                            </div>
                        </div>

                        {/* Filter & Search Toolbar */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
                            <div className="flex flex-col lg:flex-row flex-wrap items-center gap-3">
                                {/* Search Input */}
                                <div className="relative w-full lg:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={paymentSearchTerm}
                                        onChange={(e) => setPaymentSearchTerm(e.target.value)}
                                        placeholder="Search notes, ref ID..."
                                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                                    />
                                    {paymentSearchTerm && (
                                        <button onClick={() => setPaymentSearchTerm('')} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Date Filters */}
                                <div className="flex items-center gap-2 w-full lg:w-auto">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-1/2 lg:w-auto px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                                        title="Start Date"
                                    />
                                    <span className="text-slate-400">to</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-1/2 lg:w-auto px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                                        title="End Date"
                                    />
                                </div>

                                {/* Type Filter */}
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full lg:w-auto px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                                >
                                    <option value="ALL">All Types</option>
                                    <option value="debit">DEBIT (Outflow)</option>
                                    <option value="credit">CREDIT (Inflow)</option>
                                </select>

                                {/* Method Filter */}
                                <select
                                    value={methodFilter}
                                    onChange={(e) => setMethodFilter(e.target.value)}
                                    className="w-full lg:w-auto px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                                >
                                    <option value="ALL">All Methods</option>
                                    <option value="cash">Cash</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="online">Online / UPI</option>
                                </select>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full lg:w-auto px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                </select>

                                {/* Sort Selector */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full lg:w-auto px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                                >
                                    <option value="date_desc">Sort: Newest First</option>
                                    <option value="date_asc">Sort: Oldest First</option>
                                    <option value="amount_desc">Amount: High → Low</option>
                                    <option value="amount_asc">Amount: Low → High</option>
                                </select>

                                {/* Apply Filters Button */}
                                <Button 
                                    onClick={() => {
                                        if (currentPage === 1) {
                                            loadTableData();
                                        } else {
                                            setCurrentPage(1);
                                        }
                                    }}
                                    className="w-full lg:w-auto px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <Filter className="w-3.5 h-3.5" /> Apply Filters
                                </Button>
                            </div>

                            {hasActivePaymentFilters && (
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                                        <Filter className="w-3 h-3" /> Active Filters
                                    </span>
                                    <button
                                        onClick={resetPaymentFilters}
                                        className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:underline"
                                    >
                                        <RotateCcw className="w-3 h-3" /> Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Statement Table View */}
                        <div className="overflow-x-auto w-full">
                            {loadingData ? (
                                <div className="p-12 flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : paginatedPayments.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-slate-600">No payment transactions found</p>
                                    <p className="text-xs text-slate-400 mt-1">Try clearing your search or filters</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                            <th className="py-3 px-4">Payment ID</th>
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
                                                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-800">
                                                        {payment.paymentId || 'N/A'}
                                                    </td>
                                                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                                                        {new Date(payment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>{selectedContract.contractorName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isDebit
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            }`}>
                                                            {isDebit ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownLeft className="w-3 h-3 mr-0.5" />}
                                                            {payment.type}
                                                        </span>
                                                    </td>
                                                    <td className={`py-3 px-4 text-right font-bold whitespace-nowrap text-sm ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                        {formatPKRCurrency(payment.amount.toString())}
                                                    </td>
                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                        <span className="capitalize font-medium text-slate-700">{payment.paymentMethod}</span>
                                                        <span className="mx-1 text-slate-300">•</span>
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 max-w-xs truncate text-slate-500">
                                                        {payment.workDescription || payment.notes || <span className="text-slate-300 italic">No notes</span>}
                                                    </td>
                                                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                                                        {payment.createdBy?.userName || 'System'}
                                                    </td>
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
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/dashboard/receipt/${payment._id}`);
                                                                }}
                                                                className="p-1.5 text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                                                                title="Generate Receipt"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalCount}
                            pageSize={itemsPerPage}
                            onPageChange={setCurrentPage}
                            itemName="payments"
                        />
                    </div>

                    {/* PAYMENT DETAIL MODAL */}
                    {selectedPaymentDetail && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${selectedPaymentDetail.type === 'debit' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {selectedPaymentDetail.type === 'debit' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900">Contract Payment Details</h3>
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

                                <div className="p-6 overflow-y-auto space-y-5">
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

                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                                            <span className="text-slate-400 block font-medium">Contractor Name</span>
                                            <span className="font-bold text-slate-900 text-sm">{selectedContract.contractorName}</span>
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
            </div>
        );
    }

    // CONTRACTS LIST VIEW (TABULAR FORM AS REQUESTED)
    if (selectedProject) {
        const filteredContracts = contracts.filter(contract =>
            contract.contractor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contract.contractType.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <Breadcrumbs
                    items={[
                        { label: 'Dashboard', path: '/dashboard' },
                        { label: 'Payments', path: '/dashboard/payments' },
                        { label: 'Contractor Payments', onClick: handleBackToProjects },
                        { label: selectedProject.name }
                    ]}
                />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedProject.name}</h1>
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {selectedProject.projectCode}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Select a contractor contract to view single-line payment history statement</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleBackToProjects}
                            className="flex items-center text-xs"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                            All Projects
                        </Button>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                label=""
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search contractor..."
                                className="pl-10 text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Contracts Tabular Table */}
                {loading ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="mt-4 text-sm text-slate-600 font-medium">Loading contracts...</p>
                    </div>
                ) : filteredContracts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                        <Handshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-semibold">No contracts found for this project</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-900">Contractor Contracts</h2>
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                                {filteredContracts.length} Contracts
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                        <th className="py-3.5 px-4">Contractor Name</th>
                                        <th className="py-3.5 px-4">Contract Type</th>
                                        <th className="py-3.5 px-4 text-right">Contract Amount</th>
                                        <th className="py-3.5 px-4 text-center">Recorded Vouchers</th>
                                        <th className="py-3.5 px-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                                    {filteredContracts.map((contract) => (
                                        <tr
                                            key={contract._id}
                                            className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                            onClick={() => handleContractClick(contract._id)}
                                        >
                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap group-hover:text-orange-600 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <Handshake className="w-4 h-4 text-orange-600" />
                                                    <span>{contract.contractor.companyName}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                                                {contract.contractType}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                                                {formatPKRCurrency(contract.totalAmount.toString())}
                                            </td>
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-orange-100 text-orange-800">
                                                    {contract.payments.length}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleContractClick(contract._id);
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View Payment Statement
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
    }

    // PROJECTS LIST VIEW (TABULAR FORM AS REQUESTED)
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumbs
                items={[
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Payments', path: '/dashboard/payments' },
                    { label: 'Contractor Payments' }
                ]}
            />

            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Contractor Payments</h1>
                    <p className="text-sm text-slate-500 mt-1">Select a project to view contractor payment contracts and single-line transaction history</p>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        label=""
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search projects..."
                        className="pl-10 text-xs"
                    />
                </div>
            </div>

            {/* Projects Tabular Form Table */}
            {loadingProjects ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-slate-600 font-medium">Loading projects...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-semibold">No projects found</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching with a different keyword</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-900">Projects Directory</h2>
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                            {filteredProjects.length} Projects
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
                                {filteredProjects.map((project) => (
                                    <tr
                                        key={project._id}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                        onClick={() => handleProjectClick(project._id)}
                                    >
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                                            {project.projectCode}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap group-hover:text-orange-600 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Building className="w-4 h-4 text-orange-600" />
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
                                                <Eye className="w-3.5 h-3.5" /> View Contractor Contracts
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {!loadingProjects && filteredProjects.length > 0 && (
                <Pagination
                    currentPage={projectsCurrentPage}
                    totalPages={projectsTotalPages}
                    totalItems={projectsTotalItems}
                    pageSize={10}
                    onPageChange={setProjectsCurrentPage}
                    itemName="projects"
                />
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