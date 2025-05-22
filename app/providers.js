'use client';

import { ThemeProvider } from './theme/ThemeContext';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
} 