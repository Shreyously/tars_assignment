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
  const [textContent, setTextContent] = React.useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const [audioSegments, setAudioSegments] = useState<Blob[]>([])
  const speechRecognizer = useRef<SpeechRecognition | null>(null)
  const [speechText, setSpeechText] = useState("")
  const [recordingTime, setRecordingTime] = useState(0)
  const timer = useRef<NodeJS.Timeout | null>(null)

  const handleSpeechResult = (event: SpeechRecognitionEvent) => {
    const text = Array.from(event.results)
      .map(result => result[0].transcript)
      .join(' ')
    setSpeechText(text)
  }

  React.useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognizer.current = new SpeechRecognition();
      
      if (speechRecognizer.current) {
        speechRecognizer.current.continuous = true;
        speechRecognizer.current.interimResults = true;
        speechRecognizer.current.onresult = handleSpeechResult;
        speechRecognizer.current.start();
      }
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      timer.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timer.current) {
        clearInterval(timer.current)
      }
      setRecordingTime(0)
    }

    return () => {
      if (timer.current) {
        clearInterval(timer.current)
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })//accessing the user's microphone
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      setAudioSegments([])
      
      //event listener for when the audio data is available
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioSegments(currentSegments => [...currentSegments, event.data])
        }
      }

      recorder.start(200)
      setRecorder(recorder)
      
      
      if (window.webkitSpeechRecognition) {
        const speechRecognition = new window.webkitSpeechRecognition();
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.onresult = handleSpeechResult;//basically the transciption is handled here
        speechRecognition.start();//starting the speech recognition
        speechRecognizer.current = speechRecognition;//recognition is a ref to the speech recognition object
      }
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording')
    }
  }

  const stopRecording = async () => {
    if (recorder && speechRecognizer.current) {
      return new Promise<void>((resolve) => {
        recorder.onstop = async () => {
          try {
            if (audioSegments.length === 0) {
              throw new Error("No audio data collected")
            }
  
            //a blob is a binary large object that can store audio data
            //audioSegments is an array of audio data
            //the audio blob is created from the audio segments
            //the audio blob is then used to save the audio note
            const audioBlob = new Blob(audioSegments, { 
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
  
            const duration = formatDuration(recordingTime)
  
            const words = speechText.trim().split(' ');
            const firstWord = words[0];
            const capitalizedFirstWord = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
            const title = `${capitalizedFirstWord} Audio`;
  
            const formData = new FormData()
            formData.append("content", speechText || "Audio recording")
            formData.append("type", "audio")
            formData.append("audio", audioBlob, "recording.webm")
            formData.append("transcript", speechText)
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
            setSpeechText("")
            setRecordingTime(0)
            toast.success("Note saved")
          } catch (error) {
            console.error("Error saving audio note:", error)
            toast.error(error instanceof Error ? error.message : "Failed to save audio note")
          } finally {
            setIsRecording(false)
            setAudioSegments([])
            recorder.stream.getTracks().forEach(track => track.stop())
            speechRecognizer.current?.stop()
            resolve()
          }
        }
        recorder.stop()
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (textContent.trim()) {
      try {
        const firstWord = textContent.trim().split(' ')[0];
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
            description: textContent,
            contentType: "text",
            transcriptionState: "completed",
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
        
        setTextContent("");
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
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
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

