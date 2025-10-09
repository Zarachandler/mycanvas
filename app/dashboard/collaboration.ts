// lib/collaboration.ts

export type CollaborationInvitation = {
  id: string;
  boardId: string;
  boardName: string;
  fromUser: string;
  fromUserEmail: string;
  toUserEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
  expiresAt: string;
};

export type Notification = {
  id: string;
  type: 'collaboration_invitation' | 'system' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
};

export const sendCollaborationInvitation = (toEmail: string, boardId: string, boardName: string) => {
  const fromUser = localStorage.getItem('userEmail') || 'Unknown User';
  const fromUserEmail = localStorage.getItem('userEmail') || 'unknown@example.com';
  
  const invitation: CollaborationInvitation = {
    id: `invite-${Date.now()}`,
    boardId: boardId,
    boardName: boardName,
    fromUser: fromUser.split('@')[0],
    fromUserEmail: fromUserEmail,
    toUserEmail: toEmail,
    status: 'pending',
    sentAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  // Save invitation to localStorage
  const allInvitations = JSON.parse(localStorage.getItem('collaborationInvitations') || '[]');
  allInvitations.push(invitation);
  localStorage.setItem('collaborationInvitations', JSON.stringify(allInvitations));

  // Create notification for the invited user
  const notification: Notification = {
    id: `notif-${Date.now()}`,
    type: 'collaboration_invitation',
    title: 'Collaboration Invitation',
    message: `You've been invited to collaborate on "${boardName}" by ${fromUser.split('@')[0]}`,
    read: false,
    createdAt: new Date().toISOString(),
    data: {
      invitationId: invitation.id,
      targetEmail: toEmail,
      boardId: boardId
    }
  };

  const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  allNotifications.push(notification);
  localStorage.setItem('notifications', JSON.stringify(allNotifications));

  return invitation;
};