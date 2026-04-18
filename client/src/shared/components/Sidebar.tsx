import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
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

  return (
    <aside
      className={cn(
        'flex flex-col bg-white border-e border-gray-200 transition-all duration-200 shrink-0',
        collapsed ? 'w-16' : 'w-56',
        className
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-gray-200 select-none',
          collapsed && 'justify-center px-2'
        )}
      >
        {!collapsed && (
          <span className="text-[#1B2A4A] font-bold text-lg truncate">פשוט תלוש</span>
        )}
        {collapsed && (
          <span className="text-[#1B2A4A] font-bold text-lg">פ</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="hidden md:flex items-center justify-center h-10 border-t border-gray-200 text-gray-400 hover:text-slate-700 hover:bg-gray-50 transition-colors"
        aria-label={collapsed ? 'הרחב תפריט' : 'כווץ תפריט'}
      >
        {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </aside>
  );
}
