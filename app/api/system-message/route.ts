import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

const COLLECTION_NAME = 'system_messages';

export async function POST(req: Request) {
  try {
    const { chatId, message } = await req.json();

    if (!chatId || typeof chatId !== 'string') {
      return NextResponse.json(
        { error: 'Chat ID is required and must be a string' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'System message is required and must be a string' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Upsert the system message (update if exists, insert if not)
    await collection.updateOne(
      { chatId: chatId },
      {
        $set: {
          chatId: chatId,
          message: message,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json(
      { success: true, message: 'System message saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving system message:', error);
    return NextResponse.json(
      { error: 'Failed to save system message' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const document = await collection.findOne({ chatId: chatId });

    if (!document) {
      return NextResponse.json(
        { message: '' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: document.message || '', updatedAt: document.updatedAt },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving system message:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve system message' },
      { status: 500 }
    );
  }
}

