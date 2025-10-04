"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Home, 
  Clock, 
  Star, 
  Plus, 
  Compass,
  ChevronDown,
  Settings,
  Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User } from '@/lib/auth';

interface SidebarProps {
  user: User;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ user, currentPage, onPageChange }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [spacesExpanded, setSpacesExpanded] = useState(true);

  const navigationItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'home', label: 'Home', icon: Home },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'starred', label: 'Starred', icon: Star },
  ];

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-70 bg-white border-r border-slate-200 h-full flex flex-col"
    >
      {/* User Profile */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-blue-500 text-white text-sm">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.team}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8 rounded-lg hover:bg-slate-100"
          >
            <Plus className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by title or topic"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white text-sm h-9"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <Separator className="my-4" />

        {/* Spaces */}
        <div>
          <button
            onClick={() => setSpacesExpanded(!spacesExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-50"
          >
            <span>Spaces</span>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6 rounded hover:bg-slate-200"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle add space
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <motion.div
                animate={{ rotate: spacesExpanded ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </div>
          </button>
          
          {spacesExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-3 space-y-1 mt-1"
            >
              <div className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-sm"></div>
                <span>Team Workspace</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-700 hover:text-slate-900 hover:bg-slate-50"
        >
          <Users className="h-4 w-4 mr-3" />
          <span className="text-sm">Team Members</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-700 hover:text-slate-900 hover:bg-slate-50"
        >
          <Settings className="h-4 w-4 mr-3" />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
    </motion.div>
  );
}