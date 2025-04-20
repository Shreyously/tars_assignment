"use client"

import * as React from "react"
import { Search, SlidersHorizontal, Calendar, Text, FileType, ArrowUpDown } from "lucide-react"
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

export default function Page() {
  const [notes, setNotes] = React.useState<Note[]>([])
  const [currentView, setCurrentView] = React.useState<"home" | "favorites">("home")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"date" | "title" | "type">("date")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")

  // Add useEffect to load notes when component mounts
  React.useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes')
        if (response.ok) {
          const data = await response.json()
          setNotes(data)
        }
      } catch (error) {
        console.error('Error fetching notes:', error)
        toast.error('Failed to load notes')
      }
    }

    fetchNotes()
  }, [])

  // Filter notes based on search query
  
  const filteredNotes = filterNotes(notes, searchQuery)

  // Use filtered notes for display
  const visibleNotes = currentView === "home" 
  ? filteredNotes 
  : filteredNotes.filter(note => note.isFavorite)

  const addNote = async (noteData: Note) => {
    try {
      setNotes((prevNotes) => [noteData, ...prevNotes]);

      // Update localStorage
      const updatedNotes = [noteData, ...notes];
      localStorage.setItem('userNotes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  // Modify delete handler to ensure both API and local state are updated
  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete note');
      }

      // Update local state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));

      // Update localStorage
      const updatedNotes = notes.filter(note => note.id !== id);
      localStorage.setItem('userNotes', JSON.stringify(updatedNotes));

      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete note');
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const note = notes.find((n) => n.id === id)
      if (!note) return

      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFavorite: !note.isFavorite,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update note')
      }

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
        )
      )

      // Update localStorage
      const updatedNotes = notes.map((note) =>
        note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
      )
      localStorage.setItem('userNotes', JSON.stringify(updatedNotes))
    } catch (error) {
      toast.error('Failed to update note')
      console.error(error)
    }
  }

  const updateTranscript = (id: string, transcript: string) => {
    setNotes((prevNotes) => prevNotes.map((note) => (note.id === id ? { ...note, transcript } : note)))
  }

  const sortNotes = (notes: Note[]) => {
    return [...notes].sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(`${a.date} ${a.time}`).getTime()
        const dateB = new Date(`${b.date} ${b.time}`).getTime()
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB
      }
      if (sortBy === "title") {
        return sortOrder === "desc" 
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title)
      }
      // Sort by type
      return sortOrder === "desc"
        ? b.contentType.localeCompare(a.contentType)
        : a.contentType.localeCompare(b.contentType)
    })
  }

  const updateNoteState = async (updatedNote: Note) => {
    try {
      // Update the note in the database first
      const response = await fetch(`/api/notes?id=${updatedNote.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      // Update local state
      setNotes((prevNotes) => {
        const newNotes = prevNotes.map((note) => 
          note.id === updatedNote.id ? updatedNote : note
        );
        
        // Update localStorage with the new state
        localStorage.setItem('userNotes', JSON.stringify(newNotes));
        
        return newNotes;
      });

      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-background via-purple-950/20 to-background/80">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="flex items-center h-14 px-4 border-b bg-background/40 backdrop-blur-sm">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full bg-background/20 focus-visible:ring-1 rounded-lg border-none"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 rounded-lg bg-background/20">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy("date")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Date {sortBy === "date" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("title")}>
                    <Text className="mr-2 h-4 w-4" />
                    Title {sortBy === "title" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("type")}>
                    <FileType className="mr-2 h-4 w-4" />
                    Type {sortBy === "type" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortNotes(visibleNotes).map((note) => (
                <NoteCard
                  key={note.id}
                  {...note}
                  onDelete={deleteNote}
                  onToggleFavorite={toggleFavorite}
                  onUpdateTranscript={updateTranscript}
                  setNotes={setNotes}
                />
              ))}
              {visibleNotes.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-background/20 p-4 mb-4 ring-1 ring-border/50">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">No notes found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search query"
                      : currentView === "favorites"
                      ? "You haven't favorited any notes yet"
                      : "Start by creating a new note"}
                  </p>
                </div>
              )}
            </div>
          </main>

          <ActionBar onAddNote={addNote} />
        </div>
      </div>
    </ProtectedRoute>
  )
}

