export interface Note {
  id: string
  title: string
  date: string
  time: string
  duration?: string
  description: string
  type: "text" | "audio"
  transcript?: string
  audioUrl?: string
  transcriptionStatus: "pending" | "completed" | "failed"
  speakers?: {
    id: string
    name: string
    color: string
    segments: {
      start: number
      end: number
      text: string
    }[]
  }[]
  isFavorite: boolean
  images?: string[] // Array of image URLs
  attachments?: Array<{ type: string; count: number }>
}

