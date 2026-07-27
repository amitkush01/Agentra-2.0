import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Check if table exists
    const tableCheck = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='ai_agents'", (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
    
    if (!tableCheck) {
      return NextResponse.json({ error: 'ai_agents table does not exist' });
    }
    
    // Get table schema
    const schema = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(ai_agents)", (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
    
    // Try to get agents
    const agents: any = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM ai_agents ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
    
    return NextResponse.json({
      tableExists: !!tableCheck,
      schema,
      agents,
      agentsCount: Array.isArray(agents) ? agents.length : 0,
      agentsType: typeof agents,
      isArray: Array.isArray(agents)
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}