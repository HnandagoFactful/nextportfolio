'use client';

import pageProvider from '@/providers/PageProvider';
import KnowbleView from '@/views/knowble/KnowbleView';
import useAlerts from '@/hooks/useAlerts';

export default function KnowblePage() {
  const { alert, resetAlert, setAlertContentType } = useAlerts();

  return (
    <pageProvider.Provider value={{
      pageName: 'knowble',
      ...alert,
      setAlertContentType,
      resetAlert,
    }}>
      <KnowbleView />
    </pageProvider.Provider>
  );
}
