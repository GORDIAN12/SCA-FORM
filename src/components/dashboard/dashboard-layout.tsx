'use client';

import { useState, useEffect, useMemo } from 'react';
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
import type { Evaluation, CuppingSession, Invitation } from '@/lib/types';
import { SessionView } from './session-view';
import { CuppingCompassLogo } from '../cupping-compass-logo';
import {
  Coffee,
  PlusCircle,
  Settings,
  LogOut,
  Trash2,
  Users,
  Send,
  Mail,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth, useUser, useFirestore, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  deleteDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useMemoFirebase } from '@/firebase/provider';
import { InvitationsView } from './invitations-view';

export function DashboardLayout() {
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const [key, setKey] = useState(Date.now());
  const [theme, setTheme] = useState('light');
  const { toast } = useToast();

  const sessionsQuery = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return query(
      collection(firestore, 'sessions'),
      where('participantUids', 'array-contains', user.uid)
    );
  }, [firestore, user?.uid]);
  const { data: sessions = [], isLoading: isLoadingSessions } =
    useCollection<CuppingSession>(sessionsQuery);

  const selectedSession = useMemo(
    () => (sessions ? sessions.find((s) => s.id === selectedSessionId) || null : null),
    [sessions, selectedSessionId]
  );

  useEffect(() => {
    if (!selectedSessionId && sessions && sessions.length > 0) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const handleCreateSession = async () => {
    if (!newSessionName.trim() || !user) return;
    try {
      await addDoc(collection(firestore, 'sessions'), {
        name: newSessionName,
        adminUid: user.uid,
        participantUids: [user.uid],
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Session Created',
        description: `"${newSessionName}" has been created.`,
      });
      setNewSessionName('');
      setIsNewSessionDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error creating session',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !selectedSession || !user) return;
    try {
      await addDoc(collection(firestore, 'invitations'), {
        sessionId: selectedSession.id,
        sessionName: selectedSession.name,
        invitedEmail: inviteEmail,
        invitedBy: user.uid,
        status: 'pending',
      });
      toast({
        title: 'Invitation Sent',
        description: `${inviteEmail} has been invited to "${selectedSession.name}".`,
      });
      setInviteEmail('');
      setIsInviteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error sending invitation',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setKey(Date.now());
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error Signing Out',
        description: 'Could not sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const currentTitle = selectedSession?.name || 'Cargando...';

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
          <div className="p-2 font-semibold">Sesiones de Cata</div>
          <SidebarMenu>
            <SidebarMenuItem>
              <Dialog
                open={isNewSessionDialogOpen}
                onOpenChange={setIsNewSessionDialogOpen}
              >
                <DialogTrigger asChild>
                  <SidebarMenuButton>
                    <PlusCircle />
                    <span>Nueva Sesión</span>
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Sesión de Cata</DialogTitle>
                    <DialogDescription>
                      Dale un nombre a tu nueva sesión. Luego podrás invitar a
                      otros a unirse.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="session-name">Nombre de la Sesión</Label>
                    <Input
                      id="session-name"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="e.g., Catación de Etiopías"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateSession}
                      disabled={!newSessionName.trim()}
                    >
                      Crear Sesión
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </SidebarMenuItem>
            {isLoadingSessions && (
              <>
                <div className="p-2">
                  <div className="h-6 w-3/4 animate-pulse rounded-md bg-muted/50" />
                </div>
                <div className="p-2">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted/50" />
                </div>
              </>
            )}
            {sessions && sessions.map((session) => (
              <SidebarMenuItem key={session.id} className="relative group">
                <SidebarMenuButton
                  onClick={() => handleSelectSession(session.id)}
                  isActive={selectedSessionId === session.id}
                  tooltip={{
                    children: session.name,
                    className: 'w-48 text-center',
                  }}
                  className="w-full pr-8"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Users />
                    <span className="truncate">{session.name}</span>
                  </div>
                </SidebarMenuButton>

                <div className="absolute right-1 top-1.5 flex items-center">
                  {session.adminUid === user?.uid && (
                     <Dialog
                      open={isInviteDialogOpen}
                      onOpenChange={setIsInviteDialogOpen}
                    >
                      <DialogTrigger asChild>
                         <button
                           onClick={(e) => e.stopPropagation()}
                           className="p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                          aria-label={`Invitar a ${session.name}`}
                        >
                          <Send className="size-4 shrink-0" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Invitar a &quot;{session.name}&quot;
                          </DialogTitle>
                          <DialogDescription>
                            Ingresa el email del usuario que quieres invitar a
                            esta sesión.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label htmlFor="invite-email">
                            Email del invitado
                          </Label>
                          <Input
                            id="invite-email"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="usuario@example.com"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleInviteUser}
                            disabled={!inviteEmail.trim()}
                          >
                            Enviar Invitación
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="mt-4">
            <InvitationsView />
          </div>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Dialog>
                <DialogTrigger asChild>
                  <SidebarMenuButton
                    tooltip={{
                      children: 'Settings',
                    }}
                  >
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                      Customize your experience.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="language" className="text-right">
                        Language
                      </Label>
                      <Select defaultValue="en">
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Interface Theme</Label>
                      <RadioGroup
                        value={theme}
                        onValueChange={setTheme}
                        className="col-span-3 flex items-center space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="light" />
                          <Label htmlFor="light">Light</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="dark" />
                          <Label htmlFor="dark">Dark</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    className="justify-start"
                    tooltip={{ children: 'User Profile' }}
                  >
                    <Avatar className="size-6">
                      <AvatarImage
                        src={user?.photoURL ?? 'https://picsum.photos/100'}
                      />
                      <AvatarFallback>
                        {user?.email?.[0].toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>User Profile</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.displayName ?? 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold sm:text-xl">
              {currentTitle}
            </h2>
          </div>
        </header>
        <main id="main-content" className="flex-1 overflow-auto p-4 sm:p-6">
          <SessionView
            key={key}
            session={selectedSession}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
