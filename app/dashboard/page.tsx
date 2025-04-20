"use client"

import * as React from "react"
import { Search, SlidersHorizontal, Calendar, Text, FileType, ArrowUpDown, Mic, FileText, Sparkles, Shield, Zap } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { NoteCard } from "@/components/note-card"
import { ActionBar } from "@/components/action-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Note } from "@/types/note"
import { FavoritesPage } from "@/components/favorites-page"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Icons } from "@/components/icons"

const initialNotes: Note[] = [
  {
    id: "1",
    title: "Engineering Assignment Audio",
    date: "Jan 30, 2025",
    time: "5:26 PM",
    duration: "00:09",
    description: "I'm recording an audio to transcribe into text for the assignment of engineering in terms of actors.",
    contentType: "audio",
    attachments: [{ type: "Image", count: 1 }],
    transcript: "I'm recording an audio to transcribe into text for the assignment of engineering in terms of actors.",
    transcriptionState: "completed",
    audioUrl: "/sample-audio.mp3",
    isFavorite: false,
  },
  {
    id: "2",
    title: "Random Sequence",
    date: "Jan 30, 2025",
    time: "5:21 PM",
    description: "ssxscscscsc",
    contentType: "text",
    transcriptionState: "completed",
    isFavorite: true,
  },
]

const filterNotes = (notes: Note[], searchQuery: string) => {
  if (!searchQuery.trim()) return notes;
  
  const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
  
  return notes.filter(note => {
    const searchableText = [
      note.title.toLowerCase(),
      note.description.toLowerCase(),
      note.transcript?.toLowerCase() || '',
    ].join(' ');

    return searchTerms.every(term => searchableText.includes(term));
  });
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [notes, setNotes] = React.useState<Note[]>(() => {
    // Load notes from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem('notes');
      return savedNotes ? JSON.parse(savedNotes) : initialNotes;
    }
    return initialNotes;
  });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredNotes, setFilteredNotes] = React.useState<Note[]>(notes);
  const [showFavorites, setShowFavorites] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"date" | "title">("date");
  const [currentView, setCurrentView] = React.useState<"home" | "favorites">("home");

  // Save notes to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  React.useEffect(() => {
    const filtered = filterNotes(notes, searchQuery);
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (sort: "date" | "title") => {
    setSortBy(sort);
    const sorted = [...filteredNotes].sort((a, b) => {
      if (sort === "date") {
        return new Date(b.date || "").getTime() - new Date(a.date || "").getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
    setFilteredNotes(sorted);
  };

  const handleAddNote = (note: Note) => {
    const newNote = {
      ...note,
      id: Date.now().toString(), // Ensure unique ID
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
    };
    setNotes([newNote, ...notes]);
    toast.success("Note added successfully");
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    toast.success("Note deleted successfully");
  };

  const handleToggleFavorite = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  const handleUpdateTranscript = (id: string, transcript: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, transcript } : note
    ));
  };

  const handleSortNotes = () => {
    const sorted = [...filteredNotes].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date || "").getTime() - new Date(a.date || "").getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
    setFilteredNotes(sorted);
  };

  const handleUpdateNoteState = (id: string, state: "pending" | "completed" | "failed") => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, transcriptionState: state } : note
    ));
  };

  const handleUpdateTags = (id: string, tags: string[]) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, tags } : note
    ));
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center px-4">
              <div className="mr-4 hidden md:flex">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                  <Icons.logo className="h-6 w-6" />
                  <span className="font-bold">AI Notes</span>
                </Link>
              </div>
              <div className="flex flex-1 items-center justify-between space-x-4">
                <div className="w-full flex-1 md:w-auto md:flex-none">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search notes..."
                      className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-[300px]"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 rounded-xl">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Sort by: {sortBy === "date" ? "Date" : "Title"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSort("date")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Date
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort("title")}>
                      <Text className="mr-2 h-4 w-4" />
                      Title
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto px-4 pb-4 pt-6">
            {currentView === "favorites" ? (
              <FavoritesPage 
                notes={notes.filter(note => note.isFavorite)} 
                onDelete={handleDeleteNote}
                onToggleFavorite={handleToggleFavorite}
                onUpdateTranscript={handleUpdateTranscript}
                setNotes={setNotes}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      {...note}
                      tags={note.tags || []}
                      onDelete={handleDeleteNote}
                      onToggleFavorite={handleToggleFavorite}
                      onUpdateTranscript={handleUpdateTranscript}
                      onUpdateTags={handleUpdateTags}
                      setNotes={setNotes}
                      handleRemoveTag={(tag) => {
                        const updatedTags = note.tags?.filter(t => t !== tag) || [];
                        setNotes(prevNotes =>
                          prevNotes.map(n =>
                            n.id === note.id ? { ...n, tags: updatedTags } : n
                          )
                        );
                      }}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">No notes found</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
          <ActionBar onAddNote={handleAddNote} />
        </div>
      </div>
    </ProtectedRoute>
  );
} 