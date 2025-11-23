
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { UserNav } from '@/components/user-nav';
import { Separator } from './ui/separator';
import Image from 'next/image';
import Link from 'next/link';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="border-r border-border/50">
        <SidebarHeader>
          <div className="flex items-center justify-center p-2 h-[64px]">
             <Link href="/">
                <div className="flex items-center justify-center h-full">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
                        Moovie
                    </h1>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent hidden group-data-[collapsible=icon]:block">
                        M
                    </h1>
                </div>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
            <UserNav />
            <Separator className="my-1" />
            <div className="p-2 hidden md:flex justify-end">
              <SidebarTrigger />
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
