
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
              <Image src="/moovie-logo.png" alt="Moovie Logo" width={110} height={32} className="group-data-[collapsible=icon]:hidden"/>
              {/* For the collapsed view, we can use the same logo but constrained to a square */}
              <div className="hidden group-data-[collapsible=icon]:block w-[32px] h-[32px] relative">
                <Image src="/moovie-logo.png" alt="Moovie Icon" layout="fill" objectFit="contain"/>
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
