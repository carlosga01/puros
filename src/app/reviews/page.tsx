import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ReviewsTimeline from '../../components/ReviewsTimeline';

export default async function ReviewsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return <ReviewsTimeline />;
} 