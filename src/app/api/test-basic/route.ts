import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    console.log('Basic test starting...');
    
    // Try to get database
    const db = await getDatabase();
    console.log('Database connection successful');
    
    // Test a simple query
    const result: any = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
    console.log('User count result:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Basic test successful',
      userCount: (result as any)?.count || 0
    });
    
  } catch (error) {
    console.error('Basic test error:', error);
    return NextResponse.json({
      error: 'Basic test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}