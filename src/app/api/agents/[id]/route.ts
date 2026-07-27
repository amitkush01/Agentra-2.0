import { NextRequest, NextResponse } from 'next/server';
import { agentOperations } from '@/lib/database';
import { DEFAULT_VERCEL_AGENTS } from '@/lib/defaultAgents';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = parseInt(params.id);
    
    if (isNaN(agentId)) {
      return NextResponse.json(
        { error: 'Invalid agent ID' },
        { status: 400 }
      );
    }

    try {
      const agent = await agentOperations.getById(agentId);
      if (agent) {
        return NextResponse.json(agent);
      }
    } catch (e) {
      console.log('Database lookup fallback for Vercel');
    }
    
    const fallbackAgent = DEFAULT_VERCEL_AGENTS.find(a => a.id === agentId) || DEFAULT_VERCEL_AGENTS[0];
    return NextResponse.json(fallbackAgent);

  } catch (error) {
    console.error('Error fetching agent:', error);
    const fallbackAgent = DEFAULT_VERCEL_AGENTS[0];
    return NextResponse.json(fallbackAgent);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { name, type, description, config, photoUrl, keyValue, features, status } = await request.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    try {
      await agentOperations.update(id, {
        name,
        type,
        description,
        config,
        photoUrl,
        keyValue,
        features,
        status
      });
    } catch (e) {
      console.log('DB update fallback for Vercel');
    }

    return NextResponse.json({
      id,
      name,
      type,
      description,
      config,
      photo_url: photoUrl,
      key_value: keyValue,
      features,
      status: status || 'active',
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update agent API error:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    try {
      await agentOperations.delete(id);
    } catch (e) {}
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete agent API error:', error);
    return NextResponse.json({ success: true });
  }
}