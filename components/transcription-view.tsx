"use client"
import { Button } from "@/components/ui/button"
import type { Note } from "@/types/note"
import { ImageGallery } from "./image-gallery"

interface TranscriptionViewProps {
  note: Note
  onReadMore?: () => void
  onAddImage?: (file: File) => Promise<void>
  onRemoveImage?: (index: number) => Promise<void>
}

export function TranscriptionView({ note, onReadMore, onAddImage, onRemoveImage }: TranscriptionViewProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <h3 className="text-sm font-medium mb-2">
          {note.contentType === "audio" ? "Transcript" : "Description"}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ 
          __html: (note.contentType === "audio" 
            ? note.transcript?.slice(0, 150) 
            : note.description?.slice(0, 150))
            ?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>') || ""
        }} />
        {((note.contentType === "audio" && note.transcript && note.transcript.length > 150) || 
          (note.contentType === "text" && note.description && note.description.length > 150)) && 
          <span className="text-sm text-muted-foreground">...</span>
        }
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 rounded-full text-xs font-normal"
          onClick={() => {
            const content = note.contentType === "audio" ? note.transcript : note.description;
            // Remove markdown symbols before copying
            const formattedContent = content?.replace(/\*\*(.*?)\*\*/g, '$1')
                                          .replace(/\*(.*?)\*/g, '$1') || "";
            formattedContent && navigator.clipboard.writeText(formattedContent);
          }}
        >
          Copy
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-xs font-normal text-muted-foreground hover:text-foreground"
        onClick={onReadMore}
      >
        Read More
      </Button>
      
      <div className="pt-4">
        <ImageGallery
          images={note.images || []}
          onAddImage={onAddImage!}
          onRemoveImage={onRemoveImage!}
          maxImages={3}
        />
      </div>
    </div>
  )
}

