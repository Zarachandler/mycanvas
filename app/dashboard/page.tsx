"use client";

import { useState } from 'react';
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
  Filter,
  Grid3X3,
  List,
  Sparkles,
  Zap,
  TrendingUp,
  Calendar,
  FolderOpen,
  LogOut,
  User
} from 'lucide-react';
import Link from 'next/link';

const templates = [
  {
    id: 'blank',
    title: 'Blank board',
    description: 'Start with a clean canvas',
    icon: <Plus className="w-8 h-8 text-gray-400" />,
    bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:from-gray-100 hover:to-gray-200',
    onClick: () => window.location.href = '/canvas'
  },
  {
    id: 'flowchart',
    title: 'Flowchart',
    description: 'Map out processes and workflows',
    icon: (
      <div className="flex items-center justify-center space-x-1">
        <div className="w-3 h-3 bg-blue-400 rounded-sm shadow-sm"></div>
        <div className="w-3 h-3 bg-yellow-400 rounded-sm shadow-sm"></div>
        <div className="w-3 h-3 bg-green-400 rounded-sm shadow-sm"></div>
        <div className="w-3 h-3 bg-orange-400 rounded-sm shadow-sm"></div>
      </div>
    ),
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:from-blue-100 hover:to-indigo-200',
    onClick: () => window.location.href = '/canvas'
  },
  {
    id: 'mindmap',
    title: 'Mind Map',
    description: 'Organize ideas and concepts',
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" className="text-purple-500">
        <path d="M8 12h16M8 12c-2 0-4-2-4-4s2-4 4-4M8 12c-2 0-4 2-4 4s2 4 4 4M24 12c2 0 4-2 4-4s-2-4-4-4M24 12c2 0 4 2 4 4s-2 4-4 4" 
              stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ),
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-100',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:from-purple-100 hover:to-pink-200',
    onClick: () => window.location.href = '/canvas'
  },
  {
    id: 'kanban',
    title: 'Kanban Framework',
    description: 'Manage tasks and workflows',
    icon: (
      <div className="grid grid-cols-3 gap-1">
        <div className="space-y-1">
          <div className="w-4 h-2 bg-gray-300 rounded-sm"></div>
          <div className="w-4 h-2 bg-gray-300 rounded-sm"></div>
        </div>
        <div className="space-y-1">
          <div className="w-4 h-2 bg-yellow-300 rounded-sm"></div>
          <div className="w-4 h-2 bg-yellow-300 rounded-sm"></div>
        </div>
        <div className="space-y-1">
          <div className="w-4 h-2 bg-green-300 rounded-sm"></div>
          <div className="w-4 h-2 bg-green-300 rounded-sm"></div>
        </div>
      </div>
    ),
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-100',
    borderColor: 'border-yellow-200',
    hoverColor: 'hover:from-yellow-100 hover:to-orange-200',
    onClick: () => window.location.href = '/canvas'
  },
  {
    id: 'retrospective',
    title: 'Quick Retrospective',
    description: 'Reflect and improve processes',
    icon: (
      <div className="grid grid-cols-2 gap-1">
        <div className="w-3 h-3 bg-green-400 rounded-sm shadow-sm"></div>
        <div className="w-3 h-3 bg-red-400 rounded-sm shadow-sm"></div>
        <div className="w-3 h-3 bg-blue-400 rounded-sm shadow-sm"></div>
        <div className="w-3 h-3 bg-purple-400 rounded-sm shadow-sm"></div>
      </div>
    ),
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
    borderColor: 'border-green-200',
    hoverColor: 'hover:from-green-100 hover:to-emerald-200',
    onClick: () => window.location.href = '/canvas'
  },
  {
    id: 'brainwriting',
    title: 'Brainwriting',
    description: 'Generate ideas collaboratively',
    icon: (
      <div className="grid grid-cols-4 gap-1">
        <div className="w-2 h-2 bg-yellow-300 rounded-sm"></div>
        <div className="w-2 h-2 bg-blue-300 rounded-sm"></div>
        <div className="w-2 h-2 bg-green-300 rounded-sm"></div>
        <div className="w-2 h-2 bg-orange-300 rounded-sm"></div>
        <div className="w-2 h-2 bg-purple-300 rounded-sm"></div>
        <div className="w-2 h-2 bg-pink-300 rounded-sm"></div>
        <div className="w-2 h-2 bg-indigo-300 rounded-sm"></div>
        <div className="w-2 h-2 bg-red-300 rounded-sm"></div>
      </div>
    ),
    bgColor: 'bg-gradient-to-br from-pink-50 to-rose-100',
    borderColor: 'border-pink-200',
    hoverColor: 'hover:from-pink-100 hover:to-rose-200',
    onClick: () => window.location.href = '/canvas'
  }
];

const recentBoards = [
  {
    id: 1,
    title: 'Product Roadmap Q1',
    lastModified: '2 hours ago',
    collaborators: 3,
    thumbnail: 'bg-gradient-to-br from-blue-100 to-indigo-200'
  },
  {
    id: 2,
    title: 'User Journey Mapping',
    lastModified: '1 day ago',
    collaborators: 5,
    thumbnail: 'bg-gradient-to-br from-purple-100 to-pink-200'
  },
  {
    id: 3,
    title: 'Sprint Planning',
    lastModified: '3 days ago',
    collaborators: 2,
    thumbnail: 'bg-gradient-to-br from-green-100 to-emerald-200'
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Mock user data
  const user = { name: 'Zara Ali' };
  const userInitials = user.name.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    router.push('/login');
  };

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
              <Sparkles className="w-4 h-4 mr-2" />
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
                <Badge variant="secondary" className="ml-auto text-xs">3</Badge>
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
                    onClick={() => window.location.href = '/canvas'}
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
                    onClick={template.onClick}
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* From Miroverse */}
                <Card className="bg-gradient-to-br from-orange-50 to-yellow-100 border-orange-200 hover:from-orange-100 hover:to-yellow-200 border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 flex items-center justify-center h-16 group-hover:scale-110 transition-transform duration-300">
                        <div className="grid grid-cols-3 gap-1">
                          <div className="w-3 h-3 bg-red-400 rounded-sm shadow-sm"></div>
                          <div className="w-3 h-3 bg-blue-400 rounded-sm shadow-sm"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-sm shadow-sm"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-sm shadow-sm"></div>
                          <div className="w-3 h-3 bg-purple-400 rounded-sm shadow-sm"></div>
                          <div className="w-3 h-3 bg-pink-400 rounded-sm shadow-sm"></div>
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-orange-700 transition-colors">
                        From Miroverse
                      </h4>
                      <p className="text-xs text-gray-600 group-hover:text-orange-600 transition-colors">
                        Community templates
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Boards */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent boards</h3>
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                    View all
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                    onClick={() => window.location.href = '/canvas'}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create new
                  </Button>
                </div>
              </div>
              
              {recentBoards.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {recentBoards.map((board) => (
                    <Card key={board.id} className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group border-0 shadow-sm">
                      <CardContent className="p-0">
                        <div className={`${board.thumbnail} h-32 rounded-t-lg`}></div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                            {board.title}
                          </h4>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{board.lastModified}</span>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{board.collaborators}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
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
                      onClick={() => window.location.href = '/canvas'}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create new board
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}