import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, company } = await request.json();
    
    console.log('Simple test received:', { name, email, company, passwordLength: password?.length });
    
    // Get database
    const db = await getDatabase();
    
    // Check if users table exists
    const tableExists = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
    
    if (!tableExists) {
      return NextResponse.json({
        error: 'Users table does not exist'
      }, { status: 500 });
    }
    
    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
    
    if (existingUser) {
      return NextResponse.json({
        error: 'User with this email already exists'
      }, { status: 400 });
    }
    
    // Try to create user without hashing password
    console.log('Attempting to create user...');
    const result: any = await new Promise((resolve, reject) => {
      db.run('INSERT INTO users (email, name, password, company, provider) VALUES (?, ?, ?, ?, ?)',
        [email, name, password, company, 'email'],
        function(err) {
          if (err) reject(err); else resolve({ id: this.lastID, changes: this.changes });
        });
    });
    
    console.log('User creation result:', result);
    
    if (!result.id) {
      return NextResponse.json({
        error: 'Failed to create user - no ID returned',
        result
      }, { status: 500 });
    }
    
    // Get the created user
    const newUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [result.id], (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
    
    if (!newUser) {
      return NextResponse.json({
        error: 'Failed to retrieve created user'
      }, { status: 500 });
    }
    
    // Return success
    const { password: _, ...userData } = newUser as any;
    return NextResponse.json({
      success: true,
      user: userData,
      message: 'Simple test successful'
    });
    
  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json({
      error: 'Simple test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}