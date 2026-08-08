import { useState, useEffect } from 'react';
import { clientPortalApi, ClientProjectDTO } from '../api/clientPortalApi';

interface UseClientProjectResult {
  project: ClientProjectDTO | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useClientProject = (): UseClientProjectResult => {
  const [project, setProject] = useState<ClientProjectDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await clientPortalApi.getMyProject();
        if (!cancelled) setProject(data);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load project.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProject();
    return () => { cancelled = true; };
  }, [trigger]);

  return { project, loading, error, refetch: () => setTrigger(t => t + 1) };
};
