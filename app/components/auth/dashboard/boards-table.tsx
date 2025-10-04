// "use client";

// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';
// import {
//   MoreHorizontal, Star, Trash2, Edit3, Copy, Eye, Grid3x3, List
// } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import {
//   DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu';
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue
// } from '@/components/ui/select';
// import type { Board } from '@/lib/board';
// import CreateBoardDialog from './CreateBoardDialog';


// interface BoardsTableProps {
// boards: Board[];
// currentUser: string;
// onBoardsChange: () => void;
// }
// export interface BoardTransformed extends Board {
//   ownerId: string;
//   createdAt: Date;
//   updatedAt: Date;
// }


// export default function BoardsTable({ currentUser, onBoardsChange }: BoardsTableProps) {
//   const [boards, setBoards] = useState<BoardTransformed[]>([]);
//   const [sortBy, setSortBy] = useState('last-opened');
//   const [filterBy, setFilterBy] = useState('all-boards');
//   const [ownedBy, setOwnedBy] = useState('anyone');
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
//   const router = useRouter();
//   const [dialogOpen, setDialogOpen] = useState(false);


  
// const fetchBoards = async () => {
//   const { data: ownedBoards, error: ownedError } = await supabase
//     .from("boards")
//     .select("*")
//     .eq("owner_id", currentUser);

//   if (ownedError) console.error("Error fetching owned boards:", ownedError);

//   const { data: collabIdsData, error: collabIdsError } = await supabase
//     .from("board_collaborators")
//     .select("board_id")
//     .eq("user_id", currentUser);

//   if (collabIdsError) console.error("Error fetching collaborator IDs:", collabIdsError);

//   let collabBoards: any[] = [];
//   if (collabIdsData?.length) {
//     const boardIds = collabIdsData.map((c) => c.board_id);

//     const { data: collabBoardsData, error: collabBoardsError } = await supabase
//       .from("boards")
//       .select("*")
//       .in("id", boardIds);

//     if (collabBoardsError) {
//       console.error("Error fetching collaborator boards:", collabBoardsError);
//     } else {
//       collabBoards = collabBoardsData || [];
//     }
//   }

//   const merged = [...(ownedBoards || []), ...collabBoards];
//   const uniqueBoards = Array.from(new Map(merged.map((b) => [b.id, b])).values());

//   // Now for each board, fetch collaborators
//   const boardsWithCollaborators = await Promise.all(
//     uniqueBoards.map(async (board) => {
//       const { data: collaboratorsData } = await supabase
//         .from("board_collaborators")
//         .select("user_id") // you can join user profile table if you have one
//         .eq("board_id", board.id);

//       return {
//         ...board,
//         ownerId: board.owner_id,
//         collaborators: collaboratorsData || [],
//         createdAt: board.created_at ? new Date(board.created_at) : new Date(0),
//         updatedAt: board.updated_at ? new Date(board.updated_at) : new Date(0),
//       };
//     })
//   );

//   setBoards(boardsWithCollaborators);
// };



// useEffect(() => {
//   fetchBoards();
// }, []);


//   const getBoardTypeColor = (type: string) => {
//     switch (type) {
//       case 'blank': return 'bg-slate-100 text-slate-700';
//       case 'flowchart': return 'bg-blue-100 text-blue-700';
//       case 'mindmap': return 'bg-green-100 text-green-700';
//       case 'kanban': return 'bg-purple-100 text-purple-700';
//       case 'retrospective': return 'bg-orange-100 text-orange-700';
//       case 'brainwriting': return 'bg-yellow-100 text-yellow-700';
//       default: return 'bg-slate-100 text-slate-700';
//     }
//   };

//   const getBoardTypeIcon = (type: string) => {
//     switch (type) {
//       case 'kanban': return '📋';
//       case 'mindmap': return '🧠';
//       default: return '📄';
//     }
//   };



// const handleStarToggle = async (boardId: string, e: React.MouseEvent) => {
//   e.stopPropagation();

//   const board = boards.find(b => b.id === boardId);
//   if (!board) return;

//   const { error } = await supabase
//     .from('boards')
//     .update({ starred: !board.starred })
//     .eq('id', boardId);

//   if (error) {
//     console.error('Failed to toggle star:', error);
//     alert('Error toggling star status');
//     return;
//   }

//   fetchBoards(); // Refetch after update
// };

// const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
//   e.stopPropagation();

//   if (confirm('Are you sure you want to delete this board?')) {
//     const { error } = await supabase
//       .from('boards')
//       .delete()
//       .eq('id', boardId);

//     if (error) {
//       console.error('Failed to delete board:', error);
//       alert('Error deleting board');
//       return;
//     }

//     fetchBoards(); // Refetch after delete
//   }
// };

// const sortedAndFilteredBoards = boards
//   .filter(board => {
//     if (filterBy === 'starred' && !board.starred) return false;
//     if (ownedBy === 'me' && board.ownerId !== currentUser) return false;
//     return true;
//   })
// .sort((a, b) => {
//   switch (sortBy) {
//     case 'last-opened':
//       return (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0);
//     case 'name':
//       return a.name.localeCompare(b.name);
//     case 'created':
//       return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
//     default:
//       return 0;
//   }
// });

//   if (boards.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <Grid3x3 className="h-8 w-8 text-slate-400" />
//         </div>
//         <h3 className="text-lg font-medium text-slate-900 mb-2">No boards yet</h3>
//         <p className="text-slate-500 mb-4">Create your first board to get started</p>
//       </div>
//     );
//   }

//   const handleBoardClick = (boardId: string) => {
//   router.push(`/board/${boardId}`);
// };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold text-slate-900">Boards in this team</h2>
//         <div className="flex items-center space-x-4">

//           <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setDialogOpen(true)}>
//             <span className="mr-2">+</span>
//             Create new
//           </Button>
//         </div>
//       </div>
//       <CreateBoardDialog
//         open={dialogOpen}
//         onOpenChange={setDialogOpen}
//         onCreated={onBoardsChange}
//         templateType="blank"
//       />

//       {/* Filters */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <div className="flex items-center space-x-2">
//             <span className="text-sm text-slate-600">Filter by</span>
//             <Select value={filterBy} onValueChange={setFilterBy}>
//               <SelectTrigger className="w-40 h-9">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all-boards">All boards</SelectItem>
//                 <SelectItem value="starred">Starred</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex items-center space-x-2">
//             <span className="text-sm text-slate-600">Owned by</span>
//             <Select value={ownedBy} onValueChange={setOwnedBy}>
//               <SelectTrigger className="w-32 h-9">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="anyone">Anyone</SelectItem>
//                 <SelectItem value="me">Me</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex items-center space-x-2">
//             <span className="text-sm text-slate-600">Sort by</span>
//             <Select value={sortBy} onValueChange={setSortBy}>
//               <SelectTrigger className="w-40 h-9">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="last-opened">Last opened</SelectItem>
//                 <SelectItem value="name">Name</SelectItem>
//                 <SelectItem value="created">Created</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         <div className="flex items-center space-x-2">
//           <Button
//             variant={viewMode === 'grid' ? 'default' : 'outline'}
//             size="sm"
//             onClick={() => setViewMode('grid')}
//             className="p-2"
//           >
//             <Grid3x3 className="h-4 w-4" />
//           </Button>
//           <Button
//             variant={viewMode === 'list' ? 'default' : 'outline'}
//             size="sm"
//             onClick={() => setViewMode('list')}
//             className="p-2"
//           >
//             <List className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-slate-50 border-b border-slate-200">
//               <tr>
//                 <th className="text-left py-3 px-6 text-sm font-medium text-slate-700">Name</th>
//                 <th className="text-left py-3 px-6 text-sm font-medium text-slate-700">Online users</th>
//                 <th className="text-left py-3 px-6 text-sm font-medium text-slate-700">Last opened</th>
//                 <th className="text-left py-3 px-6 text-sm font-medium text-slate-700">Owner</th>
//                 <th className="w-12"></th>
//               </tr>
//             </thead>
//             <tbody>
//               {sortedAndFilteredBoards.map((board, index) => (
//                 <motion.tr
//                   key={board.id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.2, delay: index * 0.05 }}
//                   onClick={() => handleBoardClick(board.id)}
//                   className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer group"
//                 >
//                   <td className="py-4 px-6">
//                     <div className="flex items-center space-x-3">
//                       <div className="w-6 h-6 flex items-center justify-center text-sm">
//                         {getBoardTypeIcon(board.type)}
//                       </div>
//                       <div>
//                         <div className="font-medium text-slate-900">{board.name}</div>
//                         <div className="text-xs text-slate-500">
//                           Modified by {board.owner}, {formatDistanceToNow(board.updatedAt, { addSuffix: true })}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">
//                     <div className="flex items-center space-x-1">
//                       {board.onlineUsers > 0 && (
//                         <>
//                           <div className="flex -space-x-1">
//                             {[...Array(Math.min(board.onlineUsers, 3))].map((_, i) => (
//                               <Avatar key={i} className="w-6 h-6 border-2 border-white">
//                                 <AvatarFallback className="bg-blue-500 text-white text-xs">
//                                   {String.fromCharCode(65 + i)}
//                                 </AvatarFallback>
//                               </Avatar>
//                             ))}
//                           </div>
//                           {board.onlineUsers > 3 && (
//                             <span className="text-xs text-slate-500 ml-2">
//                               +{board.onlineUsers - 3}
//                             </span>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </td>
//                   <td className="py-4 px-6">
//                     <span className="text-sm text-slate-600">
//                       {formatDistanceToNow(board.updatedAt, { addSuffix: true })}
//                     </span>
//                   </td>
//                   <td className="py-4 px-6">
//                     <span className="text-sm text-slate-900">{board.owner}</span>
//                   </td>
//                   <td className="py-4 px-6">
//                     <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={(e) => handleStarToggle(board.id, e)}
//                         className="p-1 h-8 w-8 hover:bg-yellow-50"
//                       >
//                         <Star 
//                           className={`h-4 w-4 ${
//                             board.starred 
//                               ? 'fill-yellow-400 text-yellow-400' 
//                               : 'text-slate-400 hover:text-yellow-400'
//                           }`} 
//                         />
//                       </Button>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={(e) => e.stopPropagation()}
//                             className="p-1 h-8 w-8 hover:bg-slate-100"
//                           >
//                             <MoreHorizontal className="h-4 w-4 text-slate-600" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
//                             <Eye className="h-4 w-4 mr-2" />
//                             Open
//                           </DropdownMenuItem>
//                           <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
//                             <Edit3 className="h-4 w-4 mr-2" />
//                             Rename
//                           </DropdownMenuItem>
//                           <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
//                             <Copy className="h-4 w-4 mr-2" />
//                             Duplicate
//                           </DropdownMenuItem>
//                           <DropdownMenuSeparator />
//                           <DropdownMenuItem 
//                             onClick={(e) => handleDeleteBoard(board.id, e)}
//                             className="text-red-600 focus:text-red-600"
//                           >
//                             <Trash2 className="h-4 w-4 mr-2" />
//                             Delete
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   </td>
//                 </motion.tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }