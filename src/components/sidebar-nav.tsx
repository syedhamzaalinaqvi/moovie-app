
'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, Clapperboard, Tv, Film } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const navItems = [
  { href: '/', label: 'Browse All', icon: Home, type: null, genre: null, region: null },
  { href: '/?type=movie', label: 'Movies', icon: Clapperboard, type: 'movie', genre: null, region: null },
  { href: '/?type=tv', label: 'TV Shows', icon: Tv, type: 'tv', genre: null, region: null },
];

const categories = [
  { href: '/?genre=28', label: 'Action', genre: '28' },
  { href: '/?genre=53', label: 'Thriller', genre: '53' },
  { href: '/?genre=27', label: 'Horror', genre: '27' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type');
  const currentGenre = searchParams.get('genre');
  const currentRegion = searchParams.get('region');

  const isActive = (item: typeof navItems[0]) => {
    if (item.href === '/') {
      return pathname === '/' && !currentType && !currentGenre && !currentRegion;
    }
    return pathname === '/' && currentType === item.type;
  }

  const isCategoryActive = (item: typeof categories[0]) => {
    return pathname === '/' && currentGenre === item.genre;
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
