"use client"

import * as React from "react"
import { PenLine, Image, Mic, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import type { Note } from "@/types/note"

interface ActionBarProps {
  onAddNote: (note: Note) => void
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function ActionBar({ onAddNote }: ActionBarProps) {
  const [noteContent, setNoteContent] = React.useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const recognition = useRef<SpeechRecognition | null>(null)
  const [transcript, setTranscript] = useState("")
  const [recordingDuration, setRecordingDuration] = useState(0)
  const recordingTimer = useRef<NodeJS.Timeout | null>(null)

  const handleTranscription = (event: SpeechRecognitionEvent) => {
    const finalTranscript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join(' ')
    setTranscript(finalTranscript)
  }

  React.useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      
      if (recognition.current) {
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.onresult = handleTranscription;
        recognition.current.start();
      }
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current)
      }
      setRecordingDuration(0)
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current)
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      setAudioChunks([])
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(currentChunks => [...currentChunks, event.data])
        }
      }

      recorder.start(200)
      setMediaRecorder(recorder)
      
      if (window.webkitSpeechRecognition) {
        const speechRecognition = new window.webkitSpeechRecognition();
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.onresult = handleTranscription;
        speechRecognition.start();
        recognition.current = speechRecognition;
      }
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording')
    }
  }

  const stopRecording = async () => {
    if (mediaRecorder && recognition.current) {
      return new Promise<void>((resolve) => {
        mediaRecorder.onstop = async () => {
          try {
            if (audioChunks.length === 0) {
              throw new Error("No audio data collected")
            }
  
            const audioBlob = new Blob(audioChunks, { 
              type: 'audio/webm;codecs=opus'
            })
            
            const now = new Date();
            const date = now.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
            const time = now.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            });
  
            const duration = formatDuration(recordingDuration)
  
            const words = transcript.trim().split(' ');
            const firstWord = words[0];
            const capitalizedFirstWord = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
            const title = `${capitalizedFirstWord} Audio`;
  
            const formData = new FormData()
            formData.append("content", transcript || "Audio recording")
            formData.append("type", "audio")
            formData.append("audio", audioBlob, "recording.webm")
            formData.append("transcript", transcript)
            formData.append("title", title)
            formData.append("duration", duration)
  
            const response = await fetch("/api/notes", {
              method: "POST",
              body: formData,
            })
  
            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || "Failed to save note")
            }
  
            const noteData = await response.json()
            onAddNote(noteData as Note)
            setTranscript("")
            setRecordingDuration(0)
            toast.success("Note saved")
          } catch (error) {
            console.error("Error saving audio note:", error)
            toast.error(error instanceof Error ? error.message : "Failed to save audio note")
          } finally {
            setIsRecording(false)
            setAudioChunks([])
            mediaRecorder.stream.getTracks().forEach(track => track.stop())
            recognition.current?.stop()
            resolve()
          }
        }
        mediaRecorder.stop()
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noteContent.trim()) {
      try {
        const firstWord = noteContent.trim().split(' ')[0];
        const title = `${firstWord} Note`;
  
        const now = new Date();
        const date = now.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        const time = now.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
  
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            description: noteContent,
            type: "text",
            transcriptionStatus: "completed",
            isFavorite: false,
            date,
            time,
            createdAt: new Date(),
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to save note');
        }
  
        const savedNote = await response.json();
        onAddNote(savedNote as Note);
        
        setNoteContent("");
        toast.success("Note created successfully");
      } catch (error) {
        console.error('Error creating note:', error);
        toast.error('Failed to create note');
      }
    }
  };
  

  return (
    <div className="fixed bottom-6 left-1/2 flex w-[90%] max-w-[640px] -translate-x-1/2 items-center justify-between rounded-full border bg-white p-2 shadow-lg">
      <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
        <Button type="button" variant="ghost" size="icon" className="rounded-full">
          <PenLine className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="rounded-full">
          <Image className="h-4 w-4" />
        </Button>
        <Input
          type="text"
          placeholder="Type a note..."
          className="flex-1 rounded-full border-none bg-transparent"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
        />
        <Button type="submit" variant="ghost" size="icon" className="rounded-full">
          <Send className="h-4 w-4" />
        </Button>
      </form>
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        className={cn(
          "ml-2 rounded-full px-6 text-white",
          isRecording 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-purple-500 hover:bg-purple-600"
        )}
      >
        {isRecording ? (
          <>
            <X className="mr-2 h-4 w-4" />
            Stop recording
          </>
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4" />
            Start recording
          </>
        )}
      </Button>
    </div>
  )
}

