import { useCallback, useEffect, useState } from 'react';
import type { EmailDebugStatus } from '@site00-email/types';

const STORAGE_KEY = 'site00-email-debug-status-v1';

export function useEmailDebugStatus() {
  const [statuses, setStatuses] = useState<Record<string, EmailDebugStatus>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStatuses(JSON.parse(raw) as Record<string, EmailDebugStatus>);
    } catch {
      // ignore
    }
  }, []);

  const setStatus = useCallback((templateId: string, status: EmailDebugStatus) => {
    setStatuses((prev) => {
      const next = { ...prev, [templateId]: status };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const getStatus = useCallback(
    (templateId: string, fallback: EmailDebugStatus): EmailDebugStatus => statuses[templateId] ?? fallback,
    [statuses],
  );

  return { statuses, setStatus, getStatus };
}
