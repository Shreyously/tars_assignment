"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"

interface TranscriptEditModalProps {
  isOpen: boolean
  onClose: () => void
  transcript: string
  onSave: (transcript: string) => void
  note: {
    id: string
  }
}

export function TranscriptEditModal({ isOpen, onClose, transcript, onSave, note }: TranscriptEditModalProps) {
  const [editedTranscript, setEditedTranscript] = React.useState(transcript)

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setEditedTranscript(transcript)
    }
  }, [isOpen, transcript])

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Transcript</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            className="min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

