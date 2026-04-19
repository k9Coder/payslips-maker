import { useState } from 'react';
import {
  LayoutDashboard, Users, CalendarDays, FileText,
  Settings, HelpCircle, ChevronRight, ChevronLeft, X,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { useSidebar } from '../context/SidebarContext';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'ראשי' },
  { to: '/employees', icon: Users, label: 'כרטיסי עובדים' },
  { to: '/worklog', icon: CalendarDays, label: 'יומן עבודה' },
  { to: '/payslips', icon: FileText, label: 'תלושי שכר' },
  { to: '/settings', icon: Settings, label: 'הגדרות' },
  { to: '/help', icon: HelpCircle, label: 'עזרה' },
] as const;

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { mobileOpen, closeMobile } = useSidebar();

  const navItems = (
    <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
      {NAV_ITEMS.map((item) => (
        <SidebarItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          collapsed={collapsed}
          onNavigate={closeMobile}
        />
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer — slides in from the right (RTL start edge) */}
      <aside
        className={cn(
          'fixed top-0 start-0 z-50 h-full w-64 bg-white flex flex-col shadow-xl',
          'transition-transform duration-300 ease-in-out',
          'md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        dir="rtl"
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
          <span className="text-[#1B2A4A] font-bold text-lg">פשוט תלוש</span>
          <button
            onClick={closeMobile}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="סגור תפריט"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {navItems}
      </aside>

      {/* Desktop sidebar — collapsible */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-white border-e border-gray-200 transition-all duration-200 shrink-0',
          collapsed ? 'w-16' : 'w-56',
          className
        )}
      >
        <div
          className={cn(
            'flex items-center h-16 px-4 border-b border-gray-200 select-none',
            collapsed && 'justify-center px-2'
          )}
        >
          {!collapsed && <span className="text-[#1B2A4A] font-bold text-lg truncate">פשוט תלוש</span>}
          {collapsed && <span className="text-[#1B2A4A] font-bold text-lg">פ</span>}
        </div>

        {navItems}

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center h-10 border-t border-gray-200 text-gray-400 hover:text-slate-700 hover:bg-gray-50 transition-colors"
          aria-label={collapsed ? 'הרחב תפריט' : 'כווץ תפריט'}
        >
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </aside>
    </>
  );
}
