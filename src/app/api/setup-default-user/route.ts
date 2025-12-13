import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { userOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Check if default user already exists
    const existingUser = await userOperations.getByEmail('admin@agentra.ai');

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Default user already exists',
        user: {
          email: (existingUser as any).email,
          name: (existingUser as any).name
        }
      });
    }

    // Create default user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const defaultUser = {
      name: 'Admin User',
      email: 'admin@agentra.ai',
      password: hashedPassword,
      company: 'Agentra AI',
      is_verified: true
    };

    await userOperations.create(defaultUser.email, defaultUser.name, defaultUser.password, defaultUser.company);

    return NextResponse.json({
      success: true,
      message: 'Default user created successfully',
      user: {
        email: defaultUser.email,
        name: defaultUser.name
      }
    });

  } catch (error) {
    console.error('Error creating default user:', error);
    return NextResponse.json(
      { error: 'Failed to create default user' },
      { status: 500 }
    );
  }
} 