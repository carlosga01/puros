import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

// POST /api/follow - Follow a user
export async function POST(request: Request) {
  try {
    const { following_id } = await request.json();

    if (!following_id) {
      return NextResponse.json(
        { error: 'following_id is required' },
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

    // Check if user is trying to follow themselves
    if (user.id === following_id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', following_id)
      .single();

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      );
    }

    // Create follow relationship
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: following_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Follow error:', error);
      return NextResponse.json(
        { error: 'Failed to follow user' },
        { status: 500 }
      );
    }

    // Send follow notification email
    try {
      // Get follower and following profile data for email
      const { data: followerProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const { data: followingProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', following_id)
        .single();

      // Get following user's email from auth using admin client
      const adminSupabase = createAdminClient();
      if (!adminSupabase) {
        console.log('Admin client not available - skipping email notification');
        return NextResponse.json({ data }, { status: 201 });
      }

      const { data: authUser } = await adminSupabase.auth.admin.getUserById(following_id);

      if (followerProfile && followingProfile && authUser?.user?.email) {
        const EmailService = (await import('@/utils/email')).default;
        const emailService = EmailService.getInstance();
        
        const followerName = `${followerProfile.first_name} ${followerProfile.last_name}`;
        
        // Send email notification (don't await to avoid blocking the response)
        emailService.sendFollowNotification(followerName, authUser.user.email)
          .catch(error => console.error('Failed to send follow notification email:', error));
      }
    } catch (emailError) {
      console.error('Error preparing follow notification email:', emailError);
      // Don't fail the follow action if email fails
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Follow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/follow - Unfollow a user
export async function DELETE(request: Request) {
  try {
    const { following_id } = await request.json();

    if (!following_id) {
      return NextResponse.json(
        { error: 'following_id is required' },
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

    // Delete follow relationship
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', following_id);

    if (error) {
      console.error('Unfollow error:', error);
      return NextResponse.json(
        { error: 'Failed to unfollow user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Unfollow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
