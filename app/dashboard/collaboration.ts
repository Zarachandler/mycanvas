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

// Simulate sending email (in a real app, you'd use an email service)
const sendEmailNotification = async (toEmail: string, subject: string, message: string) => {
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
};

export const sendCollaborationInvitation = async (toEmail: string, boardId: string, boardName: string) => {
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
    const emailResult = await sendEmailNotification(toEmail, emailSubject, emailMessage);
    console.log('Email sent:', emailResult);
  } catch (error) {
    console.error('Failed to send email:', error);
  }

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
      boardId: boardId,
      boardName: boardName,
      fromUser: fromUser.split('@')[0],
      fromUserEmail: fromUserEmail
    }
  };

  const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  allNotifications.push(notification);
  localStorage.setItem('notifications', JSON.stringify(allNotifications));

  return invitation;
};

// Get unread notification count for a user
export const getUnreadNotificationCount = (userEmail: string): number => {
  if (typeof window === 'undefined') return 0;
  
  const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]') as Notification[];
  const userNotifications = allNotifications.filter(notification => 
    !notification.read && notification.data?.targetEmail === userEmail
  );
  
  return userNotifications.length;
};

// Get pending collaboration invitations for a user
export const getPendingInvitations = (userEmail: string): CollaborationInvitation[] => {
  if (typeof window === 'undefined') return [];
  
  const allInvitations = JSON.parse(localStorage.getItem('collaborationInvitations') || '[]') as CollaborationInvitation[];
  const userInvitations = allInvitations.filter(invitation => 
    invitation.toUserEmail === userEmail && invitation.status === 'pending'
  );
  
  return userInvitations;
};

// Mark notification as read
export const markNotificationAsRead = (notificationId: string): void => {
  const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]') as Notification[];
  const updatedNotifications = allNotifications.map(notification =>
    notification.id === notificationId ? { ...notification, read: true } : notification
  );
  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
};

// Update invitation status
export const updateInvitationStatus = (invitationId: string, status: 'accepted' | 'declined'): void => {
  const allInvitations = JSON.parse(localStorage.getItem('collaborationInvitations') || '[]') as CollaborationInvitation[];
  const updatedInvitations = allInvitations.map(invitation =>
    invitation.id === invitationId ? { ...invitation, status } : invitation
  );
  localStorage.setItem('collaborationInvitations', JSON.stringify(updatedInvitations));
};