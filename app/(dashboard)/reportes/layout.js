'use client';

import ReportesSubNav from '@/components/reportes/ReportesSubNav';

export default function ReportesLayout({ children }) {
  return (
    <div>
      <ReportesSubNav />
      {children}
    </div>
  );
}
