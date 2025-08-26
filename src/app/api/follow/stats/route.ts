import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/follow/stats?user_id=xxx - Get follower/following counts for a user
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

    // Get follower count
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user_id);

    // Get following count
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user_id);

    return NextResponse.json({
      followers: followersCount || 0,
      following: followingCount || 0,
    });
  } catch (error) {
    console.error('Follow stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
