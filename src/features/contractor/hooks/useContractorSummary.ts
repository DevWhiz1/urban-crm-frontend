import { useState, useEffect } from 'react';
import { contractorPortalApi, ContractorSummaryDTO } from '../api/contractorPortalApi';

interface UseContractorSummaryResult {
  summary: ContractorSummaryDTO | null;
  loading: boolean;
  error: string | null;
}

export const useContractorSummary = (): UseContractorSummaryResult => {
  const [summary, setSummary] = useState<ContractorSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contractorPortalApi.getSummary();
        if (!cancelled) setSummary(data);
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load summary.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  return { summary, loading, error };
};
