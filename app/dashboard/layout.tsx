import type { Metadata } from 'next';
import DashboardShell from '@/components/layout/DashboardShell';

export const metadata: Metadata = {
  title: 'EventBoard — Dashboard',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
