'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

interface EvaluationHistoryProps {
  userId: string;
}

export function EvaluationHistory({ userId }: EvaluationHistoryProps) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/'}>
          <Link href="/">
            <PlusCircle className="size-4" />
            <span>New Evaluation</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {/* The history has been removed as per user request */}
    </SidebarMenu>
  );
}
