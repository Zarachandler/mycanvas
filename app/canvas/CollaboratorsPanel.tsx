'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, Globe, UserPlus, Send } from 'lucide-react';

export interface Collaborator {
  id: string;
  name: string;
  email?: string;
  color: string;
}

interface CollaboratorsPanelProps {
  collaborators: Collaborator[];
  owner?: { id: string; name: string };
  userEmail?: string | null;
  boardTitle?: string;
  canvasData?: any;
  boardId?: string;
}

const ACCESS_OPTIONS = [
  { value: 'no-access', label: 'No access' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'commenter', label: 'Commenter' },
  { value: 'editor', label: 'Editor' },
];

// InviteEmailBar Component
function InviteEmailBar({ onAdd }: { onAdd: (email: string) => void }) {
  const [email, setEmail] = useState('');

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="flex items-center gap-2">
      <Input
        type="email"
        placeholder="Enter Gmail or Microsoft ID"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
      />
      <Button
        type="button"
        size="icon"
        disabled={!isValidEmail(email)}
        onClick={() => {
          onAdd(email);
          setEmail('');
        }}
        title="Add user"
        className="p-2"
      >
        <UserPlus className="w-5 h-5" />
      </Button>
    </div>
  );
}

export default function CollaboratorsPanel({
  collaborators,
  owner,
  userEmail,
  boardTitle = 'My New Board',
  canvasData = { nodes: [], edges: [] },
  boardId = 'default-board',
}: CollaboratorsPanelProps) {
  const [open, setOpen] = useState(false);
  const [accessLevel, setAccessLevel] = useState(ACCESS_OPTIONS[0].value);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSendButton, setShowSendButton] = useState(false);

  const filteredCollaborators = owner
    ? collaborators.filter((c) => c.id !== owner.id)
    : collaborators;

  const userInitial = userEmail && userEmail.length > 0 ? userEmail[0].toUpperCase() : '?';

  const accessLabel =
    ACCESS_OPTIONS.find((option) => option.value === accessLevel)?.label || ACCESS_OPTIONS[0].label;

  const handleAddEmail = (email: string) => {
    // Prevent duplicates
    setInvitedEmails((prev) => (prev.includes(email) ? prev : [...prev, email]));
  };

  const removeInvitedEmail = (emailToRemove: string) => {
    setInvitedEmails((prev) => prev.filter((email) => email !== emailToRemove));
  };

  // Bulk collaboration function sending invitation links to all emails
  const handleStartCollaboration = async () => {
    if (invitedEmails.length === 0) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/canvas/save/invitation/accepts',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: invitedEmails,
          canvasId: boardId,
          boardTitle: boardTitle,
          canvasData: canvasData,
          accessLevel: accessLevel,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error starting collaboration:', result.error);
        throw new Error(result.error || 'Failed to start collaboration');
      }

      console.log('Collaboration started successfully:', result);

      if (result.failed && result.failed.length > 0) {
        alert(`Collaboration partially started. ${result.successful.length} successful, ${result.failed.length} failed.`);
      } else {
        alert('Collaboration started successfully! Invitations sent to all users.');
      }

      setOpen(false);
      setInvitedEmails([]);
      setShowSendButton(false);
    } catch (error) {
      console.error('Request failed:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Collaborators Avatars */}
      <div className="flex items-center -space-x-1 cursor-pointer" onClick={() => setOpen(true)}>
        {filteredCollaborators.map((c) => {
          const initial =
            c.name?.trim()?.[0]?.toUpperCase() || (c.email?.[0]?.toUpperCase() || '?');
          return (
            <Avatar key={c.id} className="w-8 h-8 border-2 border-white">
              <AvatarFallback className="text-xs font-medium" style={{ backgroundColor: c.color }}>
                {initial}
              </AvatarFallback>
            </Avatar>
          );
        })}
      </div>

      {/* Start Collaboration Button - Bottom Right */}
      <Button
        onClick={() => setOpen(true)}
        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg"
        size="icon"
      >
        <Users className="w-4 h-4" />
      </Button>

      {/* Invite Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[480px] max-w-full rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Invite to Board
            </DialogTitle>
            <DialogDescription className="mb-4">
              Enter emails or invite from Slack, Google, or Microsoft
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Invite Email Bar */}
            <div>
              <Label htmlFor="invite-emails" className="mb-2">
                Invite people
              </Label>
              <InviteEmailBar onAdd={handleAddEmail} />

              {/* Show invited emails without individual accept button */}
              {invitedEmails.length > 0 && (
                <div className="mt-2 space-y-2">
                  <Label className="text-xs text-gray-500">Pending invitations:</Label>
                  <div className="space-y-2">
                    {invitedEmails.map((email, index) => (
                      <div key={index} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm flex-1">{email}</span>
                        <div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeInvitedEmail(email)}
                            className="h-7 px-2 text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Shareable link</Label>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={`https://your-app.com/invite/${boardId}`}
                  className="flex-1 text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://your-app.com/invite/${boardId}`);
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Board Access
              </div>

              {/* Current User */}
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-red-100 text-red-600 text-xs font-bold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-medium">You</div>
                  <div className="text-xs text-gray-500">Board owner</div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Owner
                </Badge>
              </div>

              {/* Anyone with link */}
              <div className="flex items-center gap-3 p-2 rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Anyone with the link</div>
                  <div className="text-xs text-gray-500">People not signed in</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      {accessLabel}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    {ACCESS_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setAccessLevel(option.value)}
                        className={`text-xs ${
                          accessLevel === option.value ? 'bg-accent font-medium' : ''
                        }`}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Empty state message */}
              {filteredCollaborators.length === 0 && invitedEmails.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <div>You haven&apos;t invited anyone to your team yet</div>
                </div>
              )}

              {/* Collaborators list */}
              {filteredCollaborators.map((collaborator) => {
                const initial =
                  collaborator.name?.trim()?.[0]?.toUpperCase() ||
                  (collaborator.email?.[0]?.toUpperCase() || '?');
                return (
                  <div key={collaborator.id} className="flex items-center gap-3 p-2 rounded-lg border">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback
                        className="text-xs font-medium"
                        style={{ backgroundColor: collaborator.color }}
                      >
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{collaborator.name}</div>
                      <div className="text-xs text-gray-500">{collaborator.email}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {accessLevel === 'viewer'
                        ? 'Viewer'
                        : accessLevel === 'commenter'
                        ? 'Commenter'
                        : 'Editor'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setInvitedEmails([]);
                setShowSendButton(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>

            {!showSendButton ? (
              <Button
                onClick={() => setShowSendButton(true)}
                disabled={invitedEmails.length === 0}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Users className="w-4 h-4 mr-2" />
                Start Collaboration
              </Button>
            ) : (
              <Button
                onClick={handleStartCollaboration}
                disabled={isLoading || invitedEmails.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending All...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send All Invitations ({invitedEmails.length})
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}