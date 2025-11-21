'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, Clapperboard, Tv, Film, Globe } from 'lucide-react';
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

const countries = [
    { href: '/?region=US', label: 'USA', region: 'US' },
    { href: '/?region=PK', label: 'Pakistan', region: 'PK' },
    { href: '/?region=IN', label: 'India', region: 'IN' },
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

  const isCountryActive = (item: typeof countries[0]) => {
      return pathname === '/' && currentRegion === item.region;
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
      <SidebarMenuItem>
          <Collapsible>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full">
                    <Film/>
                    <span>Categories</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                  <SidebarMenuSub>
                      {categories.map((item) => (
                          <SidebarMenuSubItem key={item.label}>
                            <SidebarMenuSubButton asChild isActive={isCategoryActive(item)}>
                                <Link href={item.href}>{item.label}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                      ))}
                  </SidebarMenuSub>
              </CollapsibleContent>
          </Collapsible>
      </SidebarMenuItem>
       <SidebarMenuItem>
          <Collapsible>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full">
                    <Globe/>
                    <span>Countries</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                  <SidebarMenuSub>
                      {countries.map((item) => (
                          <SidebarMenuSubItem key={item.label}>
                            <SidebarMenuSubButton asChild isActive={isCountryActive(item)}>
                                <Link href={item.href}>{item.label}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                      ))}
                  </SidebarMenuSub>
              </CollapsibleContent>
          </Collapsible>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
