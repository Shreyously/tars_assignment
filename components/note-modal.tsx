"use client"

import * as React from "react"
import { X, Star, Play, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { TranscriptionView } from "./transcription-view"
import { TranscriptEditModal } from "./transcript-edit-modal"
import type { Note } from "@/types/note"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { FileText, PenLine, Plus, Users } from "lucide-react"
import { NoteTransformer } from "./note-transformer"
import { VoiceAssistant } from "./voice-assistant"

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  note: Note
  onToggleFavorite: (id: string) => void
  onUpdateTranscript: (id: string, transcript: string) => void
  onAddImage?: (id: string, file: File) => Promise<void>
  onRemoveImage?: (id: string, index: number) => Promise<void>
  updateNoteState: (note: Note) => void
}

export function NoteModal({
  isOpen,
  onClose,
  note,
  onToggleFavorite,
  onUpdateTranscript,
  onAddImage,
  onRemoveImage,
  updateNoteState
}: NoteModalProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [isTranscriptEditOpen, setIsTranscriptEditOpen] = React.useState(false)
  const [currentTone, setCurrentTone] = React.useState<string>("")
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const transcriptRef = React.useRef<HTMLDivElement>(null)
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState(note.title)
  const titleInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  const handleTitleSubmit = async () => {
    if (editedTitle.trim() !== note.title) {
      try {
        const response = await fetch(`/api/notes?id=${note.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: editedTitle }),
        });

        if (!response.ok) throw new Error('Failed to update title');

        const updatedNote = { ...note, title: editedTitle.trim() };
        updateNoteState(updatedNote);
        toast.success('Title updated');
      } catch (error) {
        toast.error('Failed to update title');
        setEditedTitle(note.title);
      }
    }
    setIsEditingTitle(false);
  }

  const togglePlayback = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(progress)
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleNavigation = (command: string) => {
    if (!transcriptRef.current) return;

    switch (command) {
      case "beginning":
        transcriptRef.current.scrollTop = 0;
        break;
      case "end":
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        break;
      case "scroll_up":
        transcriptRef.current.scrollTop -= 100;
        break;
      case "scroll_down":
        transcriptRef.current.scrollTop += 100;
        break;
      case "next_paragraph":
        // Implementation for next paragraph navigation
        break;
      case "previous_paragraph":
        // Implementation for previous paragraph navigation
        break;
      case "select_all":
        const range = document.createRange();
        range.selectNodeContents(transcriptRef.current);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        break;
    }
  };

  const handleTransform = (transformedContent: string, command: string) => {
    console.log("Transforming note:", note.id, "with content:", transformedContent);
    const updatedNote = {
      ...note,
      ...(note.contentType === "audio" 
        ? { transcript: transformedContent }
        : { description: transformedContent }
      )
    };
    console.log("Updated note:", updatedNote);
    updateNoteState(updatedNote);
    setCurrentTone(command);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="max-w-2xl rounded-2xl p-0">
          <DialogHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isEditingTitle ? (
                  <Input
                    ref={titleInputRef}
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="h-7 w-[200px] text-xl font-semibold"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSubmit()
                      if (e.key === 'Escape') {
                        setEditedTitle(note.title)
                        setIsEditingTitle(false)
                      }
                    }}
                    onBlur={handleTitleSubmit}
                  />
                ) : (
                  <h2
                    className="text-xl font-semibold cursor-pointer hover:text-gray-600 transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                    title="Click to edit"
                  >
                    {note.title}
                  </h2>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => onToggleFavorite(note.id)}
                >
                  <Star className={note.isFavorite ? "fill-yellow-400 text-yellow-400" : ""} />
                </Button>
              </div>
              {/* Single Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {note.date} • {note.time}
            </div>
          </DialogHeader>

          {note.contentType === "audio" && (
            <div className="border-b p-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full" onClick={togglePlayback}>
                  <Play className={isPlaying ? "text-purple-600" : ""} />
                </Button>
                <div className="flex-1">
                  <Slider
                    value={[progress]}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-bold">
                    {formatTime(currentTime)} / {note.duration}
                  </span>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                src={note.audioUrl}
              />
            </div>
          )}

          <Tabs defaultValue="transcript" className="w-full">
            <div className="border-b">
              <TabsList className="w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
                <TabsTrigger 
                  value="transcript"
                  className="relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Transcript
                </TabsTrigger>
                {note.contentType === "audio" && (
                  <TabsTrigger 
                    value="speakers"
                    className="relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Speakers
                  </TabsTrigger>
                )}
                <TabsTrigger 
                  value="notes"
                  className="relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <PenLine className="mr-2 h-4 w-4" />
                  Notes
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="transcript" className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Transcript</h3>
                <div className="flex items-center gap-2">
                  <VoiceAssistant
                    content={note.contentType === "audio" ? note.transcript || "" : note.description || ""}
                    onTransform={handleTransform}
                    currentTone={currentTone}
                    onNavigate={handleNavigation}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setIsTranscriptEditOpen(true)}
                  >
                    <PenLine className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div ref={transcriptRef} className="max-h-[60vh] overflow-y-auto">
                <TranscriptionView
                  note={note}
                  onReadMore={() => setIsTranscriptEditOpen(true)}
                  onAddImage={async (file) => onAddImage?.(note.id, file)}
                  onRemoveImage={async (index) => onRemoveImage?.(note.id, index)}
                />
              </div>
            </TabsContent>

            {note.contentType === "audio" && (
              <TabsContent value="speakers" className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Speakers</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {/* Speaker list will go here */}
              </TabsContent>
            )}

            <TabsContent value="notes" className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Notes</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {/* Notes list will go here */}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <TranscriptEditModal
        isOpen={isTranscriptEditOpen}
        onClose={() => setIsTranscriptEditOpen(false)}
        transcript={note.contentType === "audio" ? note.transcript || "" : note.description || ""}
        note={note}
        onSave={(transcript) => {
          if (note.contentType === "audio") {
            onUpdateTranscript(note.id, transcript)
          } else {
            updateNoteState({ ...note, description: transcript })
          }
          setIsTranscriptEditOpen(false)
        }}
      />
    </>
  )
}