import { useState, useEffect } from 'react';
import { contractorPortalApi, ContractorContractDTO } from '../api/contractorPortalApi';

interface UseContractorContractsResult {
  contracts: ContractorContractDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useContractorContracts = (): UseContractorContractsResult => {
  const [contracts, setContracts] = useState<ContractorContractDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchContracts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contractorPortalApi.getMyContracts();
        if (!cancelled) setContracts(data);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load contracts.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchContracts();
    return () => { cancelled = true; };
  }, [trigger]);

  return { contracts, loading, error, refetch: () => setTrigger(t => t + 1) };
};
