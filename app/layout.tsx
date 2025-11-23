import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/ui/Navigation';

export const metadata: Metadata = {
  title: 'Expense Tracker - Manage Your Finances',
  description: 'A modern expense tracking application to help you manage your personal finances',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}

