"use client";

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
import ZoomableGrid from "../board/ZoomableGrid";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@supabase/supabase-js';
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
                className="text-sm text-blue-600 hover:underline mr-3"
                onClick={() => setShowTextarea(false)}
              >
                Cancel
              </button>
              <button
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
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
  const [boardId, setBoardId] = useState<string>("default-board");
  const [boardName, setBoardName] = useState("Untitled Board");
  const [activeTool, setActiveTool] = useState("select");
  const [showPalette, setShowPalette] = useState(false);
  const [showShapePalette, setShowShapePalette] = useState(false);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [textAreas, setTextAreas] = useState<StickyNoteType[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [shapes, setShapes] = useState<ShapeType[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [diagramMode, setDiagramMode] = useState(false);
  const [freehandPaths, setFreehandPaths] = useState<FreehandPath[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);

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
      action: () => {
        resetModes();
        toast({
          title: "Select Tool Activated",
          description: "Click and drag to select objects on the canvas.",
        });
      }
    },
    {
      id: "sticky",
      label: "Sticky Note",
      icon: StickyNote,
      action: () => {
        resetModes();
        setShowPalette((p) => !p);
        toast({
          title: "Sticky Note Tool",
          description: "Choose a color and click on the canvas to add a sticky note.",
        });
      },
    },
    { 
      id: "erase", 
      label: "Erase", 
      icon: Crop, 
      action: () => {
        resetModes();
        toast({
          title: "Eraser Tool Activated",
          description: "Click on objects to remove them from the canvas.",
        });
      }
    },
    {
      id: "shape",
      label: "Shape",
      icon: Triangle,
      action: () => {
        resetModes();
        setShowShapePalette((p) => !p);
        toast({
          title: "Shape Tool",
          description: "Choose a shape and click on the canvas to add it.",
        });
      },
    },
    { 
      id: "text", 
      label: "Text", 
      icon: Type, 
      action: () => {
        resetModes();
        toast({
          title: "Text Tool Activated",
          description: "Click on the canvas to add a text area.",
        });
      }
    },
    {
      id: "draw",
      label: "Pen",
      icon: Pencil,
      action: () => {
        resetModes();
        setDiagramMode(true);
        toast({
          title: "Drawing Mode Activated",
          description: "Click and drag on the canvas to draw freehand.",
        });
      },
    },
    { 
      id: "globe", 
      label: "Globe", 
      icon: Globe, 
      action: () => {
        resetModes();
        toast({
          title: "Globe Tool",
          description: "Global tools and settings are available.",
        });
      }
    },
    {
      id: "comment",
      label: "Comment",
      icon: MessageSquare,
      action: () => {
        resetModes();
        toast({
          title: "Comment Tool Activated",
          description: "Click on the canvas to add a comment.",
        });
      },
    },
    { 
      id: "more", 
      label: "More", 
      icon: Plus, 
      action: () => {
        resetModes();
        toast({
          title: "More Tools",
          description: "Additional tools and features are available.",
        });
      }
    },
  ];

  // ---------- SUPABASE FUNCTIONS (ONLY FOR STICKY NOTES) ----------
  
  // Load initial sticky notes data
  const loadStickyNotes = async () => {
    try {
      const { data: stickyNotes, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .eq('board_id', boardId);

      if (error) {
        console.error('Error loading sticky notes:', error);
      } else if (stickyNotes) {
        setTextAreas(stickyNotes);
      }
    } catch (error) {
      console.error('Error loading sticky notes:', error);
    }
  };

  // Set up real-time subscription only for sticky notes
  const setupStickyNotesSubscription = () => {
    const stickyNotesSubscription = supabase
      .channel('sticky-notes-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'sticky_notes',
          filter: `board_id=eq.${boardId}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTextAreas(prev => [...prev, payload.new as StickyNoteType]);
          } else if (payload.eventType === 'UPDATE') {
            setTextAreas(prev => 
              prev.map(note => note.id === payload.new.id ? payload.new as StickyNoteType : note)
            );
          } else if (payload.eventType === 'DELETE') {
            setTextAreas(prev => prev.filter(note => note.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      stickyNotesSubscription.unsubscribe();
    };
  };

  // Save sticky note to Supabase
  const saveStickyNote = async (stickyNote: Omit<StickyNoteType, 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .insert([stickyNote])
        .select();

      if (error) {
        console.error('Error saving sticky note:', error);
        return null;
      } else {
        return data;
      }
    } catch (error) {
      console.error('Unexpected error saving sticky note:', error);
      return null;
    }
  };

  // Update sticky note text in Supabase
  const updateStickyNoteText = async (id: number, text: string) => {
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .update({ text })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating sticky note text:', error);
        return null;
      } else {
        return data;
      }
    } catch (error) {
      console.error('Unexpected error updating sticky note text:', error);
      return null;
    }
  };

  // Delete sticky note from Supabase
  const deleteStickyNote = async (id: number) => {
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting sticky note:', error);
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error('Unexpected error deleting sticky note:', error);
      return false;
    }
  };

  // ---------- EFFECTS ----------
  useEffect(() => {
    loadStickyNotes();
    const unsubscribe = setupStickyNotesSubscription();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [boardId]);

  // ---------- EVENT HANDLERS ----------
  const resetModes = () => {
    setShowPalette(false);
    setShowShapePalette(false);
    setDiagramMode(false);
  };

  const handleEraseClick = (id: number | string, type: "shape" | "note" | "path" | "comment") => {
    if (type === "shape") {
      setShapes((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: "Shape Removed",
        description: "The shape has been deleted from the canvas.",
      });
    }
    else if (type === "note") {
      // Delete from local state immediately
      setTextAreas((prev) => prev.filter((t) => t.id !== id));
      // Delete from Supabase
      deleteStickyNote(id as number);
      toast({
        title: "Sticky Note Removed",
        description: "The sticky note has been deleted.",
      });
    }
    else if (type === "path") {
      setFreehandPaths((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Drawing Removed",
        description: "The freehand drawing has been erased.",
      });
    }
    else if (type === "comment") {
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: "Comment Removed",
        description: "The comment has been deleted.",
      });
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
      
      await saveStickyNote(newStickyNote);
      toast({
        title: "Sticky Note Added",
        description: "A new sticky note has been placed on the canvas.",
      });
    }

    if (selectedShape && !diagramMode) {
      setShapes((prev) => [
        ...prev,
        { id: Date.now(), type: selectedShape, x, y, width: 100, height: 100 },
      ]);
      setSelectedShape(null);
      toast({
        title: "Shape Added",
        description: `A new ${selectedShape} shape has been placed on the canvas.`,
      });
    }

    if (activeTool === "comment") {
      setComments((prev) => [...prev, { id: Date.now(), x, y, text: "" }]);
      setActiveTool("select");
      toast({
        title: "Comment Added",
        description: "Click on the comment icon to add your message.",
      });
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
      await saveStickyNote(newStickyNote);
      toast({
        title: "Sticky Note Dropped",
        description: "A sticky note has been placed on the canvas via drag and drop.",
      });
    }

    const shapeType = e.dataTransfer.getData("shape");
    if (shapeType) {
      setShapes((prev) => [
        ...prev,
        { id: Date.now(), type: shapeType, x, y, width: 100, height: 100 },
      ]);
      toast({
        title: "Shape Dropped",
        description: `A ${shapeType} shape has been placed on the canvas via drag and drop.`,
      });
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
      toast({
        title: "Shape Moved",
        description: "The shape has been repositioned on the canvas.",
      });
    }
    setDraggingId(null);
    
    if (diagramMode) {
      setFreehandPaths(prev =>
        prev.map(p => p.id === "drawing" ? { ...p, id: Date.now() } : p)
      );
      toast({
        title: "Drawing Completed",
        description: "Your freehand drawing has been saved.",
      });
    }
  };

  const handleBoardNameChange = (newName: string) => {
    setBoardName(newName);
    toast({
      title: "Board Name Updated",
      description: `Board name changed to "${newName}".`,
    });
  };

  const handleInviteClick = () => {
    toast({
      title: "Invite Collaborators",
      description: "Share this board with your team members.",
    });
  };

  const handleShareClick = () => {
    toast({
      title: "Share Board",
      description: "Generate a shareable link for this board.",
    });
  };

  const handlePresentClick = () => {
    toast({
      title: "Presentation Mode",
      description: "Entering presentation mode. Press ESC to exit.",
    });
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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-md opacity-90"></div>
            </div>
            <span className="font-semibold text-gray-900">Miro</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Input
              value={boardName}
              onChange={(e) => handleBoardNameChange(e.target.value)}
              className="border-none bg-transparent text-lg font-semibold text-gray-900 p-0 h-auto"
            />
            <Badge variant="secondary" className="text-xs">Live</Badge>
          </div>
        </div>
        <div className="flex -space-x-2 ml-[560px]">
          <Avatar className="w-8 h-8 border-2 border-purple">
            <AvatarFallback>ZA</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex items-center space-x-9">
          <Button variant="outline" size="sm" onClick={handleInviteClick}>
            <Users className="w-4 h-4 mr-2" />Invite
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareClick}>
            <Share className="w-4 h-4 mr-2" />Share
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handlePresentClick}>
            <Play className="w-4 h-4 mr-2" />Present
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
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
                  onClick={() => {
                    setSelectedColor(color);
                    toast({
                      title: "Color Selected",
                      description: `Sticky note color set to ${color}. Click on canvas to place.`,
                    });
                  }}
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
                    onClick={() => {
                      setSelectedShape(shape.id);
                      toast({
                        title: "Shape Selected",
                        description: `${shape.id} shape ready. Click on canvas to place.`,
                      });
                    }}
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
                    onClick={() => {
                      setSelectedShape(shape.id);
                      toast({
                        title: "Shape Selected",
                        description: `${shape.id} shape ready. Click on canvas to place.`,
                      });
                    }}
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
                  onClick={() => {
                    setDiagramMode(true);
                    toast({
                      title: "Diagram Mode Activated",
                      description: "Start drawing your diagram on the canvas.",
                    });
                  }}
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
                onChange={async (e) => {
                  const newText = e.target.value;
                  setTextAreas((prev) =>
                    prev.map((t) =>
                      t.id === ta.id ? { ...t, text: newText } : t
                    )
                  );
                  await updateStickyNoteText(ta.id, newText);
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
