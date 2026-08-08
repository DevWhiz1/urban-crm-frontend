import { useState, useEffect } from 'react';
import { contractorPortalApi, ContractorAllPaymentDTO } from '../api/contractorPortalApi';

interface UseContractorAllPaymentsResult {
  payments: ContractorAllPaymentDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useContractorAllPayments = (): UseContractorAllPaymentsResult => {
  const [payments, setPayments] = useState<ContractorAllPaymentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contractorPortalApi.getAllMyPayments();
        if (!cancelled) setPayments(data);
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load payments.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [trigger]);

  return { payments, loading, error, refetch: () => setTrigger(t => t + 1) };
};
