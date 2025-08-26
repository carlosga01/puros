import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import EmailService from '@/utils/email';

// POST /api/notifications/new-post - Send notifications to followers about a new post
export async function POST(request: Request) {
  try {
    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId is required' },
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

    // Get the review details
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select(`
        id,
        cigar_name,
        rating,
        user_id,
        profiles (
          first_name,
          last_name
        )
      `)
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Ensure the authenticated user is the author of the review
    if (review.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get all followers of the review author
    const { data: followers, error: followersError } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', user.id);

    if (followersError) {
      return NextResponse.json(
        { error: 'Failed to get followers' },
        { status: 500 }
      );
    }

    if (!followers || followers.length === 0) {
      return NextResponse.json(
        { message: 'No followers to notify', notificationsSent: 0 },
        { status: 200 }
      );
    }

    // Get email addresses for all followers
    const followerIds = followers.map(f => f.follower_id);
    const adminSupabase = createAdminClient();
    
    if (!adminSupabase) {
      console.log('Admin client not available - cannot send email notifications');
      return NextResponse.json(
        { message: 'Admin client not configured', notificationsSent: 0 },
        { status: 200 }
      );
    }
    
    const emailPromises = followerIds.map(async (followerId) => {
      try {
        const { data: authUser, error } = await adminSupabase.auth.admin.getUserById(followerId);
        if (error) {
          console.error(`Auth error for follower ${followerId}:`, error);
          return null;
        }
        return authUser?.user?.email;
      } catch (error) {
        console.error(`Failed to get email for follower ${followerId}:`, error);
        return null;
      }
    });

    const followerEmails = (await Promise.all(emailPromises)).filter(
      (email): email is string => email !== null
    );

    if (followerEmails.length === 0) {
      return NextResponse.json(
        { message: 'No valid email addresses found for followers', notificationsSent: 0 },
        { status: 200 }
      );
    }

    // Send email notifications
    const emailService = EmailService.getInstance();
    const profiles = review.profiles as { first_name: string; last_name: string }[];
    const profile = Array.isArray(profiles) ? profiles[0] : profiles;
    const authorName = `${profile.first_name} ${profile.last_name}`;
    const postUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/review/${reviewId}`;

    // Send emails in batches to avoid overwhelming the email service
    const emailPromisesResults = followerEmails.map(email =>
      emailService.sendNewPostNotification(
        authorName,
        review.cigar_name,
        review.rating,
        email,
        postUrl
      ).catch(error => {
        console.error(`Failed to send notification email to ${email}:`, error);
        return false;
      })
    );

    const results = await Promise.all(emailPromisesResults);
    const successCount = results.filter(success => success === true).length;

    console.log(`Sent ${successCount}/${followerEmails.length} post notification emails for review ${reviewId}`);

    return NextResponse.json({
      message: 'Notifications sent',
      notificationsSent: successCount,
      totalFollowers: followerEmails.length,
    });

  } catch (error) {
    console.error('New post notification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
