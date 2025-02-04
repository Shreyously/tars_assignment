import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as Blob;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Verify note exists and belongs to user
    const note = await prisma.note.findUnique({
      where: { id: params.id }
    });

    if (!note || note.userId !== session.user.id) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const imageUrl = await uploadImageToCloudinary(buffer);

    // Update note with new image
    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: {
        images: {
          push: imageUrl
        }
      }
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await auth();
//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const imageIndex = searchParams.get("index");

//     if (!imageIndex) {
//       return NextResponse.json({ error: "Image index required" }, { status: 400 });
//     }

//     const note = await prisma.note.findUnique({
//       where: { id: params.id }
//     });

//     if (!note || note.userId !== session.user.id) {
//       return NextResponse.json({ error: "Note not found" }, { status: 404 });
//     }

//     const images = note.images || [];
//     images.splice(parseInt(imageIndex), 1);

//     const updatedNote = await prisma.note.update({
//       where: { id: params.id },
//       data: {
//         images
//       }
//     });

//     return NextResponse.json(updatedNote);
//   } catch (error) {
//     console.error("Error deleting image:", error);
//     return NextResponse.json(
//       { error: "Failed to delete image" },
//       { status: 500 }
//     );
//   }
// } 
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageIndex = searchParams.get("index");

    if (imageIndex === null) {
      return NextResponse.json({ error: "Image index required" }, { status: 400 });
    }

    // Verify note exists and belongs to user
    const note = await prisma.note.findUnique({
      where: { id: params.id }
    });

    if (!note || note.userId !== session.user.id) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const images = note.images || [];
    images.splice(parseInt(imageIndex), 1);

    // Update note with removed image
    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: {
        images
      }
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}