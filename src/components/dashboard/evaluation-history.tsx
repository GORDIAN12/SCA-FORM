'use client';

import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PlusCircle, FileText, BookOpen, Settings, LogOut } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

interface EvaluationHistoryProps {
  onDraftsClick: () => void;
  onSettingsClick: () => void;
}

export function EvaluationHistory({ onDraftsClick, onSettingsClick }: EvaluationHistoryProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === '/'}>
            <Link href="/">
              <PlusCircle className="size-4" />
              <span>{t('newEvaluation')}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onDraftsClick}>
              <FileText className="size-4" />
              <span>{t('myDrafts')}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
           <SidebarMenuButton asChild isActive={pathname === '/history'}>
            <Link href="/history">
              <BookOpen className="size-4" />
              <span>{t('history')}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton onClick={onSettingsClick}>
                <Settings className="size-4" />
                <span>{t('settings')}</span>
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
                <span>{t('logout')}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
