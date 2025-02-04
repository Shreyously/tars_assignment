"use client"

import * as React from "react"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "react-hot-toast"

interface ImageGalleryProps {
  images: string[]
  onAddImage: (file: File) => Promise<void>
  onRemoveImage: (index: number) => Promise<void>
  maxImages?: number
}

export function ImageGallery({ images, onAddImage, onRemoveImage, maxImages = 3 }: ImageGalleryProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    try {
      await onAddImage(file)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      toast.error('Failed to upload image')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {images.map((url, index) => (
          <div key={url} className="relative aspect-square">
            <Image
              src={url}
              alt={`Note image ${index + 1}`}
              fill
              className="rounded-lg object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full"
              onClick={() => onRemoveImage(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {images.length < maxImages && (
          <Button
            variant="outline"
            className="aspect-square h-24 w-24 rounded-lg border-dashed"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
          </Button>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
    </div>
  )
} 