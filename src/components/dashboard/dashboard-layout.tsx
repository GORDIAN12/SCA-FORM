'use client';

import { useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockSessions } from '@/lib/mock-data';
import type { Session } from '@/lib/types';
import { SessionView } from './session-view';
import { CuppingCompassLogo } from '../cupping-compass-logo';
import { Coffee, Settings } from 'lucide-react';

export function DashboardLayout() {
  const [selectedSession, setSelectedSession] = useState<Session>(
    mockSessions[0]
  );

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <CuppingCompassLogo className="size-8 text-primary" />
            <h1 className="text-xl font-headline font-semibold">
              Cupping Compass
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {mockSessions.map((session) => (
              <SidebarMenuItem key={session.id}>
                <SidebarMenuButton
                  onClick={() => setSelectedSession(session)}
                  isActive={selectedSession.id === session.id}
                  tooltip={{
                    children: session.name,
                    className: 'w-48 text-center',
                  }}
                >
                  <Coffee />
                  <span>{session.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={{
                  children: 'Settings',
                }}
              >
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="justify-start"
                tooltip={{ children: 'User Profile' }}
              >
                <Avatar className="size-6">
                  <AvatarImage src="https://picsum.photos/100" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span>User Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold sm:text-xl">
              {selectedSession.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Cupping Date: {selectedSession.date}
            </p>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <SessionView session={selectedSession} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
