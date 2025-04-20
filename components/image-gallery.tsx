"use client"

import * as React from "react"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"

interface ImageGalleryProps {
  images: string[]
  onAddImage: (file: File) => Promise<void>
  onRemoveImage: (index: number) => Promise<void>
  maxImages?: number
}

export function ImageGallery({
  images,
  onAddImage,
  onRemoveImage,
  maxImages = 5,
}: ImageGalleryProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    try {
      await onAddImage(file)
    } catch (error) {
      toast.error('Failed to upload image')
    }
  }

  const handleRemoveImage = async (index: number) => {
    try {
      await onRemoveImage(index)
    } catch (error) {
      toast.error('Failed to remove image')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={image}
              alt={`Image ${index + 1}`}
              fill
              className="rounded-lg object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6"
              onClick={() => handleRemoveImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {images.length < maxImages && (
          <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageAdd}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 