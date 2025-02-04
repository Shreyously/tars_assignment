// lib/image-handlers.ts
import type { Note } from "@/types/note"

export const handleAddImage = async (noteId: string, file: File, updateNoteState: (note: Note) => void) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(`/api/notes/${noteId}/images`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) throw new Error('Failed to upload image');
  const updatedNote = await response.json();
  updateNoteState(updatedNote);
  return updatedNote;
};

export const handleRemoveImage = async (noteId: string, index: number, updateNoteState: (note: Note) => void) => {
  const response = await fetch(`/api/notes/${noteId}/images?index=${index}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) throw new Error('Failed to remove image');
  const updatedNote = await response.json();
  updateNoteState(updatedNote);
  return updatedNote;
};