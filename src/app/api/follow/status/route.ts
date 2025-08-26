import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/follow/status?user_id=xxx - Check if current user follows another user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if current user follows the specified user
    const { data: follow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', user_id)
      .single();

    return NextResponse.json({ 
      isFollowing: !!follow,
      followId: follow?.id || null 
    });
  } catch (error) {
    console.error('Follow status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
