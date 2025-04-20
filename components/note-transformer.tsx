import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MessageSquare } from "lucide-react";

const tones = [
  { 
    id: "formal", 
    label: "Formal",
    description: "Make it more professional and business-like"
  },
  { 
    id: "casual", 
    label: "Casual",
    description: "Make it more friendly and conversational"
  },
  { 
    id: "passive_aggressive", 
    label: "Passive-Aggressive",
    description: "Add some subtle sarcasm and indirectness"
  },
  { 
    id: "impatient", 
    label: "Impatient",
    description: "Make it more direct and to-the-point"
  },
  { 
    id: "enthusiastic", 
    label: "Enthusiastic",
    description: "Add excitement and energy"
  },
  { 
    id: "diplomatic", 
    label: "Diplomatic",
    description: "Make it more tactful and considerate"
  },
  { 
    id: "sarcastic", 
    label: "Sarcastic",
    description: "Add some witty and ironic remarks"
  },
  { 
    id: "empathetic", 
    label: "Empathetic",
    description: "Make it more understanding and supportive"
  }
];

interface NoteTransformerProps {
  content: string;
  onTransform: (transformedContent: string) => void;
}

export function NoteTransformer({ content, onTransform }: NoteTransformerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const transformNote = async (tone: string) => {
    try {
      // Check if we have content to transform
      if (!content || content.trim() === '') {
        toast.error("No content to transform");
        return;
      }

      setIsLoading(true);
      console.log("Sending request with content:", content, "and tone:", tone);
      
      const response = await fetch("/api/transform-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          content: content.trim(),
          tone 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to transform note");
      }

      const data = await response.json();
      console.log("Received response:", data);
      
      if (!data.transformedContent) {
        throw new Error("No transformed content received");
      }

      onTransform(data.transformedContent);
      toast.success("Tone adjusted successfully!");
    } catch (error) {
      console.error("Error transforming note:", error);
      toast.error(error instanceof Error ? error.message : "Failed to adjust tone");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          disabled={isLoading || !content || content.trim() === ''}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {tones.map((tone) => (
          <DropdownMenuItem
            key={tone.id}
            onClick={() => transformNote(tone.id)}
            disabled={isLoading || !content || content.trim() === ''}
            className="flex flex-col items-start gap-1"
          >
            <span className="font-medium">{tone.label}</span>
            <span className="text-xs text-muted-foreground">{tone.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 