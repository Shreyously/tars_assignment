"use client"

import * as React from "react"
import { MoreHorizontal, Play, Text, Copy, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NoteModal } from "./note-modal"
import type { Note } from "@/types/note"
import { toast } from "sonner"
import { handleAddImage, handleRemoveImage } from "@/lib/image-handlers"

interface NoteCardProps extends Note {
  images?: string[];
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateTranscript: (id: string, transcript: string) => void;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export function NoteCard({
  id,
  title,
  date,
  time,
  description,
  contentType,
  transcript,
  audioUrl,
  attachments,
  isFavorite,
  onDelete,
  onToggleFavorite,
  onUpdateTranscript,
  duration,
  images,
  setNotes,
}: NoteCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const handleImageAdd = async (id: string, file: File) => {
    return handleAddImage(id, file, (updatedNote) => {
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === id ? { ...note, images: updatedNote.images } : note
        )
      );
    });
  };

  const handleImageRemove = async (id: string, index: number) => {
    return handleRemoveImage(id, index, (updatedNote) => {
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === id ? { ...note, images: updatedNote.images } : note
        )
      );
    });
  };

  const handleCopyContent = (e: React.MouseEvent) => {
    e.stopPropagation()
    const content = contentType === "audio" ? transcript : description
    navigator.clipboard.writeText(content || "")
    toast.success("Content copied to clipboard")
  }

  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer hover-card bg-card/50 backdrop-blur-sm"
      onClick={() => setIsModalOpen(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(id)
          }}
        >
          <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
        </Button>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span className="text-muted-foreground/80 font-medium">{date} · {time}</span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
            {contentType === "audio" ? (
              <>
                <Play className="h-4 w-4" />
                <span className="font-medium">{duration}</span>
              </>
            ) : (
              <Text className="h-4 w-4" />
            )}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold text-lg tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {contentType === "audio" && transcript
              ? transcript
              : description}
          </p>
        </div>
      </div>
      
      {attachments && attachments.length > 0 && (
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground/80 bg-muted/50 rounded-full px-4 py-1.5 w-fit">
            <Play className="h-4 w-4" />
            <span>{attachments[0].count} {attachments[0].type}</span>
          </div>
        </div>
      )}

      <CardFooter className="justify-end gap-2 p-4 bg-muted/5">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 hover:bg-background"
          onClick={handleCopyContent}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-background">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                onDelete(id)
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        note={{
          id,
          title,
          date,
          time,
          description,
          contentType,
          transcript,
          audioUrl,
          attachments,
          isFavorite,
          duration,
          transcriptionState: "completed",
          images: images || [],
        }}
        onToggleFavorite={onToggleFavorite}
        onUpdateTranscript={onUpdateTranscript}
        onAddImage={handleImageAdd}
        onRemoveImage={handleImageRemove}
        updateNoteState={(updatedNote) => 
          setNotes(prevNotes => 
            prevNotes.map(note => 
              note.id === id ? { ...note, ...updatedNote } : note
            )
          )
        }
      />
    </Card>
  )
}