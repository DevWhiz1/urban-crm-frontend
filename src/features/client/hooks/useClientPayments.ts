import { useState, useEffect } from 'react';
import { clientPortalApi, ClientPaymentDTO, ClientPaymentSummary } from '../api/clientPortalApi';

interface UseClientPaymentsResult {
  summary: ClientPaymentSummary | null;
  payments: ClientPaymentDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useClientPayments = (): UseClientPaymentsResult => {
  const [summary, setSummary] = useState<ClientPaymentSummary | null>(null);
  const [payments, setPayments] = useState<ClientPaymentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await clientPortalApi.getMyPayments();
        if (!cancelled) {
          setSummary(data.summary);
          setPayments(data.payments);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load payments.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPayments();
    return () => { cancelled = true; };
  }, [trigger]);

  return { summary, payments, loading, error, refetch: () => setTrigger(t => t + 1) };
};
