import { useEffect, useState } from 'react';
import {
  resolveCampaignBoardWeekCalendar,
  type CampaignBoardWeekCalendar,
} from '../utils/campaignBoardWeekCalendar';

/**
 * Live campaign board week — refreshes on visibility return and every minute
 * so dates stay current if the tab stays open overnight.
 */
export function useCampaignBoardWeekCalendar(): CampaignBoardWeekCalendar {
  const [calendar, setCalendar] = useState(() => resolveCampaignBoardWeekCalendar());

  useEffect(() => {
    const refresh = () => setCalendar(resolveCampaignBoardWeekCalendar());
    const interval = window.setInterval(refresh, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return calendar;
}
