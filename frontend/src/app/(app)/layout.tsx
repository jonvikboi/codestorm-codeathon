import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
