'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Calendar, Building2, BarChart3, Settings, DollarSign } from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

const navItems = [
  {
    href: '/',
    icon: Calendar,
    label: 'Plantões',
  },
  {
    href: '/locais',
    icon: Building2,
    label: 'Locais',
  },
  {
    href: '/pagamentos',
    icon: DollarSign,
    label: 'Pagamentos',
  },
  {
    href: '/resumo',
    icon: BarChart3,
    label: 'Resumo',
  },
  {
    href: '/ajustes',
    icon: Settings,
    label: 'Ajustes',
  },
];

function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center py-2',
        isActive
          ? 'text-purple'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon
        className={cn('w-6 h-6', isActive && 'fill-purple stroke-purple-foreground')}
        strokeWidth={isActive ? 2.5 : 1.8}
      />
      <span className="text-xs mt-1 font-medium">{label}</span>
    </Link>
  );
}

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center z-40">
      <div className="container flex justify-around w-full max-w-md mx-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
          />
        ))}
      </div>
    </nav>
  );
}
