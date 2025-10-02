'use client';

import {
  collection,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  arrayUnion,
} from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { useMemoFirebase } from '@/firebase/provider';
import type { Invitation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Check, X } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function InvitationsView() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const invitationsQuery = useMemoFirebase(() => {
    if (!user?.email) return null;
    return query(
      collection(firestore, 'invitations'),
      where('invitedEmail', '==', user.email),
      where('status', '==', 'pending')
    );
  }, [firestore, user?.email]);

  const { data: invitations = [], isLoading } =
    useCollection<Invitation>(invitationsQuery);

  const handleInvitation = async (
    invitation: Invitation,
    status: 'accepted' | 'rejected'
  ) => {
    if (!user) return;
    const invitationRef = doc(firestore, 'invitations', invitation.id);
    try {
      if (status === 'accepted') {
        await updateDoc(invitationRef, { status: 'accepted' });
        const sessionRef = doc(firestore, 'sessions', invitation.sessionId);
        await updateDoc(sessionRef, {
          participantUids: arrayUnion(user.uid),
        });
        toast({
          title: 'Invitation Accepted',
          description: `You've joined the session "${invitation.sessionName}".`,
        });
      } else {
        // For rejections, we can just delete the invitation
        await deleteDoc(invitationRef);
        toast({
          title: 'Invitation Rejected',
          description: `You've rejected the invitation to "${invitation.sessionName}".`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update invitation: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="size-5" />
            <span>Invitaciones</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null; // Don't show the card if there are no pending invitations
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Mail className="size-5" />
          <span>Invitaciones Pendientes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {invitations.map((invitation) => (
            <li
              key={invitation.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded-md bg-accent/50"
            >
              <p className="text-sm truncate">
                Join <strong>{invitation.sessionName}</strong>
              </p>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-green-600 hover:bg-green-100 hover:text-green-700"
                  onClick={() => handleInvitation(invitation, 'accepted')}
                >
                  <Check className="size-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-red-600 hover:bg-red-100 hover:text-red-700"
                  onClick={() => handleInvitation(invitation, 'rejected')}
                >
                  <X className="size-5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
