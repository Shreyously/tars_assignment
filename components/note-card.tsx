"use client"

import * as React from "react"
import { MoreHorizontal, Play, Text, Copy, Trash2, Star, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NoteModal } from "./note-modal"
import { toast } from "sonner"
import { handleAddImage, handleRemoveImage } from "@/lib/image-handlers"
import { useState, useRef } from "react"
import { CalendarDays } from "lucide-react"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { AudioPlayer } from "./audio-player"
import { ImageGallery } from "./image-gallery"
import type { Note } from "@/types/note"

interface NoteCardProps {
  id: string
  title: string
  description: string
  date: string
  time: string
  contentType: "text" | "audio"
  duration?: string
  transcript?: string
  audioUrl?: string
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
  tags: string[]
  images?: string[]
  handleRemoveTag: (tag: string) => void
  onUpdateTranscript: (id: string, transcript: string) => void
  onUpdateTags?: (id: string, tags: string[]) => void
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
  attachments?: Array<{
    type: string
    count: number
  }>
}

export function NoteCard({
  id,
  title,
  description,
  date,
  time,
  contentType,
  audioUrl,
  transcript,
  duration,
  isFavorite,
  tags = [],
  images = [],
  onDelete,
  onToggleFavorite,
  onUpdateTranscript,
  onUpdateTags,
  setNotes,
  handleRemoveTag,
  attachments
}: NoteCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTag, setNewTag] = useState("")
  const audioRef = useRef<HTMLAudioElement>(null)

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

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      onUpdateTags?.(id, [...tags, newTag.trim()])
      setNewTag("")
      setShowTagInput(false)
    }
  }

  const handleUpdateTranscript = (newTranscript: string) => {
    onUpdateTranscript(id, newTranscript)
    setNotes((prevNotes: Note[]) => {
      return prevNotes.map((note: Note) => {
        if (note.id === id) {
          return { ...note, transcript: newTranscript }
        }
        return note
      })
    })
  }

  const handleUpdateTags = (newTags: string[]) => {
    onUpdateTags?.(id, newTags)
    setNotes((prevNotes: Note[]) => {
      return prevNotes.map((note: Note) => {
        if (note.id === id) {
          return { ...note, tags: newTags }
        }
        return note
      })
    })
  }

  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 bg-card/50 backdrop-blur-sm border-muted/20"
      onClick={() => setIsModalOpen(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background/90"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(id)
          }}
        >
          <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
        </Button>
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="text-muted-foreground/80 font-medium">{date} · {time}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            {contentType === "audio" ? (
              <>
                <Play className="h-3.5 w-3.5" />
                <span className="font-medium text-xs">{duration}</span>
              </>
            ) : (
              <Text className="h-3.5 w-3.5" />
            )}
          </div>
        </div>
        <div className="space-y-2.5">
          <h3 className="font-semibold text-lg tracking-tight line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground/90 line-clamp-2">
            {contentType === "audio" && transcript
              ? transcript
              : description}
          </p>
        </div>
      </div>
      
      {attachments && attachments.length > 0 && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/80 bg-muted/50 rounded-full px-3 py-1.5 w-fit">
            <Play className="h-3.5 w-3.5" />
            <span>{attachments[0].count} {attachments[0].type}</span>
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="px-5 pb-3">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1"
              >
                <Tag className="h-3 w-3" />
                <span>{tag}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveTag(tag)
                  }}
                  className="hover:text-primary/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <CardFooter className="justify-end gap-2 p-3 bg-muted/5 border-t border-muted/10">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 hover:bg-background/80"
          onClick={(e) => {
            e.stopPropagation()
            handleCopyContent(e)
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-background/80">
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
        onUpdateTranscript={handleUpdateTranscript}
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