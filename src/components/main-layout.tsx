
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
              <Image src="https://i.ibb.co/3sW2tN4/moovie-logo.png" alt="Moovie Logo" width={110} height={32} className="group-data-[collapsible=icon]:hidden"/>
              <Image src="https://i.ibb.co/b232X9J/moovie-icon.png" alt="Moovie Icon" width={32} height={32} className="hidden group-data-[collapsible=icon]:block"/>
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
