import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lab Monitor | GENEForge',
  description: 'Monitor your lab experiments and equipment in real-time.',
};

export default function LabMonitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add any lab monitor specific providers/context here
  
  return (
    <>
      {children}
    </>
  );
} 