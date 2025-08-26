// Database Types for Supabase responses

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  cigar_name: string;
  rating: number;
  notes?: string;
  images?: string[];
  review_date: string;
  created_at: string;
  user_id: string;
  profiles: Profile;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  review_id: string;
  user_id: string;
  profiles: Profile;
}

export interface Like {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

// Response types for Supabase queries
export interface ReviewWithProfile extends Omit<Review, 'profiles'> {
  profiles: Profile;
}

export interface CommentWithProfile extends Omit<Comment, 'profiles'> {
  profiles: Profile;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowWithProfile extends Follow {
  follower: Profile;
  following: Profile;
}

// Utility types for counts
export interface CountResponse {
  count: number | null;
} 