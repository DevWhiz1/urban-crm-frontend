import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractorPortalApi, ContractorAllPaymentDTO } from '../api/contractorPortalApi';
import ContractorReceipt from '../../../components/receipts/contractor/ContractorReceipt';
import { useAuth } from '../../../contexts/AuthContext';
import { Breadcrumbs } from '../../../components/ui/Breadcrumbs';

export const ContractorReceiptPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [payment, setPayment] = useState<ContractorAllPaymentDTO | null>(null);
  const [project, setProject] = useState<{ name: string; projectCode: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paymentId) {
      setError('Payment ID is required.');
      setLoading(false);
      return;
    }

    contractorPortalApi.getMyPaymentById(paymentId)
      .then((data) => {
        setPayment(data.payment);
        setProject(data.contract?.project || { name: 'Unknown', projectCode: 'N/A' });
      })
      .catch((err) => {
        console.error('Failed to fetch payment', err);
        setError('Failed to load receipt details. It might not exist or you do not have permission.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <p className="text-sm text-gray-500">Loading receipt details...</p>
        </div>
      </div>
    );
  }

  if (error || !payment || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <div className="text-red-500 text-5xl mb-2">⚠</div>
        <p className="text-gray-700 font-medium">{error || 'Receipt not found.'}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto w-full pt-4 px-4 sm:px-6 lg:px-8 print:hidden">
        <Breadcrumbs
          items={[
            { label: 'Payments', path: '/contractor/payments' },
            { label: 'Receipt' },
          ]}
        />
      </div>
      <div className="flex-1">
        <ContractorReceipt 
          payment={payment}
          project={project}
          contractorName={user?.userName || 'Contractor'}
          onBack={() => navigate(-1)}
          hideBackButton={true}
        />
      </div>
    </div>
  );
};
