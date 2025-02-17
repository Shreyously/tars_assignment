import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import { uploadAudioToCloudinary } from "@/lib/cloudinary";


export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check content type to determine if it's a text or audio note
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      // Handle audio note
      const formData = await request.formData();
      const content = formData.get("content") as string;
      const type = formData.get("type") as string;
      const audioFile = formData.get("audio") as Blob;
      const transcript = formData.get("transcript") as string;
      const title = formData.get("title") as string;
      const duration = formData.get("duration") as string;

      if (!audioFile || !(audioFile instanceof Blob)) {
        return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
      }

      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const audioUrl = await uploadAudioToCloudinary(buffer);

      // Format current date and time
      const now = new Date();
      const date = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'  // Remove this line to use local timezone
      });

      const note = await prisma.note.create({
        data: {
          title: title || "Audio Note",
          description: content,
          type: "audio",
          transcript: transcript,
          audioUrl: audioUrl,
          userId: session.user.id,
          transcriptionStatus: "completed",
          isFavorite: false,
          date,
          time,
          duration,
          createdAt: new Date(),
        },
      });

      return NextResponse.json(note, { status: 201 });
    } else {
      // Handle text note
      const data = await request.json();

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

      const note = await prisma.note.create({
        data: {
          title: data.title || "Text Note",
          description: data.description,
          type: "text",
          userId: session.user.id,
          transcriptionStatus: "completed",
          isFavorite: false,
          date,
          time,
          createdAt: new Date(),
        },
      });

      return NextResponse.json(note, { status: 201 });
    }
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json(
      { error: "Failed to save note" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    const data = await request.json();

    const note = await prisma.note.findUnique({
      where: { id }
    });

    if (!note || note.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}