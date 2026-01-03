import React from 'react';

/**
 * IMPORTING GLOBAL STYLES
 * Using a direct relative path to ensure the bundler can locate the file
 * within the 'src/app' directory.
 */
import './globals.css';

/**
 * AUTH PROVIDER IMPORT
 * Switched from an alias to a relative path ('../context/AuthContext')
 * to ensure resolution from 'src/app/layout.tsx' to 'src/context/AuthContext.tsx'.
 */
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Cortex - Wealth Optimizer',
  description: 'Mathematical retirement and tax drawdown engine',
};

/**
 * ROOT LAYOUT
 * The top-level component that wraps every page in your application.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}