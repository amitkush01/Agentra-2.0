import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Check if users table exists
    const tableExists = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
    
    if (!tableExists) {
      const tables = await new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
          if (err) reject(err); else resolve(rows);
        });
      });
      return NextResponse.json({
        error: 'Users table does not exist',
        tables
      });
    }
    
    // Get table schema
    const schema = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
    
    // Get user count
    const userCount = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
    
    // Get all users (without passwords)
    const users = await new Promise((resolve, reject) => {
      db.all("SELECT id, email, name, company, is_verified, created_at, last_login FROM users", (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
    
    return NextResponse.json({
      success: true,
      tableExists: !!tableExists,
      schema,
      userCount,
      users
    });
    
  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json({
      error: 'Failed to debug users table',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}