import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientReceipt from '../client/ClientReceipt';
import ContractorReceipt from '../contractor/ContractorReceipt';
import { Breadcrumbs } from '../../ui/Breadcrumbs';
import apiClient from '../../../services/apiClient';

export const AdminReceiptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [payment, setPayment] = useState<any>(null);
  const [project, setProject] = useState<{ name: string; projectCode: string } | null>(null);
  const [clientName, setClientName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Payment ID is required.');
      setLoading(false);
      return;
    }

    apiClient.get(`/api/payment/payment-detail/${id}`)
      .then((response) => {
        const data = response.data;
        setPayment(data);
        if (data.project) {
          setProject({ name: data.project.name, projectCode: data.project.projectCode });
        } else {
          setProject({ name: 'Unknown Project', projectCode: 'N/A' });
        }
        setClientName(data.contractor?.companyName || data.project?.customer?.user?.userName || 'Admin / Contractor');
      })
      .catch((err) => {
        console.error('Failed to fetch payment', err);
        setError('Failed to load receipt details. It might not exist or you do not have permission.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

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
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200 bg-white print:hidden">
        <Breadcrumbs
          items={[
            { label: 'Payments', path: '/dashboard/payments' },
            { label: 'Receipt' },
          ]}
        />
      </div>
      <div className="flex-1 bg-gray-50 overflow-auto">
        {payment.type === 'debit' ? (
          <ContractorReceipt 
            payment={payment}
            project={project}
            contractorName={clientName}
            onBack={() => navigate(-1)}
            hideBackButton={true}
          />
        ) : (
          <ClientReceipt 
            payment={payment}
            project={project}
            clientName={clientName}
            onBack={() => navigate(-1)}
            hideBackButton={true}
          />
        )}
      </div>
    </div>
  );
};
