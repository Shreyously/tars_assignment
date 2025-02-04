import { NoteCard } from "@/components/note-card"
import type { Note } from "@/types/note"

interface FavoritesPageProps {
  notes: Note[]
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  onUpdateTranscript: (id: string, transcript: string) => void
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
}

export function FavoritesPage({ notes, onDelete, onToggleFavorite, onUpdateTranscript, setNotes }: FavoritesPageProps) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Favorites</h2>
      {notes.length === 0 ? (
        <p className="text-center text-muted-foreground">No favorite notes yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              {...note}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onUpdateTranscript={onUpdateTranscript}
              setNotes={setNotes}
            />
          ))}
        </div>
      )}
    </div>
  )
}

