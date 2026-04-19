import { Menu } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { BRAND_NAME } from './brand/brand';
import { CareIcon } from './brand/CareIcon';

export function MobileHeader() {
  const { openMobile } = useSidebar();

  return (
    <header className="flex md:hidden items-center justify-between h-14 px-4 bg-white border-b border-gray-200 shrink-0">
      <div className="flex items-center gap-2">
        <CareIcon size={26} />
        <span className="text-[#1B2A4A] font-bold text-lg" dir="ltr">{BRAND_NAME}</span>
      </div>
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
