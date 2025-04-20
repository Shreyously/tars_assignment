import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const tonePrompts = {
  formal: "Rewrite the following text in a more formal and professional tone, using business-appropriate language while maintaining the original meaning:",
  casual: "Make this text more casual and conversational, as if you're talking to a friend, while keeping the same information:",
  passive_aggressive: "Rewrite this text with a passive-aggressive tone, adding subtle sarcasm and indirectness while maintaining the core message:",
  impatient: "Make this text more direct and to-the-point, as if the writer is in a hurry and wants to get straight to the point:",
  enthusiastic: "Add excitement and energy to this text, making it more enthusiastic and engaging while keeping the same information:",
  diplomatic: "Rewrite this text in a more diplomatic and tactful way, being careful not to offend while maintaining the message:",
  sarcastic: "Add some witty and ironic remarks to this text, making it more sarcastic while keeping the core message:",
  empathetic: "Make this text more understanding and supportive, showing empathy while maintaining the original information:"
};

const formatPrompts = {
  bullet_list: "Convert the following text into a bullet point list, maintaining the original information:",
  numbered_list: "Convert the following text into a numbered list, maintaining the original information:",
  add_heading: "Add a heading to the following text and format it appropriately:",
  add_subheading: "Add a subheading to the following text and format it appropriately:",
  bold: "Make the following text bold where appropriate, emphasizing key points:",
  italic: "Make the following text italic where appropriate, adding emphasis:",
  quote: "Format the following text as a quote, adding appropriate quotation marks and styling:",
  divider: "Add appropriate dividers or separators to the following text:"
};

const editPrompts = {
  delete_paragraph: "Remove the last paragraph from the following text:",
  delete_last_paragraph: "Remove the last paragraph from the following text:",
  move_up: "Move the current paragraph up in the following text:",
  move_down: "Move the current paragraph down in the following text:",
  copy: "Copy the following text:",
  cut: "Cut the following text:",
  paste: "Paste the following text:",
  undo: "Undo the last change in the following text:",
  redo: "Redo the last change in the following text:"
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

    const { content, command, type } = body;

    if (!content) {
      console.error("No content provided");
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    let prompt = "";
    if (type === "tone" && command in tonePrompts) {
      prompt = `${tonePrompts[command as keyof typeof tonePrompts]}\n\n${content}`;
    } else if (type === "format" && command in formatPrompts) {
      prompt = `${formatPrompts[command as keyof typeof formatPrompts]}\n\n${content}`;
    } else if (type === "edit" && command in editPrompts) {
      prompt = `${editPrompts[command as keyof typeof editPrompts]}\n\n${content}`;
    } else {
      console.error("Invalid command or type:", { command, type });
      return NextResponse.json(
        { error: "Invalid command or type specified" },
        { status: 400 }
      );
    }

    console.log("Sending prompt to Groq:", prompt);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log("Received response from Groq:", chatCompletion);

    const transformedContent = chatCompletion.choices[0]?.message?.content || "";
    
    if (!transformedContent) {
      console.error("No transformed content received from Groq");
      return NextResponse.json(
        { error: "Failed to generate transformed content" },
        { status: 500 }
      );
    }

    return NextResponse.json({ transformedContent });
  } catch (error) {
    console.error("Error in transform-note route:", error);
    return NextResponse.json(
      { error: "Failed to transform note", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 