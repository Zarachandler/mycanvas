// lib/collaborationService.ts

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
}

export interface Notification {
  id: string;
  type: 'collaboration_invitation' | 'system' | 'info' | 'board_update' | 'mention';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: {
    invitationId?: string;
    targetEmail?: string;
    boardId?: string;
    boardName?: string;
    fromUser?: string;
    fromUserEmail?: string;
  };
}

class CollaborationService {
  // Simulate sending email (in a real app, you'd use an email service)
  private async sendEmailNotification(toEmail: string, subject: string, message: string) {
    // In a real application, you would integrate with an email service like:
    // - SendGrid, AWS SES, Resend, etc.
    // For demo purposes, we'll simulate the email sending and log it
    
    console.log('📧 SENDING EMAIL NOTIFICATION:');
    console.log('To:', toEmail);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('---');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would make an API call to your email service
    // Example:
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to: toEmail, subject, message })
    // });
    
    return { success: true, message: 'Email sent successfully' };
  }

  // Send collaboration invitation with email notification
  async sendCollaborationInvitation(
    toEmail: string, 
    boardId: string, 
    boardName: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const fromUser = localStorage.getItem('userEmail') || 'Unknown User';
      const fromUserEmail = localStorage.getItem('userEmail') || 'unknown@example.com';
      
      const invitation: CollaborationInvitation = {
        id: `invite-${Date.now()}`,
        boardId,
        boardName,
        fromUser: fromUser.split('@')[0],
        fromUserEmail,
        toUserEmail: toEmail, // Fixed: assign toEmail to toUserEmail
        status: 'pending',
        sentAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };

      // Send email notification to the invited user
      const emailSubject = `Collaboration Invitation: ${boardName}`;
      const emailMessage = `
Hello!

You've been invited by ${fromUser.split('@')[0]} (${fromUserEmail}) to collaborate on the board "${boardName}".

To accept this invitation and start collaborating:

1. Log in to your MiroClone account
2. Check your notifications (bell icon in top right)
3. Click "Accept" on the collaboration invitation

You can also access the board directly by clicking this link:
${typeof window !== 'undefined' ? `${window.location.origin}/canvas?board=${boardId}&invitation=${invitation.id}` : `/canvas?board=${boardId}&invitation=${invitation.id}`}

This invitation will expire in 7 days.

Happy collaborating!
The MiroClone Team
      `;

      try {
        const emailResult = await this.sendEmailNotification(toEmail, emailSubject, emailMessage);
        console.log('Email sent:', emailResult);
      } catch (error) {
        console.error('Failed to send email:', error);
        // Continue even if email fails - the invitation will still be in the system
      }

      // Save invitation to localStorage
      const existingInvitations = this.getCollaborationInvitations();
      existingInvitations.push(invitation);
      localStorage.setItem('collaborationInvitations', JSON.stringify(existingInvitations));

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
          boardId,
          boardName,
          fromUser: fromUser.split('@')[0],
          fromUserEmail
        }
      };

      const existingNotifications = this.getNotifications();
      existingNotifications.push(notification);
      localStorage.setItem('notifications', JSON.stringify(existingNotifications));

      console.log(`Collaboration invitation sent to ${toEmail}`);
      console.log(`Board: ${boardName}`);
      console.log(`Invitation ID: ${invitation.id}`);

      return {
        success: true,
        message: `Invitation sent to ${toEmail}`
      };

    } catch (error) {
      console.error('Error sending collaboration invitation:', error);
      return {
        success: false,
        message: 'Failed to send invitation'
      };
    }
  }

  // Alternative method with explicit user data
  async sendCollaborationInvitationWithUser(
    boardId: string,
    boardName: string,
    fromUser: string,
    fromUserEmail: string,
    toUserEmail: string // Fixed parameter name
  ): Promise<{ success: boolean; message: string }> {
    return this.sendCollaborationInvitation(toUserEmail, boardId, boardName);
  }

  // Get all collaboration invitations
  getCollaborationInvitations(): CollaborationInvitation[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('collaborationInvitations') || '[]');
  }

  // Get pending collaboration invitations for a specific user
  getPendingInvitations(userEmail: string): CollaborationInvitation[] {
    const invitations = this.getCollaborationInvitations();
    return invitations.filter(invitation => 
      invitation.toUserEmail === userEmail && invitation.status === 'pending'
    );
  }

  // Get user collaboration invitations (alias for getPendingInvitations)
  getUserCollaborationInvitations(userEmail: string): CollaborationInvitation[] {
    return this.getPendingInvitations(userEmail);
  }

  // Get all notifications
  getNotifications(): Notification[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  }

  // Get user notifications
  getUserNotifications(userEmail: string): Notification[] {
    const notifications = this.getNotifications();
    return notifications.filter(notification => 
      !notification.read && notification.data?.targetEmail === userEmail
    );
  }

  // Get unread notification count for a user
  getUnreadNotificationCount(userEmail: string): number {
    return this.getUserNotifications(userEmail).length;
  }

  // Update invitation status
  updateInvitationStatus(invitationId: string, status: 'accepted' | 'declined'): boolean {
    try {
      const invitations = this.getCollaborationInvitations();
      const updatedInvitations = invitations.map(invitation =>
        invitation.id === invitationId ? { ...invitation, status } : invitation
      );
      localStorage.setItem('collaborationInvitations', JSON.stringify(updatedInvitations));
      return true;
    } catch (error) {
      console.error('Error updating invitation status:', error);
      return false;
    }
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): boolean {
    try {
      const notifications = this.getNotifications();
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Add collaborator to board
  addCollaboratorToBoard(boardId: string, userEmail: string): boolean {
    try {
      const boardData = localStorage.getItem(`board-${boardId}-data`);
      if (boardData) {
        const parsedData = JSON.parse(boardData);
        const updatedData = {
          ...parsedData,
          collaborators: [...(parsedData.collaborators || []), userEmail]
        };
        localStorage.setItem(`board-${boardId}-data`, JSON.stringify(updatedData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding collaborator to board:', error);
      return false;
    }
  }

  // Handle collaboration invitation response
  handleCollaborationResponse(
    invitationId: string, 
    accept: boolean, 
    userEmail: string
  ): { success: boolean; redirectUrl?: string } {
    const success = this.updateInvitationStatus(invitationId, accept ? 'accepted' : 'declined');
    
    if (success && accept) {
      // Find the invitation
      const invitations = this.getCollaborationInvitations();
      const invitation = invitations.find(inv => inv.id === invitationId);
      
      if (invitation) {
        // Add user to board collaborators
        this.addCollaboratorToBoard(invitation.boardId, userEmail);
        
        // Return redirect URL
        return {
          success: true,
          redirectUrl: `/canvas?board=${invitation.boardId}&invitation=${invitationId}`
        };
      }
    }
    
    return { success };
  }

  // Get invitation by ID
  getInvitationById(invitationId: string): CollaborationInvitation | null {
    const invitations = this.getCollaborationInvitations();
    return invitations.find(inv => inv.id === invitationId) || null;
  }

  // Check if user has access to board (owner or collaborator)
  hasBoardAccess(boardId: string, userEmail: string): boolean {
    // Check if user is owner
    const boards = JSON.parse(localStorage.getItem('recentBoards') || '[]');
    const isOwner = boards.some((board: any) => 
      board.id === boardId && board.owner === userEmail
    );
    
    if (isOwner) return true;

    // Check if user is collaborator
    const boardData = localStorage.getItem(`board-${boardId}-data`);
    if (boardData) {
      const parsedData = JSON.parse(boardData);
      const collaborators = parsedData.collaborators || [];
      return collaborators.includes(userEmail);
    }

    return false;
  }

  // Remove collaborator from board
  removeCollaboratorFromBoard(boardId: string, userEmail: string): boolean {
    try {
      const boardData = localStorage.getItem(`board-${boardId}-data`);
      if (boardData) {
        const parsedData = JSON.parse(boardData);
        const updatedData = {
          ...parsedData,
          collaborators: (parsedData.collaborators || []).filter((email: string) => email !== userEmail)
        };
        localStorage.setItem(`board-${boardId}-data`, JSON.stringify(updatedData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing collaborator from board:', error);
      return false;
    }
  }

  // Get board collaborators
  getBoardCollaborators(boardId: string): string[] {
    try {
      const boardData = localStorage.getItem(`board-${boardId}-data`);
      if (boardData) {
        const parsedData = JSON.parse(boardData);
        return parsedData.collaborators || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting board collaborators:', error);
      return [];
    }
  }
}

export const collaborationService = new CollaborationService();

// Export individual functions for backward compatibility
export const sendCollaborationInvitation = collaborationService.sendCollaborationInvitation.bind(collaborationService);
export const getPendingInvitations = collaborationService.getPendingInvitations.bind(collaborationService);
export const getUnreadNotificationCount = collaborationService.getUnreadNotificationCount.bind(collaborationService);
export const markNotificationAsRead = collaborationService.markNotificationAsRead.bind(collaborationService);
export const updateInvitationStatus = collaborationService.updateInvitationStatus.bind(collaborationService);