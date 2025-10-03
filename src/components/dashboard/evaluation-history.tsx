'use client';

import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PlusCircle, FileText, BookOpen, Settings, LogOut } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface EvaluationHistoryProps {
  onDraftsClick: () => void;
  onSettingsClick: () => void;
}

export function EvaluationHistory({ onDraftsClick, onSettingsClick }: EvaluationHistoryProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === '/'}>
            <Link href="/">
              <PlusCircle className="size-4" />
              <span>New Evaluation</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onDraftsClick}>
              <FileText className="size-4" />
              <span>Mis Borradores</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
           <SidebarMenuButton asChild isActive={pathname === '/history'}>
            <Link href="/history">
              <BookOpen className="size-4" />
              <span>Historial</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton onClick={onSettingsClick}>
                <Settings className="size-4" />
                <span>Settings</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton
                onClick={async () => {
                    const { getAuth, signOut } = await import('firebase/auth');
                    const auth = getAuth();
                    await signOut(auth);
                    router.push('/login');
                }}
            >
                <LogOut className="size-4" />
                <span>Logout</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
