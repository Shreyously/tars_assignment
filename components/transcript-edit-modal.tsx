"use client"

import * as React from "react"
import { X, Bold, Italic, Underline, Strikethrough, Undo, Redo, List, Heading1 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { Note } from "@/types/note"

interface TranscriptEditModalProps {
  isOpen: boolean
  onClose: () => void
  transcript: string
  onSave: (transcript: string) => void
  note: Note
}

export function TranscriptEditModal({ isOpen, onClose, transcript, onSave, note }: TranscriptEditModalProps) {
  const [editedTranscript, setEditedTranscript] = React.useState(transcript)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [undoStack, setUndoStack] = React.useState<string[]>([transcript])
  const [undoIndex, setUndoIndex] = React.useState(0)

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setEditedTranscript(transcript)
      setUndoStack([transcript])
      setUndoIndex(0)
    }
  }, [isOpen, transcript])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setEditedTranscript(newText)

    // Add to undo stack
    if (newText !== undoStack[undoIndex]) {
      const newStack = undoStack.slice(0, undoIndex + 1)
      setUndoStack([...newStack, newText])
      setUndoIndex(undoIndex + 1)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/notes?id=${note.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: editedTranscript }),
      });

      if (!response.ok) throw new Error('Failed to update transcript');

      onSave(editedTranscript);
      toast.success('Transcript updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update transcript');
      console.error('Error updating transcript:', error);
    }
  };

  const applyFormatting = (format: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editedTranscript.substring(start, end)
    let formattedText = selectedText

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "underline":
        formattedText = `_${selectedText}_`
        break
      case "strikethrough":
        formattedText = `~~${selectedText}~~`
        break
      case "list":
        formattedText = selectedText
          .split("\n")
          .map((line) => `- ${line}`)
          .join("\n")
        break
      case "heading":
        formattedText = selectedText
          .split("\n")
          .map((line) => `# ${line}`)
          .join("\n")
        break
    }

    const newText = editedTranscript.substring(0, start) + formattedText + editedTranscript.substring(end)
    setEditedTranscript(newText)
    setUndoStack([...undoStack.slice(0, undoIndex + 1), newText])
    setUndoIndex(undoIndex + 1)
  }

  const handleUndo = () => {
    if (undoIndex > 0) {
      setUndoIndex(undoIndex - 1)
      setEditedTranscript(undoStack[undoIndex - 1])
    }
  }

  const handleRedo = () => {
    if (undoIndex < undoStack.length - 1) {
      setUndoIndex(undoIndex + 1)
      setEditedTranscript(undoStack[undoIndex + 1])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b p-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Transcript</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(editedTranscript)
              }}
            >
              📋
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-full" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogHeader>
        <div className="p-4">
          <Textarea
            ref={textareaRef}
            value={editedTranscript}
            onChange={handleTextChange}
            className="min-h-[400px] resize-none"
          />
        </div>
        <div className="border-t p-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => applyFormatting("bold")}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => applyFormatting("italic")}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => applyFormatting("underline")}>
              <Underline className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => applyFormatting("strikethrough")}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <div className="mx-2 h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleUndo}
              disabled={undoIndex === 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleRedo}
              disabled={undoIndex === undoStack.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <div className="mx-2 h-4 w-px bg-border" />
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => applyFormatting("list")}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => applyFormatting("heading")}>
              <Heading1 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

