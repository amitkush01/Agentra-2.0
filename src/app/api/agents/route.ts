import { NextRequest, NextResponse } from 'next/server';
import { agentOperations } from '@/lib/database';
import { DEFAULT_VERCEL_AGENTS } from '@/lib/defaultAgents';

export async function GET() {
  try {
    const agents = await agentOperations.getAll();
    if (Array.isArray(agents) && agents.length > 0) {
      return NextResponse.json(agents);
    }
    return NextResponse.json(DEFAULT_VERCEL_AGENTS);
  } catch (error) {
    console.error('Agents API error:', error);
    return NextResponse.json(DEFAULT_VERCEL_AGENTS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, description, config, photoUrl, keyValue, features } = await request.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const userId = 1;
    let resultId = Date.now();
    
    try {
      const result: any = await agentOperations.create(userId, name, type, description, config, photoUrl, keyValue, features);
      if (result && result.id) resultId = result.id;
    } catch (e) {
      console.log('Database read-only fallback mode active');
    }

    const newAgent = {
      id: resultId,
      name,
      type,
      description,
      config,
      photo_url: photoUrl,
      key_value: keyValue,
      features,
      user_id: userId,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    console.error('Agents API error:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
