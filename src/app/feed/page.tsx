import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import FeedTimeline from '../../components/FeedTimeline';

export default async function FeedPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return <FeedTimeline />;
} 