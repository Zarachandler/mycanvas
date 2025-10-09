"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Plus, 
  Users, 
  Home, 
  Star, 
  Clock, 
  Gift,
  Bell,
  ChevronRight,
  Rocket,
  Zap,
  TrendingUp,
  Calendar,
  FolderOpen,
  LogOut,
  User,
  Trash2,
  Edit3,
  Check,
  X,
  ArrowRight,
  Workflow,
  Brain,
  LayoutGrid, 
  RefreshCw,
  Lightbulb,
  Shapes,
  Mail,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';

// ---------- TYPES ----------
type BoardMetadata = {
  id: string;
  name: string;
  owner: string;
  lastOpened: string;
  isStarred?: boolean;
  isArchived?: boolean;
  templateType?: string;
};

type TemplateType = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  hoverColor: string;
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

// BoardFilterBar Props Interface
interface BoardFilterBarProps {
  filterBy: string;
  setFilterBy: (value: string) => void;
  ownedBy: string;
  setOwnedBy: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

// BoardFilterBar Component Implementation
const BoardFilterBar: React.FC<BoardFilterBarProps> = ({ 
  filterBy, 
  setFilterBy, 
  ownedBy, 
  setOwnedBy, 
  sortBy, 
  setSortBy 
}) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Filter by:</label>
        <select 
          value={filterBy} 
          onChange={(e) => setFilterBy(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="starred">Starred</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Owned by:</label>
        <select 
          value={ownedBy} 
          onChange={(e) => setOwnedBy(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
        >
          <option value="anyone">Anyone</option>
          <option value="me">Me</option>
          <option value="others">Others</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Sort by:</label>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
        >
          <option value="last-opened">Last opened</option>
          <option value="last-modified">Last modified</option>
          <option value="created">Created</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>
  );
};

// TemplateBar Component
const TemplateBar = ({ onTemplateClick }: { onTemplateClick: (templateId: string) => void }) => {
  const templates = [
    { 
      id: 'blank',
      label: "Blank board", 
      icon: <span style={{
        fontSize: "44px",
        color: "#bfc3c9",
        display: "block",
        lineHeight: "110px"
      }}>+</span> 
    },
    { 
      id: 'flowchart',
      label: "Flowchart", 
      icon: <div style={{
        height: "70px", 
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Workflow className="w-12 h-12 text-blue-500" />
      </div> 
    },
    { 
      id: 'mindmap',
      label: "Mind Map", 
      icon: <div style={{
        height: "70px", 
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Brain className="w-12 h-12 text-purple-500" />
      </div> 
    },
    { 
      id: 'kanban',
      label: "Kanban Framework", 
      icon: <div style={{
        height: "70px", 
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <LayoutGrid className="w-12 h-12 text-yellow-500" />
      </div> 
    },
    { 
      id: 'retrospective',
      label: "Quick Retrospective", 
      icon: <div style={{
        height: "70px", 
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <RefreshCw className="w-12 h-12 text-green-500" />
      </div> 
    },
    { 
      id: 'brainwriting',
      label: "Brainwriting", 
      icon: <div style={{
        height: "70px", 
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Lightbulb className="w-12 h-12 text-pink-500" />
      </div> 
    },
    { 
      id: 'miroverse',
      label: "From Miroverse →", 
      icon: <div style={{
        height: "70px", 
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Shapes className="w-12 h-12 text-orange-500" />
      </div> 
    }
  ];

  return (
    <div style={{
      background: "#f5f8fb",
      borderRadius: 16,
      boxSizing: "border-box",
      padding: "25px 18px 10px 18px",
      marginTop: 18
    }}>
      <div style={{
        display: "flex",
        justifyContent: "start",
        gap: "32px",
        overflowX: "auto",
        paddingBottom: "10px"
      }}>
        {templates.map((template) => (
          <div 
            key={template.id} 
            style={{
              minWidth: 130,
              textAlign: "center",
              cursor: "pointer"
            }}
            onClick={() => onTemplateClick(template.id)}
            className="transition-transform duration-200 hover:scale-105"
          >
            <div style={{
              background: "#fff",
              border: "1.5px solid #ececef",
              borderRadius: 18,
              width: "130px",
              height: "110px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }} className="hover:shadow-md hover:border-blue-300">
              {template.icon}
            </div>
            <div style={{
              marginTop: 7,
              color: "#4a545c",
              fontSize: 18,
              fontWeight: "500"
            }}>
              {template.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- TEMPLATE FUNCTIONALITIES ----------

const getTemplateInitialData = (templateId: string) => {
  switch (templateId) {
    case 'flowchart':
      return {
        type: 'flowchart',
        nodes: [
          {
            id: 'start',
            type: 'start',
            position: { x: 100, y: 100 },
            data: { label: 'Start Process' }
          },
          {
            id: 'process1',
            type: 'process',
            position: { x: 100, y: 200 },
            data: { label: 'First Step' }
          },
          {
            id: 'decision1',
            type: 'decision',
            position: { x: 100, y: 300 },
            data: { label: 'Decision Point' }
          },
          {
            id: 'end',
            type: 'end',
            position: { x: 100, y: 400 },
            data: { label: 'End Process' }
          }
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'process1' },
          { id: 'e2', source: 'process1', target: 'decision1' },
          { id: 'e3', source: 'decision1', target: 'end' }
        ],
        shapes: [],
        connections: []
      };

    case 'mindmap':
      return {
        type: 'mindmap',
        centralTopic: {
          id: 'central',
          text: 'Central Idea',
          position: { x: 400, y: 300 }
        },
        mainBranches: [
          {
            id: 'branch1',
            text: 'Main Topic 1',
            direction: 'right',
            subtopics: [
              { id: 'sub1', text: 'Subtopic 1.1' },
              { id: 'sub2', text: 'Subtopic 1.2' }
            ]
          },
          {
            id: 'branch2',
            text: 'Main Topic 2',
            direction: 'left',
            subtopics: [
              { id: 'sub3', text: 'Subtopic 2.1' },
              { id: 'sub4', text: 'Subtopic 2.2' }
            ]
          }
        ],
        shapes: [],
        connections: []
      };

    case 'kanban':
      return {
        type: 'kanban',
        columns: [
          {
            id: 'todo',
            title: 'To Do',
            cards: [
              { id: 'card1', title: 'Research competitors', description: 'Analyze market landscape' },
              { id: 'card2', title: 'Create user personas', description: 'Define target audience' }
            ]
          },
          {
            id: 'inprogress',
            title: 'In Progress',
            cards: [
              { id: 'card3', title: 'Design wireframes', description: 'Create initial mockups' }
            ]
          },
          {
            id: 'done',
            title: 'Done',
            cards: [
              { id: 'card4', title: 'Project kickoff', description: 'Initial meeting completed' }
            ]
          }
        ],
        shapes: [],
        connections: []
      };

    case 'retrospective':
      return {
        type: 'retrospective',
        sections: [
          {
            id: 'wentWell',
            title: 'What went well',
            color: 'green',
            items: [
              'Team collaboration was excellent',
              'Deadlines were met successfully'
            ]
          },
          {
            id: 'improve',
            title: 'What to improve',
            color: 'yellow',
            items: [
              'Communication during crunch time',
              'Documentation process'
            ]
          },
          {
            id: 'actionItems',
            title: 'Action items',
            color: 'blue',
            items: [
              'Schedule weekly check-ins',
              'Update documentation templates'
            ]
          }
        ],
        shapes: [],
        connections: []
      };

    case 'brainwriting':
      return {
        type: 'brainwriting',
        rounds: 3,
        currentRound: 1,
        ideas: [
          {
            id: 'idea1',
            round: 1,
            author: 'User1',
            content: 'Improve onboarding process',
            developedBy: []
          },
          {
            id: 'idea2',
            round: 1,
            author: 'User2',
            content: 'Add dark mode feature',
            developedBy: []
          }
        ],
        participants: ['User1', 'User2', 'User3', 'User4'],
        shapes: [],
        connections: []
      };

    case 'miroverse':
      return {
        type: 'miroverse',
        communityTemplate: true,
        featuredElements: [
          {
            type: 'stickyNote',
            content: 'Welcome to Miroverse!',
            color: 'yellow',
            position: { x: 300, y: 200 }
          },
          {
            type: 'shape',
            shape: 'rectangle',
            content: 'Popular Community Template',
            position: { x: 300, y: 300 }
          }
        ],
        shapes: [],
        connections: []
      };

    default:
      return {
        type: 'blank',
        shapes: [],
        connections: []
      };
  }
};

const getTemplateTools = (templateId: string) => {
  const baseTools = [
    { id: 'select', name: 'Select', icon: '🔍' },
    { id: 'text', name: 'Text', icon: '📝' },
    { id: 'sticky', name: 'Sticky Note', icon: '📌' },
    { id: 'shape', name: 'Shapes', icon: '⬜' },
    { id: 'connector', name: 'Connector', icon: '🔗' }
  ];

  switch (templateId) {
    case 'flowchart':
      return [
        ...baseTools,
        { id: 'startNode', name: 'Start Node', icon: '🔵' },
        { id: 'processNode', name: 'Process', icon: '⬜' },
        { id: 'decisionNode', name: 'Decision', icon: '🔷' },
        { id: 'endNode', name: 'End Node', icon: '⭕' },
        { id: 'flowArrow', name: 'Flow Arrow', icon: '➡️' }
      ];

    case 'mindmap':
      return [
        ...baseTools,
        { id: 'centralTopic', name: 'Central Topic', icon: '🎯' },
        { id: 'mainBranch', name: 'Main Branch', icon: '🌿' },
        { id: 'subTopic', name: 'Sub Topic', icon: '🍃' },
        { id: 'relationship', name: 'Relationship', icon: '🔀' }
      ];

    case 'kanban':
      return [
        ...baseTools,
        { id: 'newColumn', name: 'New Column', icon: '📋' },
        { id: 'card', name: 'Task Card', icon: '📄' },
        { id: 'label', name: 'Label', icon: '🏷️' },
        { id: 'assignee', name: 'Assignee', icon: '👤' }
      ];

    case 'retrospective':
      return [
        ...baseTools,
        { id: 'wentWell', name: 'Went Well', icon: '✅' },
        { id: 'improve', name: 'Improve', icon: '🔄' },
        { id: 'actionItem', name: 'Action Item', icon: '🎯' },
        { id: 'vote', name: 'Vote', icon: '⭐' }
      ];

    case 'brainwriting':
      return [
        ...baseTools,
        { id: 'ideaCard', name: 'Idea Card', icon: '💡' },
        { id: 'timer', name: 'Timer', icon: '⏱️' },
        { id: 'round', name: 'Round', icon: '🔄' },
        { id: 'develop', name: 'Develop Idea', icon: '🚀' }
      ];

    case 'miroverse':
      return [
        ...baseTools,
        { id: 'community', name: 'Community', icon: '👥' },
        { id: 'template', name: 'Template', icon: '📑' },
        { id: 'rating', name: 'Rating', icon: '⭐' },
        { id: 'comments', name: 'Comments', icon: '💬' }
      ];

    default:
      return baseTools;
  }
};

const handleTemplateSpecificAction = (templateId: string, action: string, data: any) => {
  switch (templateId) {
    case 'flowchart':
      switch (action) {
        case 'addNode':
          return { type: 'ADD_NODE', data };
        case 'connectNodes':
          return { type: 'CONNECT_NODES', data };
        case 'autoLayout':
          return { type: 'AUTO_LAYOUT', data };
        default:
          return null;
      }

    case 'mindmap':
      switch (action) {
        case 'addBranch':
          return { type: 'ADD_BRANCH', data };
        case 'collapseBranch':
          return { type: 'COLLAPSE_BRANCH', data };
        case 'changeLayout':
          return { type: 'CHANGE_LAYOUT', data };
        default:
          return null;
      }

    case 'kanban':
      switch (action) {
        case 'moveCard':
          return { type: 'MOVE_CARD', data };
        case 'addCard':
          return { type: 'ADD_CARD', data };
        case 'assignUser':
          return { type: 'ASSIGN_USER', data };
        default:
          return null;
      }

    case 'retrospective':
      switch (action) {
        case 'addItem':
          return { type: 'ADD_ITEM', data };
        case 'voteItem':
          return { type: 'VOTE_ITEM', data };
        case 'createAction':
          return { type: 'CREATE_ACTION', data };
        default:
          return null;
      }

    case 'brainwriting':
      switch (action) {
        case 'submitIdea':
          return { type: 'SUBMIT_IDEA', data };
        case 'developIdea':
          return { type: 'DEVELOP_IDEA', data };
        case 'nextRound':
          return { type: 'NEXT_ROUND', data };
        default:
          return null;
      }

    case 'miroverse':
      switch (action) {
        case 'rateTemplate':
          return { type: 'RATE_TEMPLATE', data };
        case 'addComment':
          return { type: 'ADD_COMMENT', data };
        case 'forkTemplate':
          return { type: 'FORK_TEMPLATE', data };
        default:
          return null;
      }

    default:
      return null;
  }
};

const templates: TemplateType[] = [
  {
    id: 'blank',
    title: 'Blank board',
    description: 'Start with a clean canvas',
    icon: <Plus className="w-8 h-8 text-gray-400" />,
    bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:from-gray-100 hover:to-gray-200',
  },
  {
    id: 'flowchart',
    title: 'Flowchart',
    description: 'Map out processes and workflows',
    icon: <Workflow className="w-8 h-8 text-blue-500" />,
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:from-blue-100 hover:to-indigo-200',
  },
  {
    id: 'mindmap',
    title: 'Mind Map',
    description: 'Organize ideas and concepts',
    icon: <Brain className="w-8 h-8 text-purple-500" />,
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-100',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:from-purple-100 hover:to-pink-200',
  },
  {
    id: 'kanban',
    title: 'Kanban Framework',
    description: 'Manage tasks and workflows',
    icon: <LayoutGrid className="w-8 h-8 text-yellow-500" />,
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-100',
    borderColor: 'border-yellow-200',
    hoverColor: 'hover:from-yellow-100 hover:to-orange-200',
  },
  {
    id: 'retrospective',
    title: 'Quick Retrospective',
    description: 'Reflect and improve processes',
    icon: <RefreshCw className="w-8 h-8 text-green-500" />,
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
    borderColor: 'border-green-200',
    hoverColor: 'hover:from-green-100 hover:to-emerald-200',
  },
  {
    id: 'brainwriting',
    title: 'Brainwriting',
    description: 'Generate ideas collaboratively',
    icon: <Lightbulb className="w-8 h-8 text-pink-500" />,
    bgColor: 'bg-gradient-to-br from-pink-50 to-rose-100',
    borderColor: 'border-pink-200',
    hoverColor: 'hover:from-pink-100 hover:to-rose-200',
  }
];

// Collaboration Functions
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

export default function Dashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('NA');
  const [userEmail, setUserEmail] = useState('');
  const [recentBoard, setRecentBoard] = useState<BoardMetadata | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [boards, setBoards] = useState<BoardMetadata[]>([]);
  const [deleteConfirmTable, setDeleteConfirmTable] = useState<string | null>(null);
  
  // Edit state for board names
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editedBoardName, setEditedBoardName] = useState('');
  
  // Filter and sort states
  const [filterBy, setFilterBy] = useState("all");
  const [ownedBy, setOwnedBy] = useState("anyone");
  const [sortBy, setSortBy] = useState("last-opened");

  // Notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [collaborationInvitations, setCollaborationInvitations] = useState<CollaborationInvitation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Get user email from localStorage
    const storedUserEmail = localStorage.getItem('userEmail');
    if (storedUserEmail) {
      setUserEmail(storedUserEmail);
      const initials = storedUserEmail.split('@')[0].slice(0, 2).toUpperCase();
      setUserInitials(initials);
      
      // Load notifications and collaboration invitations for this user
      loadUserNotifications(storedUserEmail);
      loadCollaborationInvitations(storedUserEmail);
    }

    // Load and deduplicate recent boards
    const recentBoards = JSON.parse(localStorage.getItem('recentBoards') || '[]') as BoardMetadata[];
    const uniqueBoards = Array.from(new Map(recentBoards.map(board => [board.id, board])).values());
    setBoards(uniqueBoards);
    
    // Get only the most recent board (first one in the array)
    const mostRecentBoard = uniqueBoards.length > 0 ? uniqueBoards[0] : null;
    setRecentBoard(mostRecentBoard);

    // Set up interval to check for new notifications
    const interval = setInterval(() => {
      if (storedUserEmail) {
        loadUserNotifications(storedUserEmail);
        loadCollaborationInvitations(storedUserEmail);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Load user notifications
  const loadUserNotifications = (email: string) => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]') as Notification[];
    const userNotifications = allNotifications.filter(notification => 
      !notification.read && notification.data?.targetEmail === email
    );
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.length);
  };

  // Load collaboration invitations for user
  const loadCollaborationInvitations = (email: string) => {
    const allInvitations = JSON.parse(localStorage.getItem('collaborationInvitations') || '[]') as CollaborationInvitation[];
    const userInvitations = allInvitations.filter(invitation => 
      invitation.toUserEmail === email && invitation.status === 'pending'
    );
    setCollaborationInvitations(userInvitations);
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]') as Notification[];
    const updatedNotifications = allNotifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    loadUserNotifications(userEmail);
  };

  // Handle collaboration invitation response
  const handleCollaborationResponse = (invitationId: string, accept: boolean) => {
    const allInvitations = JSON.parse(localStorage.getItem('collaborationInvitations') || '[]') as CollaborationInvitation[];
    const updatedInvitations = allInvitations.map(invitation =>
      invitation.id === invitationId 
        ? { ...invitation, status: accept ? 'accepted' : 'declined' }
        : invitation
    );
    localStorage.setItem('collaborationInvitations', JSON.stringify(updatedInvitations));
    
    // Remove corresponding notification
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]') as Notification[];
    const notificationToUpdate = allNotifications.find(n => 
      n.data?.invitationId === invitationId && n.data?.targetEmail === userEmail
    );
    
    if (notificationToUpdate) {
      markNotificationAsRead(notificationToUpdate.id);
    }
    
    loadCollaborationInvitations(userEmail);
    
    if (accept) {
      // Add user to board collaborators
      const invitation = allInvitations.find(inv => inv.id === invitationId);
      if (invitation) {
        const boardData = localStorage.getItem(`board-${invitation.boardId}-data`);
        if (boardData) {
          const parsedData = JSON.parse(boardData);
          const updatedData = {
            ...parsedData,
            collaborators: [...(parsedData.collaborators || []), userEmail]
          };
          localStorage.setItem(`board-${invitation.boardId}-data`, JSON.stringify(updatedData));
        }
        
        // Redirect to the accepted board
        router.push(`/canvas?board=${invitation.boardId}`);
      }
    }
  };

  // Function to simulate receiving a collaboration invitation (for testing)
  const simulateCollaborationInvitation = () => {
    if (!recentBoard) {
      alert('Please create a board first to test collaboration invitations');
      return;
    }

    const invitation: CollaborationInvitation = {
      id: `invite-${Date.now()}`,
      boardId: recentBoard.id,
      boardName: recentBoard.name,
      fromUser: 'Test User',
      fromUserEmail: 'test@example.com',
      toUserEmail: userEmail,
      status: 'pending',
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Save invitation
    const allInvitations = JSON.parse(localStorage.getItem('collaborationInvitations') || '[]');
    allInvitations.push(invitation);
    localStorage.setItem('collaborationInvitations', JSON.stringify(allInvitations));

    // Create notification
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type: 'collaboration_invitation',
      title: 'Collaboration Invitation',
      message: `You've been invited to collaborate on "${invitation.boardName}"`,
      read: false,
      createdAt: new Date().toISOString(),
      data: {
        invitationId: invitation.id,
        targetEmail: userEmail,
        boardId: invitation.boardId
      }
    };

    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    allNotifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(allNotifications));

    // Reload notifications and invitations
    loadUserNotifications(userEmail);
    loadCollaborationInvitations(userEmail);

    alert('Test collaboration invitation sent! Check your notifications.');
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const handleTemplateClick = (templateId: string) => {
    // Create a new board and redirect to canvas
    const newBoardId = `board-${Date.now()}`;
    
    // Get template title
    const template = templates.find(t => t.id === templateId) || {
      id: templateId,
      title: templateId === 'miroverse' ? 'From Miroverse' : 'Blank Board'
    };
    
    const newBoard: BoardMetadata = {
      id: newBoardId,
      name: `${template.title}`,
      owner: userInitials,
      lastOpened: new Date().toISOString(),
      isStarred: false,
      isArchived: false,
      templateType: templateId
    };
    
    // Save initial template data
    const templateData = getTemplateInitialData(templateId);
    localStorage.setItem(`board-${newBoardId}-data`, JSON.stringify(templateData));
    
    // Save template tools configuration
    const templateTools = getTemplateTools(templateId);
    localStorage.setItem(`board-${newBoardId}-tools`, JSON.stringify(templateTools));
    
    // Save to recent boards with deduplication
    const updatedBoards = [newBoard, ...boards.filter(b => b.id !== newBoardId)];
    localStorage.setItem('recentBoards', JSON.stringify(updatedBoards));
    setBoards(updatedBoards);
    setRecentBoard(newBoard);
    
    // Redirect to canvas with the new board
    router.push(`/canvas?board=${newBoardId}&template=${templateId}`);
  };

  const handleQuickCreate = () => {
    // Create a new blank board
    const newBoardId = `board-${Date.now()}`;
    const newBoard: BoardMetadata = {
      id: newBoardId,
      name: 'Untitled Board',
      owner: userInitials,
      lastOpened: new Date().toISOString(),
      isStarred: false,
      isArchived: false,
      templateType: 'blank'
    };
    
    // Save blank board data
    const blankData = getTemplateInitialData('blank');
    localStorage.setItem(`board-${newBoardId}-data`, JSON.stringify(blankData));
    
    // Save default tools
    const defaultTools = getTemplateTools('blank');
    localStorage.setItem(`board-${newBoardId}-tools`, JSON.stringify(defaultTools));
    
    // Save to recent boards with deduplication
    const updatedBoards = [newBoard, ...boards.filter(b => b.id !== newBoardId)];
    localStorage.setItem('recentBoards', JSON.stringify(updatedBoards));
    setBoards(updatedBoards);
    setRecentBoard(newBoard);
    
    // Redirect to canvas with the new board
    router.push(`/canvas?board=${newBoardId}`);
  };

  const handleBoardClick = (boardId?: string) => {
    const boardToOpen = boardId ? boards.find(b => b.id === boardId) : recentBoard;
    if (!boardToOpen) return;
    
    // Update last opened time
    const updatedBoard = {
      ...boardToOpen,
      lastOpened: new Date().toISOString()
    };
    
    // Update boards array with the updated board
    const updatedBoards = boards.map(b => 
      b.id === updatedBoard.id ? updatedBoard : b
    ).sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime());
    
    localStorage.setItem('recentBoards', JSON.stringify(updatedBoards));
    setBoards(updatedBoards);
    setRecentBoard(updatedBoards[0]);
    
    // Redirect to canvas with the board
    router.push(`/canvas?board=${boardToOpen.id}${boardToOpen.templateType ? `&template=${boardToOpen.templateType}` : ''}`);
  };

  // Delete board handler
  const handleDelete = () => {
    if (!recentBoard) return;
    
    // Remove the board from boards array
    const filtered = boards.filter(b => b.id !== recentBoard.id);
    localStorage.setItem('recentBoards', JSON.stringify(filtered));
    setBoards(filtered);
    
    // Remove board canvas data as well
    localStorage.removeItem(`board-${recentBoard.id}-data`);
    localStorage.removeItem(`board-${recentBoard.id}-tools`);
    
    // Update recent board
    setRecentBoard(filtered.length > 0 ? filtered[0] : null);
    setDeleteConfirm(false);
  };

  // Delete board handler for table
  const handleDeleteTable = (id: string) => {
    // Remove from boards
    const filtered = boards.filter(b => b.id !== id);
    setBoards(filtered);
    localStorage.setItem('recentBoards', JSON.stringify(filtered));
    // Remove board canvas data as well
    localStorage.removeItem(`board-${id}-data`);
    localStorage.removeItem(`board-${id}-tools`);
    setDeleteConfirmTable(null);
    
    // Update recent board if it was deleted
    if (recentBoard && recentBoard.id === id) {
      setRecentBoard(filtered.length > 0 ? filtered[0] : null);
    }
  };

  // Start editing board name
  const startEditing = (board: BoardMetadata) => {
    setEditingBoardId(board.id);
    setEditedBoardName(board.name);
  };

  // Save edited board name
  const saveEditedName = (boardId: string) => {
    if (editedBoardName.trim() === '') {
      // Don't save empty names
      setEditingBoardId(null);
      return;
    }

    const updatedBoards = boards.map(board => 
      board.id === boardId 
        ? { ...board, name: editedBoardName.trim() }
        : board
    );

    setBoards(updatedBoards);
    localStorage.setItem('recentBoards', JSON.stringify(updatedBoards));
    
    // Update recent board if it was edited
    if (recentBoard && recentBoard.id === boardId) {
      setRecentBoard({ ...recentBoard, name: editedBoardName.trim() });
    }
    
    setEditingBoardId(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingBoardId(null);
    setEditedBoardName('');
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return `${Math.floor(diffInHours / 168)} weeks ago`;
  };

  // Apply filters and sorting
  const filteredBoards = boards.filter((board: BoardMetadata) => {
    // Search filter
    const searchMatch = board.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       board.owner?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by type
    let filterMatch = true;
    if (filterBy === "starred") {
      filterMatch = board.isStarred === true;
    } else if (filterBy === "archived") {
      filterMatch = board.isArchived === true;
    }
    
    // Filter by ownership
    let ownershipMatch = true;
    if (ownedBy === "me") {
      ownershipMatch = board.owner === userInitials;
    } else if (ownedBy === "others") {
      ownershipMatch = board.owner !== userInitials;
    }
    
    return searchMatch && filterMatch && ownershipMatch;
  });

  // Apply sorting
  const sortedBoards = [...filteredBoards].sort((a, b) => {
    switch (sortBy) {
      case "last-opened":
        return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime();
      case "last-modified":
        // Using lastOpened as a proxy for last modified since we don't have separate field
        return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime();
      case "created":
        // Using lastOpened as a proxy for created since we don't have separate field
        return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // If no board available, show the enhanced empty state
  if (!recentBoard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="w-5 h-5 bg-white rounded-lg opacity-90"></div>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">miro</h1>
                <Badge variant="outline" className="text-xs text-gray-600 border-gray-300 bg-gray-50">
                  Free
                </Badge>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">All systems operational</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 relative">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Users className="w-4 h-4 mr-2" />
                Invite members
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
                <Gift className="w-4 h-4" />
              </Button>
              
              {/* Notification Bell */}
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
                          {/* Collaboration Invitations */}
                          {collaborationInvitations.map(invitation => (
                            <div key={invitation.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                              <div className="flex items-start space-x-3">
                                <UserPlus className="w-5 h-5 text-blue-500 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    Collaboration Invitation
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    You've been invited to collaborate on <strong>"{invitation.boardName}"</strong> by {invitation.fromUser}
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
                          
                          {/* Other Notifications */}
                          {notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                              onClick={() => markNotificationAsRead(notification.id)}
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
                    
                    <div className="p-2 border-t border-gray-200">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs text-gray-600 hover:text-gray-900"
                        onClick={simulateCollaborationInvitation}
                      >
                        Test Collaboration Invitation
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {userInitials}
                </Button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <ul className="flex flex-col">
                      <li className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">Admin Console</li>
                      <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">Trash</li>
                      <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">Learning Center</li>
                      <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">Upgrade</li>
                      <li
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Left Sidebar */}
          <aside className="w-72 bg-white/50 backdrop-blur-sm border-r border-gray-200/50 min-h-[calc(100vh-89px)]">
            <div className="p-6">
              {/* Team Header */}
              <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">DM</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">dashboard marketing</div>
                      <div className="text-sm text-gray-600">5 members</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search boards, templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 text-sm bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-2 mb-8">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Explore
                </div>
                <Link href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group">
                  <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Home</span>
                </Link>
                <Link href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group">
                  <Clock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Recent</span>
                  <Badge variant="secondary" className="ml-auto text-xs">{boards.length}</Badge>
                </Link>
                <Link href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group">
                  <Star className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Starred</span>
                </Link>
                <Link href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group">
                  <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Scheduled</span>
                </Link>
              </nav>

              {/* Spaces */}
              <div>
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Spaces
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-blue-100">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Link href="#" className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200">
                    <FolderOpen className="w-4 h-4" />
                    <span className="text-sm">Marketing Team</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Quick Actions */}
              <Card className="mb-8 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Quick Start</h3>
                        <p className="text-sm text-gray-600">Jump right into creating</p>
                      </div>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                      onClick={handleQuickCreate}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create new board
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Template Bar Section */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Start with a template</h3>
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    View all templates
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <TemplateBar onTemplateClick={handleTemplateClick} />
              </div>

              {/* Empty State */}
              <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
                <CardContent className="text-center py-20">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Rocket className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Create the next big thing</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start from scratch or use one of our templates to get started with your first board.
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 shadow-lg"
                    onClick={handleQuickCreate}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create new board
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Dashboard with boards
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 bg-white rounded-lg opacity-90"></div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">miro</h1>
              <Badge variant="outline" className="text-xs text-gray-600 border-gray-300 bg-gray-50">
                Free
              </Badge>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">All systems operational</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 relative">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Users className="w-4 h-4 mr-2" />
              Invite members
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
              <Gift className="w-4 h-4" />
            </Button>
            
            {/* Notification Bell with Dropdown */}
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
                        {/* Collaboration Invitations */}
                        {collaborationInvitations.map(invitation => (
                          <div key={invitation.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                            <div className="flex items-start space-x-3">
                              <UserPlus className="w-5 h-5 text-blue-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  Collaboration Invitation
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  You've been invited to collaborate on <strong>"{invitation.boardName}"</strong> by {invitation.fromUser}
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
                        
                        {/* Other Notifications */}
                        {notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => markNotificationAsRead(notification.id)}
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
                  
                  <div className="p-2 border-t border-gray-200">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs text-gray-600 hover:text-gray-900"
                      onClick={simulateCollaborationInvitation}
                    >
                      Test Collaboration Invitation
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {userInitials}
              </Button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <ul className="flex flex-col">
                    <li className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">Admin Console</li>
                    <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">Trash</li>
                    <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">Learning Center</li>
                    <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">Upgrade</li>
                    <li
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-72 bg-white/50 backdrop-blur-sm border-r border-gray-200/50 min-h-[calc(100vh-89px)]">
          <div className="p-6">
            {/* Team Header */}
            <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">DM</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">dashboard marketing</div>
                    <div className="text-sm text-gray-600">5 members</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search boards, templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 text-sm bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Navigation */}
            <nav className="space-y-2 mb-8">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Explore
              </div>
              <Link href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group">
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <Link href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group">
                <Clock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Recent</span>
                <Badge variant="secondary" className="ml-auto text-xs">{boards.length}</Badge>
              </Link>
              <Link href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group">
                <Star className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Starred</span>
              </Link>
              <Link href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group">
                <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Scheduled</span>
              </Link>
            </nav>

            {/* Spaces */}
            <div>
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Spaces
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-blue-100">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <Link href="#" className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200">
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-sm">Marketing Team</span>
                  </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Quick Actions */}
            <Card className="mb-8 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Quick Start</h3>
                      <p className="text-sm text-gray-600">Jump right into creating</p>
                    </div>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                    onClick={handleQuickCreate}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create new board
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Template Bar Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Start with a template</h3>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View all templates
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <TemplateBar onTemplateClick={handleTemplateClick} />
            </div>

            {/* Filter Bar */}
            <div className="mb-6">
              <BoardFilterBar
                filterBy={filterBy}
                setFilterBy={setFilterBy}
                ownedBy={ownedBy}
                setOwnedBy={setOwnedBy}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>

            {/* Recent Board Section - Single Board */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent board</h3>
                <div className="flex items-center space-x-3">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                    onClick={handleQuickCreate}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create new
                  </Button>
                </div>
              </div>
              
              {/* Single Board Card */}
              <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg border-0 shadow-sm relative max-w-2xl">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-200 h-48 rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-8 h-8 text-blue-600" />
                      </div>
                      
                      {/* Editable Board Name */}
                      {editingBoardId === recentBoard.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Input
                            value={editedBoardName}
                            onChange={(e) => setEditedBoardName(e.target.value)}
                            className="text-2xl font-bold text-center bg-white/80 border-blue-300"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveEditedName(recentBoard.id);
                              } else if (e.key === 'Escape') {
                                cancelEditing();
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
                              onClick={() => saveEditedName(recentBoard.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={cancelEditing}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <h3 className="text-2xl font-bold text-gray-800">{recentBoard.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => startEditing(recentBoard)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Last opened: {getTimeAgo(recentBoard.lastOpened)}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>Owner: {recentBoard.owner}</span>
                          </div>
                        </div>
                        {recentBoard.templateType && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {recentBoard.templateType.charAt(0).toUpperCase() + recentBoard.templateType.slice(1)} Template
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          onClick={() => handleBoardClick()}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Open Board
                        </Button>
                        {deleteConfirm ? (
                          <div className="flex items-center space-x-2 bg-red-50 p-2 rounded-lg">
                            <span className="text-sm text-red-600 font-medium">Delete?</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 h-8"
                              onClick={handleDelete}
                            >
                              Yes
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-700 h-8"
                              onClick={() => setDeleteConfirm(false)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteConfirm(true)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Boards Table View */}
            {sortedBoards.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Boards in this team</h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last opened</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedBoards.map(board => (
                        <tr key={board.id} className="hover:bg-gray-50">
                          <td 
                            className="px-6 py-4 whitespace-nowrap cursor-pointer"
                            onClick={() => handleBoardClick(board.id)}
                          >
                            <div className="flex items-center space-x-2">
                              {editingBoardId === board.id ? (
                                <div className="flex items-center space-x-2">
                                  <Input
                                    value={editedBoardName}
                                    onChange={(e) => setEditedBoardName(e.target.value)}
                                    className="h-8 text-sm"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        saveEditedName(board.id);
                                      } else if (e.key === 'Escape') {
                                        cancelEditing();
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
                                      onClick={() => saveEditedName(board.id)}
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      onClick={cancelEditing}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2 group">
                                  <div className="text-sm font-medium text-gray-900">{board.name}</div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditing(board);
                                    }}
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap cursor-pointer"
                            onClick={() => handleBoardClick(board.id)}
                          >
                            <Badge variant="outline" className="text-xs">
                              {board.templateType ? board.templateType.charAt(0).toUpperCase() + board.templateType.slice(1) : 'Blank'}
                            </Badge>
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap cursor-pointer"
                            onClick={() => handleBoardClick(board.id)}
                          >
                            <div className="text-sm text-gray-600">{new Date(board.lastOpened).toLocaleString()}</div>
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap cursor-pointer"
                            onClick={() => handleBoardClick(board.id)}
                          >
                            <div className="text-sm text-gray-600">{board.owner}</div>
                          </td>

                        
                          <td className="px-6 py-4 whitespace-nowrap">
                            {deleteConfirmTable === board.id ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-red-600">Delete?</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteTable(board.id)}
                                >
                                  Yes
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-700"
                                  onClick={() => setDeleteConfirmTable(null)}
                                >
                                  No
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setDeleteConfirmTable(board.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

// Export the collaboration function for use in canvas
export { sendCollaborationInvitation };