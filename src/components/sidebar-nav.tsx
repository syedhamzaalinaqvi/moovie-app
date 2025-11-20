'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, Clapperboard, Tv } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/browse?type=movie', label: 'Movies', icon: Clapperboard },
  { href: '/browse?type=tv', label: 'TV Shows', icon: Tv },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton
            asChild
            href={item.href}
            isActive={pathname === item.href}
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
