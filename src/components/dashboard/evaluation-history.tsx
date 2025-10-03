'use client';

import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, FileText, BookOpen } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface EvaluationHistoryProps {
  onDraftsClick: () => void;
}

export function EvaluationHistory({ onDraftsClick }: EvaluationHistoryProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <SidebarMenu>
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
          <SidebarMenuButton asChild isActive={pathname === '/'}>
            <Link href="/">
              <PlusCircle className="size-4" />
              <span>New Evaluation</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <ScrollArea className="flex-1" />
    </div>
  );
}
