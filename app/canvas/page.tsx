'use client';

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import ZoomableGrid from "../board/ZoomableGrid";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@supabase/supabase-js';
import CollaboratorsPanel, { Collaborator } from "./CollaboratorsPanel";
import {
  StickyNote,
  MousePointer2,
  Type,
  Pencil,
  Crop,
  Globe,
  MessageSquare,
  Plus,
  Users,
  Share,
  Play,
  MoreHorizontal,
  Square,
  Circle,
  Triangle,
  ChevronUp,
  Star,
  Minus,
  ArrowRight,
  ArrowLeft,
  User,
  X,
  UserPlus,
  Bell
} from "lucide-react";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------- TYPES ----------
type ShapeType = {
  id: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type FreehandPath = { 
  id: number | "drawing"; 
  points: string;
};

type CommentType = { 
  id: number; 
  x: number; 
  y: number; 
  text: string;
};

type StickyNoteType = {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  board_id: string;
  created_at?: string;
};

type BoardMetadata = {
  id: string;
  name: string;
  owner: string;
  lastOpened: string;
};

type CollaborationInvitation = {
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

type Notification = {
  id: string;
  type: 'collaboration_invitation' | 'system' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
};

// ---------- COLLABORATION FUNCTIONS ----------
const sendCollaborationInvitation = (toEmail: string, boardId: string, boardName: string) => {
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

const getUnreadNotificationCount = (userEmail: string): number => {
  if (typeof window === 'undefined') return 0;
  
  const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]') as Notification[];
  const userNotifications = allNotifications.filter(notification => 
    !notification.read && notification.data?.targetEmail === userEmail
  );
  
  return userNotifications.length;
};

const getPendingInvitations = (userEmail: string): CollaborationInvitation[] => {
  if (typeof window === 'undefined') return [];
  
  const allInvitations = JSON.parse(localStorage.getItem('collaborationInvitations') || '[]') as CollaborationInvitation[];
  const userInvitations = allInvitations.filter(invitation => 
    invitation.toUserEmail === userEmail && invitation.status === 'pending'
  );
  
  return userInvitations;
};

const markNotificationAsRead = (notificationId: string): void => {
  const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]') as Notification[];
  const updatedNotifications = allNotifications.map(notification =>
    notification.id === notificationId ? { ...notification, read: true } : notification
  );
  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
};

const updateInvitationStatus = (invitationId: string, status: 'accepted' | 'declined'): void => {
  const allInvitations = JSON.parse(localStorage.getItem('collaborationInvitations') || '[]') as CollaborationInvitation[];
  const updatedInvitations = allInvitations.map(invitation =>
    invitation.id === invitationId ? { ...invitation, status } : invitation
  );
  localStorage.setItem('collaborationInvitations', JSON.stringify(updatedInvitations));
};

// ---------- USER DROPDOWN COMPONENT ----------
function UserDropdown({ email, boardId, boardName }: { email: string | null; boardId: string; boardName: string }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [collaborationOpen, setCollaborationOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const startCollaboration = () => {
    setCollaborationOpen(true);
    setAnchorEl(null);
  };

  const handleSendInvitation = () => {
    if (inviteEmail && boardId && boardName) {
      const invitation = sendCollaborationInvitation(inviteEmail, boardId, boardName);
      alert(`Collaboration invitation sent to ${inviteEmail}`);
      setCollaborationOpen(false);
      setInviteEmail('');
    } else {
      alert('Please enter a valid email address');
    }
  };

  return (
    <div className="relative">
      <Button 
        onClick={handleOpen} 
        variant="outline" 
        className="flex items-center gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
      >
        <User className="w-4 h-4" />
        {email ? email : "Loading..."}
      </Button>
      
      {anchorEl && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleClose}
            >
              Profile Settings
            </button>

            <button
              className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-gray-100 cursor-pointer"
              onClick={startCollaboration}
            >
              Start Collaboration
            </button>

            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Collaboration Dialog */}
      <Dialog open={collaborationOpen} onOpenChange={setCollaborationOpen}>
        <DialogContent className="w-[480px] max-w-full rounded-lg p-6">
          <DialogHeader>
            <DialogTitle>Start Collaboration</DialogTitle>
            <DialogDescription className="mb-4">
              Invite people to collaborate on this board by entering their email address
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="collab-email" className="mb-2">Email address</Label>
              <Input
                id="collab-email"
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="mb-2"
              />
              <p className="text-xs text-gray-500">
                The user will receive a notification and can accept your collaboration invitation
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setCollaborationOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendInvitation}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- NOTIFICATION BELL COMPONENT ----------
function NotificationBell({ userEmail }: { userEmail: string | null }) {
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [collaborationInvitations, setCollaborationInvitations] = useState<CollaborationInvitation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (userEmail) {
      loadUserNotifications(userEmail);
      loadCollaborationInvitations(userEmail);
    }
  }, [userEmail]);

  const loadUserNotifications = (email: string) => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]') as Notification[];
    const userNotifications = allNotifications.filter(notification => 
      !notification.read && notification.data?.targetEmail === email
    );
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.length);
  };

  const loadCollaborationInvitations = (email: string) => {
    const invitations = getPendingInvitations(email);
    setCollaborationInvitations(invitations);
  };

  const handleCollaborationResponse = (invitationId: string, accept: boolean) => {
    updateInvitationStatus(invitationId, accept ? 'accepted' : 'declined');
    
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]') as Notification[];
    const notificationToUpdate = allNotifications.find(n => 
      n.data?.invitationId === invitationId && n.data?.targetEmail === userEmail
    );
    
    if (notificationToUpdate) {
      markNotificationAsRead(notificationToUpdate.id);
    }
    
    loadCollaborationInvitations(userEmail!);
    loadUserNotifications(userEmail!);
    
    if (accept) {
      alert('Collaboration invitation accepted!');
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-2 hover:bg-gray-100 relative"
        onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">{unreadCount}</span>
          </div>
        )}
      </Button>
      
      {notificationDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && collaborationInvitations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            ) : (
              <>
                {collaborationInvitations.map(invitation => (
                  <div key={invitation.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <UserPlus className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Collaboration Invitation
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          You&apos;ve been invited to collaborate on <strong>&quot;{invitation.boardName}&quot;</strong> by {invitation.fromUser}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs"
                            onClick={() => handleCollaborationResponse(invitation.id, true)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                            onClick={() => handleCollaborationResponse(invitation.id, false)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      markNotificationAsRead(notification.id);
                      loadUserNotifications(userEmail!);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {notification.type === 'collaboration_invitation' ? (
                        <UserPlus className="w-5 h-5 text-blue-500 mt-0.5" />
                      ) : (
                        <Bell className="w-5 h-5 text-gray-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- UTILITY FUNCTIONS ----------
function saveBoardMetadata(board: BoardMetadata) {
  let recentBoards: BoardMetadata[] = JSON.parse(localStorage.getItem('recentBoards') || '[]');
  recentBoards = recentBoards.filter((b: BoardMetadata) => b.id !== board.id);
  recentBoards.unshift({
    id: board.id,
    name: board.name,
    owner: board.owner,
    lastOpened: new Date().toISOString()
  });
  recentBoards = recentBoards.slice(0, 10);
  localStorage.setItem('recentBoards', JSON.stringify(recentBoards));
}

// ---------- COMMENT ICON COMPONENT ----------
function MessageIconWithTextarea({
  comment,
  onUpdate,
  onDelete,
}: {
  comment: CommentType;
  onUpdate: (id: number, text: string) => void;
  onDelete: (id: number) => void;
}) {
  const [showTextarea, setShowTextarea] = useState(false);

  return (
    <div className="absolute" style={{ top: comment.y, left: comment.x }}>
      <button
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow"
        onClick={() => setShowTextarea(true)}
      >
        <MessageSquare className="w-5 h-5 text-gray-700" />
      </button>

      {showTextarea && (
        <div className="absolute top-10 left-0 w-64 bg-white border rounded shadow-lg p-2">
          <textarea
            rows={3}
            className="w-full border rounded p-2"
            placeholder="Add a comment..."
            value={comment.text}
            onChange={(e) => onUpdate(comment.id, e.target.value)}
          />
          <div className="flex justify-between mt-1">
            <button
              className="text-sm text-red-600 hover:underline"
              onClick={() => onDelete(comment.id)}
            >
              Delete
            </button>
            <div>
              <button
                className="text-sm text-yellow-600 hover:underline mr-3"
                onClick={() => setShowTextarea(false)}
              >
                Cancel
              </button>
              <button
                className="text-sm bg-yellow-600 text-white px-3 py-1 rounded"
                onClick={() => setShowTextarea(false)}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- MAIN PAGE COMPONENT ----------
export default function Home() {
  const { toast } = useToast();
  const [boardId, setBoardId] = useState("");
  const [boardName, setBoardName] = useState("");
  const [boardOwner, setBoardOwner] = useState("You");
  const [activeTool, setActiveTool] = useState("select");
  const [showPalette, setShowPalette] = useState(false);
  const [showShapePalette, setShowShapePalette] = useState(false);
  const [showUserCheck, setShowUserCheck] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [textAreas, setTextAreas] = useState<StickyNoteType[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [shapes, setShapes] = useState<ShapeType[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [diagramMode, setDiagramMode] = useState(false);
  const [freehandPaths, setFreehandPaths] = useState<FreehandPath[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);

  // Mock collaborators data
  const [collaborators] = useState<Collaborator[]>([]);
  const owner = { id: "0", name: "You" };

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const colors = [
    "#FFD700", "#FF6347", "#90EE90", "#87CEFA", "#FF69B4", "#FFA500",
    "#9370DB", "#00CED1", "#F08080", "#ADFF2F", "#FFB6C1", "#20B2AA",
    "#DDA0DD",
  ];

  const simpleShapes = [
    { id: "rectangle", icon: Square },
    { id: "circle", icon: Circle },
    { id: "triangle", icon: Triangle },
    { id: "diamond", icon: ChevronUp },
  ];

  const iconShapes = [
    { id: "star", icon: Star },
    { id: "line", icon: Minus },
    { id: "arrow", icon: ArrowRight },
    { id: "left-arrow", icon: ArrowLeft },
  ];

  const tools = [
    { 
      id: "select", 
      label: "Select", 
      icon: MousePointer2, 
      action: () => resetModes()
    },
    {
      id: "sticky",
      label: "Sticky Note",
      icon: StickyNote,
      action: () => {
        resetModes();
        setShowPalette((p) => !p);
      },
    },
    { 
      id: "erase", 
      label: "Erase", 
      icon: Crop, 
      action: () => resetModes()
    },
    {
      id: "shape",
      label: "Shape",
      icon: Triangle,
      action: () => {
        resetModes();
        setShowShapePalette((p) => !p);
      },
    },
    { 
      id: "text", 
      label: "Text", 
      icon: Type, 
      action: () => resetModes()
    },
    {
      id: "draw",
      label: "Pen",
      icon: Pencil,
      action: () => {
        resetModes();
        setDiagramMode(true);
      },
    },
    { 
      id: "globe", 
      label: "Globe", 
      icon: Globe, 
      action: () => resetModes()
    },
    {
      id: "comment",
      label: "Comment",
      icon: MessageSquare,
      action: () => resetModes(),
    },
    { 
      id: "more", 
      label: "More", 
      icon: Plus, 
      action: () => resetModes()
    },
  ];

  // ---------- AUTHENTICATION ----------
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
      if (user?.email) {
        localStorage.setItem('userEmail', user.email);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user?.email || null);
      if (session?.user?.email) {
        localStorage.setItem('userEmail', session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ---------- HANDLE COLLABORATION INVITATIONS ----------
  useEffect(() => {
    // Check for invitation in URL
    const urlParams = new URLSearchParams(window.location.search);
    const invitationId = urlParams.get('invitation');
    
    if (invitationId) {
      // Mark invitation as accepted and notification as read
      const allInvitations = JSON.parse(localStorage.getItem('collaborationInvitations') || '[]');
      const invitation = allInvitations.find((inv: any) => inv.id === invitationId);
      
      if (invitation && invitation.status === 'pending') {
        // Update invitation status
        const updatedInvitations = allInvitations.map((inv: any) =>
          inv.id === invitationId ? { ...inv, status: 'accepted' } : inv
        );
        localStorage.setItem('collaborationInvitations', JSON.stringify(updatedInvitations));
        
        // Mark notification as read
        const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const notificationToUpdate = allNotifications.find((n: any) => 
          n.data?.invitationId === invitationId
        );
        
        if (notificationToUpdate) {
          const updatedNotifications = allNotifications.map((n: any) =>
            n.id === notificationToUpdate.id ? { ...n, read: true } : n
          );
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        }
        
        // Add user to board collaborators
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          const boardData = localStorage.getItem(`board-${invitation.boardId}-data`);
          if (boardData) {
            const parsedData = JSON.parse(boardData);
            const updatedData = {
              ...parsedData,
              collaborators: [...(parsedData.collaborators || []), userEmail]
            };
            localStorage.setItem(`board-${invitation.boardId}-data`, JSON.stringify(updatedData));
          }
        }
        
        console.log('Collaboration invitation accepted!');
      }
    }
  }, []);

  // ---------- BOARD ID/NAME MANAGEMENT ----------
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let boardParam = urlParams.get('board');
    if (boardParam) {
      setBoardId(boardParam);
      setBoardName(boardParam);
      setBoardOwner("You");
      
      saveBoardMetadata({
        id: boardParam,
        name: boardParam,
        owner: "You",
        lastOpened: new Date().toISOString()
      });
    } else {
      const defaultBoardId = "default-board";
      const defaultBoardName = "Untitled Board";
      setBoardId(defaultBoardId);
      setBoardName(defaultBoardName);
      
      saveBoardMetadata({
        id: defaultBoardId,
        name: defaultBoardName,
        owner: "You",
        lastOpened: new Date().toISOString()
      });
    }
  }, []);

  // Autosave name: when changed, update recentBoards and localStorage
  useEffect(() => {
    if (!boardId) return;
    
    let boards = JSON.parse(localStorage.getItem("recentBoards") || "[]");
    const idx = boards.findIndex((b: BoardMetadata) => b.id === boardId);
    if (idx !== -1) {
      boards[idx].name = boardName;
      boards[idx].lastOpened = new Date().toISOString();
      localStorage.setItem('recentBoards', JSON.stringify(boards));
    }
  }, [boardName, boardId]);

  // ---------- LOAD BOARD DATA FROM LOCALSTORAGE ----------
  useEffect(() => {
    if (!boardId) return;
    
    const saved = localStorage.getItem(`board-${boardId}-data`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setShapes(data.shapes || []);
        setTextAreas(data.textAreas || []);
        setFreehandPaths(data.freehandPaths || []);
        setComments(data.comments || []);
      } catch (error) {
        console.error("Error loading board data:", error);
      }
    } else {
      setShapes([]);
      setTextAreas([]);
      setFreehandPaths([]);
      setComments([]);
    }
  }, [boardId]);

  // ---------- SAVE BOARD DATA TO LOCALSTORAGE ----------
  useEffect(() => {
    if (!boardId) return;
    
    const serialized = JSON.stringify({
      shapes,
      textAreas,
      freehandPaths,
      comments,
    });
    localStorage.setItem(`board-${boardId}-data`, serialized);
  }, [shapes, textAreas, freehandPaths, comments, boardId]);

  // ---------- EVENT HANDLERS ----------
  const resetModes = () => {
    setShowPalette(false);
    setShowShapePalette(false);
    setDiagramMode(false);
  };

  const handleEraseClick = (id: number | string, type: "shape" | "note" | "path" | "comment") => {
    if (type === "shape") {
      setShapes((prev) => prev.filter((s) => s.id !== id));
    }
    else if (type === "note") {
      setTextAreas((prev) => prev.filter((t) => t.id !== id));
    }
    else if (type === "path") {
      setFreehandPaths((prev) => prev.filter((p) => p.id !== id));
    }
    else if (type === "comment") {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedColor) {
      const newStickyNote: StickyNoteType = {
        id: Date.now(),
        x,
        y,
        text: "",
        color: selectedColor,
        board_id: boardId
      };
      
      setTextAreas(prev => [...prev, newStickyNote]);
      setSelectedColor(null);
    }

    if (selectedShape && !diagramMode) {
      setShapes((prev) => [
        ...prev,
        { id: Date.now(), type: selectedShape, x, y, width: 100, height: 100 },
      ]);
      setSelectedShape(null);
    }

    if (activeTool === "comment") {
      setComments((prev) => [...prev, { id: Date.now(), x, y, text: "" }]);
      setActiveTool("select");
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const color = e.dataTransfer.getData("color");
    if (color) {
      const newStickyNote: StickyNoteType = {
        id: Date.now(),
        x,
        y,
        text: "",
        color,
        board_id: boardId
      };
      
      setTextAreas(prev => [...prev, newStickyNote]);
    }

    const shapeType = e.dataTransfer.getData("shape");
    if (shapeType) {
      setShapes((prev) => [
        ...prev,
        { id: Date.now(), type: shapeType, x, y, width: 100, height: 100 },
      ]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (activeTool === "erase") handleEraseClick(id, "shape");
    else setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setShapes(prev =>
        prev.map(s => s.id === draggingId ? { ...s, x, y } : s)
      );
    }

    if (diagramMode && e.buttons === 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setFreehandPaths(prev => {
        const last = prev[prev.length - 1];
        if (!last || last.id !== "drawing") {
          return [...prev, { id: "drawing", points: `${x},${y}` }];
        }
        last.points += ` ${x},${y}`;
        return [...prev.slice(0, -1), last];
      });
    }
  };

  const handleMouseUp = () => {
    if (draggingId) {
      setDraggingId(null);
    }
    
    if (diagramMode) {
      setFreehandPaths(prev =>
        prev.map(p => p.id === "drawing" ? { ...p, id: Date.now() } : p)
      );
    }
  };

  const handleBoardNameChange = (newName: string) => {
    setBoardName(newName);
    setBoardId(newName);
    
    saveBoardMetadata({
      id: newName,
      name: newName,
      owner: boardOwner,
      lastOpened: new Date().toISOString()
    });
  };

  const handleQuickCollaboration = () => {
    const email = prompt('Enter email to invite for collaboration:');
    if (email && boardId && boardName) {
      const invitation = sendCollaborationInvitation(email, boardId, boardName);
      alert(`Collaboration invitation sent to ${email}`);
      toast({
        title: "Invitation Sent",
        description: `Collaboration invitation sent to ${email}`,
      });
    } else if (!email) {
      alert('Please enter a valid email address');
    }
  };

  const renderShapeSVG = (shape: ShapeType) => {
    const { type, width, height } = shape;
    switch (type) {
      case "triangle":
        return <polygon points={`0,${height} ${width / 2},0 ${width},${height}`} fill="#90CAF9" stroke="#1976D2" strokeWidth={2} />;
      case "circle":
        return <circle cx={width / 2} cy={height / 2} r={width / 2} fill="#FFCDD2" stroke="#B71C1C" strokeWidth={2} />;
      case "rectangle":
        return <rect width={width} height={height} fill="#C8E6C9" stroke="#2E7D32" strokeWidth={2} />;
      case "diamond":
        return <polygon points={`${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`} fill="#FFF9C4" stroke="#F57F17" strokeWidth={2} />;
      case "star":
        return <polygon points={`${width/2},0 ${width*0.6},${height*0.35} ${width},${height*0.4} ${width*0.7},${height*0.65} ${width*0.8},${height} ${width/2},${height*0.8} ${width*0.2},${height} ${width*0.3},${height*0.65} 0,${height*0.4} ${width*0.4},${height*0.35}`} fill="#FFE082" stroke="#FF8F00" strokeWidth={2} />;
      case "line":
        return <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#000" strokeWidth={2} />;
      case "arrow":
        return <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#000" strokeWidth={2} markerEnd="url(#arrowhead)" />;
      case "left-arrow":
        return <line x1={width} y1={height / 2} x2={0} y2={height / 2} stroke="#000" strokeWidth={2} markerEnd="url(#arrowhead)" />;
      default:
        return null;
    }
  };

  // ---------- RENDER ----------
  return (
    <main className="h-screen w-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-md opacity-90"></div>
            </div>
            <span className="font-bold text-gray-900 text-3xl">miro</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Input
              value={boardName}
              onChange={(e) => handleBoardNameChange(e.target.value)}
              className="h-8 w-20 px-3 text-xl font-medium text-yellow-700 border border-yellow-400 bg-yellow-50 focus:outline focus:outline-yellow-500 ring-0 rounded transition"
            />
            <Badge variant="secondary" className="text-xs">Live</Badge>
          </div>
          <Button className="bg-yellow-100 text-yellow-900 h-8 px-4 rounded border-yellow-200 text-sm font-semibold shadow-none hover:bg-yellow-200" variant="outline">
            Upgrade
          </Button>
        </div>
        
        {/* Collaborators Panel */}
        <div className="ml-[400px]">
          <CollaboratorsPanel 
            collaborators={collaborators} 
            owner={owner}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Notification Bell */}
          <NotificationBell userEmail={userEmail} />
          
          <Button variant="outline" size="sm" onClick={handleQuickCollaboration}>
            <UserPlus className="w-4 h-4 mr-2" />
            Collaborate
          </Button>
          <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
            <Play className="w-4 h-4 mr-2" />
            Present
          </Button>
        </div>
        
        {/* User Dropdown */}
        <UserDropdown email={userEmail} boardId={boardId} boardName={boardName} />
        
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4" />
        </Button>
      </header>

      <div className="flex flex-1">
        {/* Toolbar */}
        <div className="w-16 mt-[20px] flex flex-col items-center py-4 border-r bg-white relative z-50">
          <TooltipProvider>
            {tools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === tool.id ? "secondary" : "ghost"}
                    className="my-2 h-[50px] w-16 flex items-center justify-center"
                    onClick={() => { setActiveTool(tool.id); tool.action(); }}
                  >
                    <tool.icon className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>{tool.label}</p></TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>

          {/* Sticky Palette */}
          {showPalette && (
            <div className="w-[100px] absolute left-full top-0 ml-2 p-2 bg-white rounded shadow z-50 mt-[85px] grid grid-cols-2 gap-2">
              {colors.map((color) => (
                <div
                  key={color}
                  className="rounded cursor-pointer border border-gray-300"
                  style={{ backgroundColor: color, width: 40, height: 40 }}
                  onClick={() => setSelectedColor(color)}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("color", color)}
                />
              ))}
            </div>
          )}

          {/* Shape Palette */}
          {showShapePalette && (
            <div className="w-[200px] absolute left-full top-0 ml-2 p-3 bg-white rounded shadow z-50 mt-[85px]">
              <div className="flex justify-between mb-2">
                {simpleShapes.map((shape) => (
                  <div
                    key={shape.id}
                    className="p-2 rounded cursor-pointer border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    onClick={() => setSelectedShape(shape.id)}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("shape", shape.id)}
                  >
                    <shape.icon className="w-5 h-5" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mb-3">
                {iconShapes.map((shape) => (
                  <div
                    key={shape.id}
                    className="p-2 rounded cursor-pointer border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    onClick={() => setSelectedShape(shape.id)}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("shape", shape.id)}
                  >
                    <shape.icon className="w-5 h-5" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="px-2 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                  onClick={() => setDiagramMode(true)}
                >
                  Create Diagram
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <ZoomableGrid boardWidth={5000} boardHeight={3000} initialZoom={1}>
          <div
            className="w-full h-full relative"
            onClick={handleCanvasClick}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {textAreas.map((ta) => (
              <textarea
                key={ta.id}
                ref={textareaRef}
                className="absolute border border-gray-400 rounded p-2 text-sm resize-none focus:outline-none"
                style={{
                  top: ta.y,
                  left: ta.x,
                  width: 200,
                  height: 150,
                  backgroundColor: ta.color,
                  cursor: activeTool === "erase" ? "not-allowed" : "text",
                }}
                value={ta.text}
                onChange={(e) => {
                  const newText = e.target.value;
                  setTextAreas((prev) =>
                    prev.map((t) =>
                      t.id === ta.id ? { ...t, text: newText } : t
                    )
                  );
                }}
                onClick={(e) => {
                  if (activeTool === "erase") {
                    e.stopPropagation();
                    handleEraseClick(ta.id, "note");
                  }
                }}
              />
            ))}

            {shapes.map((shape) => (
              <svg
                key={shape.id}
                className="absolute"
                style={{
                  top: shape.y,
                  left: shape.x,
                  width: shape.width,
                  height: shape.height,
                  cursor: activeTool === "erase" ? "not-allowed" : "move",
                }}
                onMouseDown={(e) => handleMouseDown(e, shape.id)}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="black" />
                  </marker>
                </defs>
                {renderShapeSVG(shape)}
              </svg>
            ))}

            {freehandPaths.map((path) => (
              <svg
                key={path.id}
                className="absolute top-0 left-0 w-full h-full"
                style={{ cursor: activeTool === "erase" ? "not-allowed" : "default" }}
                onClick={(e) => {
                  if (activeTool === "erase") {
                    e.stopPropagation();
                    handleEraseClick(path.id, "path");
                  }
                }}
              >
                <polyline points={path.points} fill="none" stroke="black" strokeWidth={2} />
              </svg>
            ))}

            {comments.map((comment) => (
              <MessageIconWithTextarea
                key={comment.id}
                comment={comment}
                onUpdate={(id, text) => {
                  setComments((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, text } : c))
                  );
                }}
                onDelete={(id) => handleEraseClick(id, "comment")}
              />
            ))}
          </div>
        </ZoomableGrid>
      </div>
    </main>
  );
}