import { useState, useEffect } from 'react';
import { contractorPortalApi, ContractorPaymentDTO, ContractorPaymentSummary } from '../api/contractorPortalApi';

interface UseContractorPaymentsResult {
  summary: ContractorPaymentSummary | null;
  payments: ContractorPaymentDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useContractorPayments = (contractId: string | null): UseContractorPaymentsResult => {
  const [summary, setSummary] = useState<ContractorPaymentSummary | null>(null);
  const [payments, setPayments] = useState<ContractorPaymentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!contractId) {
      setSummary(null);
      setPayments([]);
      return;
    }

    let cancelled = false;

    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contractorPortalApi.getMyContractPayments(contractId);
        if (!cancelled) {
          setSummary(data.summary);
          setPayments(data.payments);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load contract payments.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPayments();
    return () => { cancelled = true; };
  }, [contractId, trigger]);

  return { summary, payments, loading, error, refetch: () => setTrigger(t => t + 1) };
};
