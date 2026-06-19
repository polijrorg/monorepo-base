'use client';

import { Toaster } from 'sonner';

export const ToastProvider = () => {
  return <Toaster position="bottom-center" toastOptions={{
    classNames: {
      toast: 'font-rubik text-xl px-3 py-4 border-2 border-pink-500 w-fit'
    }
  }} />;
};
