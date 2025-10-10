// collaboration.ts
export interface CollaborationInvitation {
  id: string;
  boardId: string;
  boardName: string;
  fromUser: string;
  fromUserEmail: string;
  toUserEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
  expiresAt: string;
  boardData?: string;
  accessLevel: 'view' | 'edit';
}

export interface Notification {
  id: string;
  type: 'collaboration_invitation' | 'board_access_granted' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data: {
    invitationId?: string;
    targetEmail?: string;
    boardId?: string;
    boardName?: string;
    fromUser?: string;
  };
}

export interface BoardCollaborator {
  boardId: string;
  userEmail: string;
  accessLevel: 'view' | 'edit';
  addedAt: string;
}

class CollaborationService {
  // Get all collaboration invitations
  getCollaborationInvitations(): CollaborationInvitation[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('collaborationInvitations') || '[]');
  }

  // Get invitations for a specific user
  getUserCollaborationInvitations(userEmail: string): CollaborationInvitation[] {
    const invitations = this.getCollaborationInvitations();
    return invitations.filter(
      invitation => 
        invitation.toUserEmail === userEmail && 
        invitation.status === 'pending' &&
        new Date(invitation.expiresAt) > new Date()
    );
  }

  // Create a new collaboration invitation
  createCollaborationInvitation(
    boardId: string,
    boardName: string,
    fromUser: string,
    fromUserEmail: string,
    toUserEmail: string,
    accessLevel: 'view' | 'edit' = 'edit',
    boardData?: any
  ): string {
    const invitation: CollaborationInvitation = {
      id: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      boardId,
      boardName,
      fromUser,
      fromUserEmail,
      toUserEmail,
      status: 'pending',
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      boardData: boardData ? JSON.stringify(boardData) : undefined,
      accessLevel
    };

    const invitations = this.getCollaborationInvitations();
    invitations.push(invitation);
    localStorage.setItem('collaborationInvitations', JSON.stringify(invitations));

    // Create notification for the invited user
    this.createNotification({
      id: `notif-${Date.now()}`,
      type: 'collaboration_invitation',
      title: 'Collaboration Invitation',
      message: `You've been invited to collaborate on "${boardName}" by ${fromUser}`,
      read: false,
      createdAt: new Date().toISOString(),
      data: {
        invitationId: invitation.id,
        targetEmail: toUserEmail,
        boardId: boardId,
        boardName: boardName,
        fromUser: fromUser
      }
    });

    return invitation.id;
  }

  // Create multiple collaboration invitations
  createBulkCollaborationInvitations(
    boardId: string,
    boardName: string,
    fromUser: string,
    fromUserEmail: string,
    toUserEmails: string[],
    accessLevel: 'view' | 'edit' = 'edit',
    boardData?: any
  ): string[] {
    const invitationIds: string[] = [];
    
    toUserEmails.forEach(email => {
      const invitationId = this.createCollaborationInvitation(
        boardId,
        boardName,
        fromUser,
        fromUserEmail,
        email,
        accessLevel,
        boardData
      );
      invitationIds.push(invitationId);
    });

    return invitationIds;
  }

  // Update invitation status
  updateInvitationStatus(invitationId: string, status: 'accepted' | 'declined'): boolean {
    const invitations = this.getCollaborationInvitations();
    const invitationIndex = invitations.findIndex(inv => inv.id === invitationId);
    
    if (invitationIndex === -1) return false;
    
    invitations[invitationIndex].status = status;
    localStorage.setItem('collaborationInvitations', JSON.stringify(invitations));

    // If accepted, add user to board collaborators and create access notification
    if (status === 'accepted') {
      const invitation = invitations[invitationIndex];
      this.addCollaboratorToBoard(invitation.boardId, invitation.toUserEmail, invitation.accessLevel);
      
      // Create board access notification
      this.createNotification({
        id: `access-${Date.now()}`,
        type: 'board_access_granted',
        title: 'Board Access Granted',
        message: `You now have access to "${invitation.boardName}"`,
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          boardId: invitation.boardId,
          boardName: invitation.boardName,
          targetEmail: invitation.toUserEmail
        }
      });
    }

    return true;
  }

  // Add collaborator to board
  addCollaboratorToBoard(boardId: string, userEmail: string, accessLevel: 'view' | 'edit' = 'edit'): void {
    const collaborators: BoardCollaborator[] = JSON.parse(
      localStorage.getItem('boardCollaborators') || '[]'
    );

    // Remove existing entry if any
    const filteredCollaborators = collaborators.filter(
      collab => !(collab.boardId === boardId && collab.userEmail === userEmail)
    );

    filteredCollaborators.push({
      boardId,
      userEmail,
      accessLevel,
      addedAt: new Date().toISOString()
    });

    localStorage.setItem('boardCollaborators', JSON.stringify(filteredCollaborators));
  }

  // Get user's accessible boards
  getUserAccessibleBoards(userEmail: string): string[] {
    const collaborators: BoardCollaborator[] = JSON.parse(
      localStorage.getItem('boardCollaborators') || '[]'
    );
    
    return collaborators
      .filter(collab => collab.userEmail === userEmail)
      .map(collab => collab.boardId);
  }

  // Check if user has access to a board
  hasBoardAccess(boardId: string, userEmail: string): boolean {
    const collaborators: BoardCollaborator[] = JSON.parse(
      localStorage.getItem('boardCollaborators') || '[]'
    );
    
    return collaborators.some(
      collab => collab.boardId === boardId && collab.userEmail === userEmail
    );
  }

  // Get user's access level for a board
  getUserAccessLevel(boardId: string, userEmail: string): 'view' | 'edit' | null {
    const collaborators: BoardCollaborator[] = JSON.parse(
      localStorage.getItem('boardCollaborators') || '[]'
    );
    
    const collaborator = collaborators.find(
      collab => collab.boardId === boardId && collab.userEmail === userEmail
    );
    
    return collaborator ? collaborator.accessLevel : null;
  }

  // Notification methods
  getNotifications(): Notification[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  }

  getUserNotifications(userEmail: string): Notification[] {
    const notifications = this.getNotifications();
    return notifications
      .filter(notification => 
        notification.data.targetEmail === userEmail
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(notification: Notification): void {
    const notifications = this.getNotifications();
    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  markNotificationAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const notificationIndex = notifications.findIndex(notif => notif.id === notificationId);
    
    if (notificationIndex !== -1) {
      notifications[notificationIndex].read = true;
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }

  markAllNotificationsAsRead(userEmail: string): void {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(notification => {
      if (notification.data.targetEmail === userEmail) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  }

  getUnreadCount(userEmail: string): number {
    const notifications = this.getUserNotifications(userEmail);
    return notifications.filter(notification => !notification.read).length;
  }

  // Remove expired invitations
  cleanupExpiredInvitations(): void {
    const invitations = this.getCollaborationInvitations();
    const now = new Date();
    const validInvitations = invitations.filter(inv => new Date(inv.expiresAt) > now);
    localStorage.setItem('collaborationInvitations', JSON.stringify(validInvitations));
  }
}

export const collaborationService = new CollaborationService();