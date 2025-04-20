import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Mic, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface VoiceAssistantProps {
  content: string;
  onTransform: (transformedContent: string, command: string) => void;
  currentTone?: string;
  onNavigate?: (command: string) => void;
}

// Add type definition for SpeechRecognitionError
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

const toneCommands = {
  "formal": "formal",
  "casual": "casual",
  "passive aggressive": "passive_aggressive",
  "impatient": "impatient",
  "enthusiastic": "enthusiastic",
  "diplomatic": "diplomatic",
  "sarcastic": "sarcastic",
  "empathetic": "empathetic",
};

const formatCommands = {
  "make this a bullet list": "bullet_list",
  "add bullet points": "bullet_list",
  "make this a numbered list": "numbered_list",
  "add numbers": "numbered_list",
  "add heading": "add_heading",
  "add subheading": "add_subheading",
  "make this bold": "bold",
  "make this italic": "italic",
  "make this a quote": "quote",
  "add a divider": "divider",
};

const editCommands = {
  "delete this paragraph": "delete_paragraph",
  "delete last paragraph": "delete_last_paragraph",
  "move this up": "move_up",
  "move this down": "move_down",
  "copy this": "copy",
  "cut this": "cut",
  "paste here": "paste",
  "undo": "undo",
  "redo": "redo",
};

const navigationCommands = {
  "go to the beginning": "beginning",
  "go to the end": "end",
  "scroll up": "scroll_up",
  "scroll down": "scroll_down",
  "next paragraph": "next_paragraph",
  "previous paragraph": "previous_paragraph",
  "select all": "select_all",
};

const commandCategories = {
  "Tone Commands": Object.keys(toneCommands).map(cmd => `"${cmd}"`).join(", "),
  "Format Commands": Object.keys(formatCommands).map(cmd => `"${cmd}"`).join(", "),
  "Edit Commands": Object.keys(editCommands).map(cmd => `"${cmd}"`).join(", "),
  "Navigation Commands": Object.keys(navigationCommands).map(cmd => `"${cmd}"`).join(", "),
};

export function VoiceAssistant({ content, onTransform, currentTone, onNavigate }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          console.log("Voice command:", transcript);

          // Check for tone commands
          for (const [command, tone] of Object.entries(toneCommands)) {
            if (transcript.includes(command)) {
              handleCommand(tone, "tone");
              return;
            }
          }

          // Check for format commands
          for (const [command, format] of Object.entries(formatCommands)) {
            if (transcript.includes(command)) {
              handleCommand(format, "format");
              return;
            }
          }

          // Check for edit commands
          for (const [command, edit] of Object.entries(editCommands)) {
            if (transcript.includes(command)) {
              handleCommand(edit, "edit");
              return;
            }
          }

          // Check for navigation commands
          for (const [command, nav] of Object.entries(navigationCommands)) {
            if (transcript.includes(command)) {
              handleCommand(nav, "navigation");
              return;
            }
          }

          // If no command was found
          toast.error("I didn't understand that command. Try saying a command like 'make this bold' or 'go to the beginning'");
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          toast.error("Sorry, I couldn't hear you. Please try again.");
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const handleCommand = async (command: string, type: "tone" | "format" | "edit" | "navigation") => {
    try {
      if (!content || content.trim() === '') {
        toast.error("No content to transform");
        return;
      }

      if (type === "navigation" && onNavigate) {
        onNavigate(command);
        return;
      }

      const response = await fetch("/api/transform-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          content: content.trim(),
          command,
          type
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to execute command");
      }

      const data = await response.json();
      onTransform(data.transformedContent, command);
      
      // Show appropriate success message based on command type
      if (type === "tone") {
        toast.success(`Changed tone to ${command.replace('_', ' ')}`);
      } else if (type === "format") {
        toast.success(`Applied formatting: ${command.replace('_', ' ')}`);
      } else if (type === "edit") {
        toast.success(`Edit command executed: ${command.replace('_', ' ')}`);
      }
    } catch (error) {
      console.error("Error executing command:", error);
      toast.error("Failed to execute command");
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
      toast.info("Listening... Try saying a command like 'make this bold' or 'go to the beginning'");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentTone && (
        <Badge variant="outline" className="text-xs">
          {currentTone.replace('_', ' ')}
        </Badge>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full relative ${
                isListening ? "ring-2 ring-red-500 ring-offset-2" : ""
              }`}
              onClick={toggleListening}
              disabled={!content || content.trim() === ''}
            >
              {isListening ? (
                <div className="relative">
                  <Mic className="h-4 w-4 text-red-500 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                </div>
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-md">
            <div className="flex flex-col gap-2 p-2">
              {Object.entries(commandCategories).map(([category, commands]) => (
                <div key={category} className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{category}:</p>
                  <p className="text-xs text-muted-foreground">{commands}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-1">
                Click to start listening
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 