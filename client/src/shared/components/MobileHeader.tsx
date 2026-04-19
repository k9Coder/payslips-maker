import { Menu } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { BRAND_NAME } from './brand/brand';

export function MobileHeader() {
  const { openMobile } = useSidebar();

  return (
    <header className="flex md:hidden items-center justify-between h-14 px-4 bg-white border-b border-gray-200 shrink-0">
      <span className="text-[#1B2A4A] font-bold text-lg">{BRAND_NAME}</span>
      <button
        onClick={openMobile}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="פתח תפריט"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  );
}
