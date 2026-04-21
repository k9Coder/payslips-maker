import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

function LoaderOverlay() {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/90 px-8 py-6 shadow-xl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1B2A4A]/20 border-t-[#1B2A4A]" />
        <p className="text-sm font-medium text-[#1B2A4A]">שומר...</p>
      </div>
    </div>,
    document.body
  );
}

export function useLoader() {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  return { startLoading, stopLoading, isLoading, Loader: isLoading ? <LoaderOverlay /> : null };
}
