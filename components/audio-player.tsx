"use client"

import * as React from "react"
import { Play, Pause, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  audioUrl: string
  duration?: string
  onPlaybackChange?: (isPlaying: boolean) => void
  className?: string
}

export function AudioPlayer({ audioUrl, duration, onPlaybackChange, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  const togglePlayback = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
    onPlaybackChange?.(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(progress)
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      const time = (value[0] / 100) * audioRef.current.duration
      audioRef.current.currentTime = time
      setProgress(value[0])
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false)
        onPlaybackChange?.(false)
      })
    }
  }, [onPlaybackChange])

  return (
    <div className={cn("flex items-center gap-4 w-full px-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-10 w-10 rounded-full hover:bg-primary/10",
          isPlaying && "text-primary bg-primary/10"
        )}
        onClick={togglePlayback}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <div className="flex-1">
        <Slider
          value={[progress]}
          max={100}
          step={1}
          onValueChange={handleSliderChange}
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:hover:bg-primary/80"
        />
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="font-medium tabular-nums">
          {formatTime(currentTime)} / {duration || "0:00"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/10"
          onClick={() => {
            if (audioUrl) {
              window.open(audioUrl, "_blank")
            }
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        src={audioUrl}
        preload="metadata"
      />
    </div>
  )
} 