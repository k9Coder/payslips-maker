import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

const NAV_ITEMS: { to: string; icon: LucideIcon; label: string }[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'ראשי' },
  { to: '/employees', icon: Users, label: 'עובדים' },
  { to: '/worklog', icon: CalendarDays, label: 'יומן' },
  { to: '/payslips', icon: FileText, label: 'תלושים' },
  { to: '/settings', icon: Settings, label: 'הגדרות' },
  { to: '/help', icon: HelpCircle, label: 'עזרה' },
];

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 flex md:hidden safe-area-inset-bottom">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-[#1B2A4A]' : 'text-gray-400 hover:text-gray-600'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
