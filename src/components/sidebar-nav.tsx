'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, Clapperboard, Tv } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Browse All', icon: Home, type: undefined },
  { href: '/?type=movie', label: 'Movies', icon: Clapperboard, type: 'movie' },
  { href: '/?type=tv', label: 'TV Shows', icon: Tv, type: 'tv' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type');

  const isActive = (item: typeof navItems[0]) => {
    if (item.href === '/') {
        return pathname === '/' && !currentType;
    }
    return pathname === '/' && currentType === item.type;
  }

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton
            asChild
            href={item.href}
            isActive={isActive(item)}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
