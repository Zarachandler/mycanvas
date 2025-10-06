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
  Shapes
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

export default function Dashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('NA');
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

  useEffect(() => {
    // Get user email from localStorage (should be set by login page)
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      const initials = userEmail.split('@')[0].slice(0, 2).toUpperCase();
      setUserInitials(initials);
    }

    // Load and deduplicate recent boards
    const recentBoards = JSON.parse(localStorage.getItem('recentBoards') || '[]') as BoardMetadata[];
    const uniqueBoards = Array.from(new Map(recentBoards.map(board => [board.id, board])).values());
    setBoards(uniqueBoards);
    
    // Get only the most recent board (first one in the array)
    const mostRecentBoard = uniqueBoards.length > 0 ? uniqueBoards[0] : null;
    setRecentBoard(mostRecentBoard);
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleTemplateClick = (template: TemplateType) => {
    // Create a new board and redirect to canvas
    const newBoardId = `board-${Date.now()}`;
    const newBoard: BoardMetadata = {
      id: newBoardId,
      name: `${template.title}`,
      owner: userInitials,
      lastOpened: new Date().toISOString(),
      isStarred: false,
      isArchived: false,
      templateType: template.id
    };
    
    // Save initial template data
    const templateData = getTemplateInitialData(template.id);
    localStorage.setItem(`board-${newBoardId}-data`, JSON.stringify(templateData));
    
    // Save template tools configuration
    const templateTools = getTemplateTools(template.id);
    localStorage.setItem(`board-${newBoardId}-tools`, JSON.stringify(templateTools));
    
    // Save to recent boards with deduplication
    const updatedBoards = [newBoard, ...boards.filter(b => b.id !== newBoardId)];
    localStorage.setItem('recentBoards', JSON.stringify(updatedBoards));
    setBoards(updatedBoards);
    setRecentBoard(newBoard);
    
    // Redirect to canvas with the new board
    router.push(`/canvas?board=${newBoardId}&template=${template.id}`);
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

  // Template descriptions with features
  const getTemplateDescription = (templateId: string) => {
    switch (templateId) {
      case 'flowchart':
        return 'Create process flows with nodes, decisions, and connectors. Perfect for workflow mapping and process documentation.';
      case 'mindmap':
        return 'Visualize ideas hierarchically with central topics and branching subtopics. Great for brainstorming and knowledge organization.';
      case 'kanban':
        return 'Manage tasks across customizable columns. Track progress with drag-and-drop cards and assign team members.';
      case 'retrospective':
        return 'Facilitate team retrospectives with structured sections for feedback, voting, and action items.';
      case 'brainwriting':
        return 'Collaborative idea generation with timed rounds. Build upon others\' ideas for creative solutions.';
      case 'miroverse':
        return 'Access community-created templates. Rate, comment, and fork popular templates from the Miro community.';
      default:
        return 'Start with a clean canvas and unlimited possibilities.';
    }
  };

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
              <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 relative">
                <Bell className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Button>

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

              {/* Templates Grid */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Start with a template</h3>
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    View all templates
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-6 gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`${template.bgColor} ${template.borderColor} ${template.hoverColor} border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group`}
                      onClick={() => handleTemplateClick(template)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-4 flex items-center justify-center h-16 group-hover:scale-110 transition-transform duration-300">
                            {template.icon}
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                            {template.title}
                          </h4>
                          <p className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors">
                            {template.description}
                          </p>
                          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ArrowRight className="w-4 h-4 text-blue-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* From Miroverse */}
                  <Card 
                    className="bg-gradient-to-br from-orange-50 to-yellow-100 border-orange-200 hover:from-orange-100 hover:to-yellow-200 border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group"
                    onClick={() => handleTemplateClick({
                      id: 'miroverse',
                      title: 'From Miroverse',
                      description: 'Community templates',
                      icon: <Shapes className="w-8 h-8 text-orange-500" />,
                      bgColor: 'bg-gradient-to-br from-orange-50 to-yellow-100',
                      borderColor: 'border-orange-200',
                      hoverColor: 'hover:from-orange-100 hover:to-yellow-200'
                    })}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-4 flex items-center justify-center h-16 group-hover:scale-110 transition-transform duration-300">
                          <Shapes className="w-8 h-8 text-orange-500" />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-orange-700 transition-colors">
                          From Miroverse
                        </h4>
                        <p className="text-xs text-gray-600 group-hover:text-orange-600 transition-colors">
                          Community templates
                        </p>
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight className="w-4 h-4 text-orange-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 relative">
              <Bell className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </Button>

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
            
            {/* Templates Grid */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Start with a template</h3>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View all templates
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid grid-cols-6 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`${template.bgColor} ${template.borderColor} ${template.hoverColor} border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group`}
                    onClick={() => handleTemplateClick(template)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-4 flex items-center justify-center h-16 group-hover:scale-110 transition-transform duration-300">
                          {template.icon}
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                          {template.title}
                        </h4>
                        <p className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors">
                          {template.description}
                        </p>
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight className="w-4 h-4 text-blue-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* From Miroverse */}
                <Card 
                  className="bg-gradient-to-br from-orange-50 to-yellow-100 border-orange-200 hover:from-orange-100 hover:to-yellow-200 border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group"
                  onClick={() => handleTemplateClick({
                    id: 'miroverse',
                    title: 'From Miroverse',
                    description: 'Community templates',
                    icon: <Shapes className="w-8 h-8 text-orange-500" />,
                    bgColor: 'bg-gradient-to-br from-orange-50 to-yellow-100',
                    borderColor: 'border-orange-200',
                    hoverColor: 'hover:from-orange-100 hover:to-yellow-200'
                  })}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 flex items-center justify-center h-16 group-hover:scale-110 transition-transform duration-300">
                        <Shapes className="w-8 h-8 text-orange-500" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-orange-700 transition-colors">
                        From Miroverse
                      </h4>
                      <p className="text-xs text-gray-600 group-hover:text-orange-600 transition-colors">
                        Community templates
                      </p>
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowRight className="w-4 h-4 text-orange-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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