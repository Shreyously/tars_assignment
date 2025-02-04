"use client"

import * as React from "react"
import { MoreHorizontal, Play, Text, Copy, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NoteModal } from "./note-modal"
import type { Note } from "@/types/note"
import { toast } from "react-hot-toast"
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
  type,
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
    e.stopPropagation() // Prevent modal from opening
    const content = type === "audio" ? transcript : description
    navigator.clipboard.writeText(content || "")
    toast.success("Content copied to clipboard")
  }

  return (
    <Card 
      className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setIsModalOpen(true)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span className="text-gray-500">{date} · {time}</span>
          <div className="flex items-center gap-1">
            {type === "audio" ? (
              <>
                <Play className="h-4 w-4" />
                <span>{duration}</span>
              </>
            ) : (
              <div className="bg-gray-200 rounded px-2 py-0.5">
                <Text className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-start">
          <h3 className="font-semibold leading-none">
            {title}
          </h3>
        </div>
      </div>
      <CardContent>
        <p className="text-sm text-gray-600">
          {type === "audio" && transcript
            ? transcript.length > 100
              ? `${transcript.slice(0, 100)}...`
              : transcript
            : description.length > 100
              ? `${description.slice(0, 100)}...`
              : description}
        </p>
        {attachments && attachments.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <Play className="h-4 w-4" />
            <span>{attachments[0].count} {attachments[0].type}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8"
          onClick={handleCopyContent}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              onDelete(id)
            }}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(id)
            }}>
              <Star className="mr-2 h-4 w-4" /> {isFavorite ? "Remove from favorites" : "Add to favorites"}
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
          type,
          transcript,
          audioUrl,
          attachments,
          isFavorite,
          duration,
          transcriptionStatus: "completed",
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