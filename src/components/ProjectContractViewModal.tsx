import React, { useState, useEffect } from 'react';
import { 
  X,
  Handshake,
  Building,
  User,
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Banknote,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from './ui/Button';
import { Notification } from './ui/Notification';
import { fetchProjectContractById } from '../services/projectContractApi';
import { ProjectContract } from '../types/projectContract';
import { formatPKRCurrency } from '../utils/projectContractValidation';

interface ProjectContractViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contract: ProjectContract) => void;
  contractId: string;
}

export const ProjectContractViewModal: React.FC<ProjectContractViewModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  contractId
}) => {
  const [contract, setContract] = useState<ProjectContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error',
    message: ''
  });

  useEffect(() => {
    if (isOpen && contractId) {
      loadContract();
    }
  }, [isOpen, contractId]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const contractData = await fetchProjectContractById(contractId);
      setContract(contractData);
    } catch (error) {
      showNotification('error', 'Failed to load project contract details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
  };

  const getStatusColor = (isTerminated: boolean) => {
    return isTerminated 
      ? 'text-red-600 bg-red-100' 
      : 'text-green-600 bg-green-100';
  };

  const getStatusIcon = (isTerminated: boolean) => {
    return isTerminated 
      ? <XCircle className="w-5 h-5" />
      : <CheckCircle className="w-5 h-5" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProjectName = (project: ProjectContract['project']) => {
    return typeof project === 'object' ? project.name : 'Unknown Project';
  };

  const getProjectCode = (project: ProjectContract['project']) => {
    return typeof project === 'object' ? project.projectCode : 'N/A';
  };

  const getProjectLocation = (project: ProjectContract['project']) => {
    return typeof project === 'object' ? project.location : 'N/A';
  };

  const getProjectCategory = (project: ProjectContract['project']) => {
    return typeof project === 'object' ? project.projectCategory : 'N/A';
  };

  const getProjectType = (project: ProjectContract['project']) => {
    return typeof project === 'object' ? project.projectType : 'N/A';
  };

  const getContractorName = (contractor: ProjectContract['contractor']) => {
    return typeof contractor === 'object' ? contractor.companyName : 'Unknown Contractor';
  };

  const getContractorType = (contractor: ProjectContract['contractor']) => {
    return typeof contractor === 'object' ? contractor.contractorType : 'N/A';
  };

  const getContractorEmail = (contractor: ProjectContract['contractor']) => {
    return typeof contractor === 'object' ? contractor.user?.email : 'N/A';
  };

  const getContractorPhone = (contractor: ProjectContract['contractor']) => {
    return typeof contractor === 'object' ? contractor.phoneNumber : 'N/A';
  };

  const getContractorAddress = (contractor: ProjectContract['contractor']) => {
    return typeof contractor === 'object' ? contractor.address : 'N/A';
  };

  const getContractorPaymentTerms = (contractor: ProjectContract['contractor']) => {
    return typeof contractor === 'object' ? contractor.paymentTerms : 'N/A';
  };

  const getContractorBankDetails = (contractor: ProjectContract['contractor']) => {
    return typeof contractor === 'object' ? contractor.bankDetails : 'N/A';
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden border border-gray-200 transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
          <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden border border-gray-200 transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <div className="p-12 text-center">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contract Not Found</h3>
              <p className="text-gray-600 mb-6">The contract you're looking for doesn't exist or has been deleted.</p>
              <Button onClick={onClose} className="bg-orange-600 hover:bg-orange-700">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden border border-gray-200 transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-orange-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Handshake className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Project Contract Details</h3>
                  <p className="text-orange-100 text-sm">
                    {getProjectName(contract.project)} - {getContractorName(contract.contractor)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => onEdit(contract)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white"
                >
                  Edit Contract
                </Button>
                <button
                  onClick={onClose}
                  className="text-white hover:text-orange-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Contract Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    Contract Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Contract Type:</span>
                      <span className="text-sm text-gray-900">{contract.contractType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Total Amount:</span>
                      <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatPKRCurrency(contract.totalAmount.toString())}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.isTerminated)}`}>
                        {getStatusIcon(contract.isTerminated)}
                        {contract.isTerminated ? 'Terminated' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Timeline
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Start Date:</span>
                      <span className="text-sm text-gray-900 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(contract.startDate)}
                      </span>
                    </div>
                    {contract.endDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">End Date:</span>
                        <span className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(contract.endDate)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Created:</span>
                      <span className="text-sm text-gray-900 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {contract.createdAt ? formatDate(contract.createdAt) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Project Information
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Project Name:</span>
                      <span className="text-sm font-semibold text-gray-900">{getProjectName(contract.project)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Project Code:</span>
                      <span className="text-sm text-gray-900 font-mono">{getProjectCode(contract.project)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Location:</span>
                      <span className="text-sm text-gray-900 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {getProjectLocation(contract.project)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Category:</span>
                      <span className="text-sm text-gray-900 capitalize">{getProjectCategory(contract.project)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Type:</span>
                      <span className="text-sm text-gray-900 capitalize">{getProjectType(contract.project)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Contractor Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Contractor Information
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Company Name:</span>
                      <span className="text-sm font-semibold text-gray-900">{getContractorName(contract.contractor)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Contractor Type:</span>
                      <span className="text-sm text-gray-900 capitalize">{getContractorType(contract.contractor)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <span className="text-sm text-gray-900 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {getContractorEmail(contract.contractor)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Phone:</span>
                      <span className="text-sm text-gray-900 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {getContractorPhone(contract.contractor)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Address:</span>
                      <span className="text-sm text-gray-900">{getContractorAddress(contract.contractor)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-purple-600" />
                    Payment Information
                  </h4>
                  <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Payment Terms:</span>
                      <span className="text-sm text-gray-900">{getContractorPaymentTerms(contract.contractor)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Bank Details:</span>
                      <span className="text-sm text-gray-900">{getContractorBankDetails(contract.contractor)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Total Payments:</span>
                      <span className="text-sm font-semibold text-gray-900">{contract.payments?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {contract.Description && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      Description
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{contract.Description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="mr-3"
            >
              Close
            </Button>
            <Button
              onClick={() => onEdit(contract)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Edit Contract
            </Button>
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
};
