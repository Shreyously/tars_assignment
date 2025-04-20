"use client"

import * as React from "react"
import { X, Star, Play, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogClose } from "@/components/ui/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b p-4 sticky top-0 bg-background z-10">
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
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    onClose();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
            <div className="text-sm text-muted-foreground">
              {note.date} • {note.time}
            </div>
          </DialogHeader>

          {note.contentType === "audio" && note.audioUrl && (
            <div className="border-b p-4 bg-muted/5">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-10 w-10 hover:bg-primary/10 hover:text-primary" 
                  onClick={togglePlayback}
                >
                  <Play className={`h-5 w-5 ${isPlaying ? "text-primary" : ""}`} />
                </Button>
                <div className="flex-1">
                  <Slider
                    value={[progress]}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    onValueChange={(value) => {
                      if (audioRef.current) {
                        const time = (value[0] / 100) * audioRef.current.duration;
                        audioRef.current.currentTime = time;
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-mono tabular-nums">
                    {formatTime(currentTime)} / {note.duration}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-8 w-8 hover:bg-primary/10 hover:text-primary"
                    onClick={() => {
                      if (audioRef.current?.src) {
                        const a = document.createElement('a');
                        a.href = audioRef.current.src;
                        a.download = `${note.title}.mp3`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                src={note.audioUrl}
                className="hidden"
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
              {currentTone && (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4">
                    <div className="p-4 border rounded-lg bg-muted/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Original Format
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            if (note.contentType === "audio") {
                              onUpdateTranscript(note.id, note.transcript || "")
                            } else {
                              updateNoteState({ ...note, description: note.description || "" })
                            }
                          }}
                        >
                          Use This
                        </Button>
                      </div>
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ 
                        __html: (note.contentType === "audio" ? note.transcript : note.description)
                          ?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>') || ""
                      }} />
                    </div>

                    <div className="p-4 border rounded-lg bg-muted/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Alternative Format
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            const alternativeContent = note.contentType === "audio"
                              ? note.transcript?.replace(/\*\*really\*\*/g, '*really*')
                                  .replace(/\*\*recent and important\*\*/g, '*recent and important*')
                                  .replace(/\*\*definitely\*\*/g, '*definitely*')
                                  .replace(/\*\*It's been too long\*\*/g, '*It\'s been too long*') || ""
                              : note.description?.replace(/\*\*really\*\*/g, '*really*')
                                  .replace(/\*\*recent and important\*\*/g, '*recent and important*')
                                  .replace(/\*\*definitely\*\*/g, '*definitely*')
                                  .replace(/\*\*It's been too long\*\*/g, '*It\'s been too long*') || "";
                            
                            if (note.contentType === "audio") {
                              onUpdateTranscript(note.id, alternativeContent)
                            } else {
                              updateNoteState({ ...note, description: alternativeContent })
                            }
                          }}
                        >
                          Use This
                        </Button>
                      </div>
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ 
                        __html: (note.contentType === "audio" ? note.transcript : note.description)
                          ?.replace(/\*\*(.*?)\*\*/g, '<em>$1</em>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>') || ""
                      }} />
                    </div>
                  </div>
                </div>
              )}
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