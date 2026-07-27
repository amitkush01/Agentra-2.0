import { NextRequest, NextResponse } from 'next/server';
import { contactMessageOperations } from '@/lib/database';
import { sendContactNotificationEmail, ADMIN_NOTIFICATION_EMAIL } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // 1. Save message to database
    const result: any = await contactMessageOperations.create(name, email, company || '', message);

    // 2. Dispatch email notification to admin Gmail (amitstm444@gmail.com)
    await sendContactNotificationEmail({
      name,
      email,
      company,
      message
    });

    return NextResponse.json(
      {
        success: true,
        message: `Contact message sent successfully and notified to ${ADMIN_NOTIFICATION_EMAIL}`,
        id: result.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Failed to send contact message' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const messages = await contactMessageOperations.getAll();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact messages' },
      { status: 500 }
    );
  }
}