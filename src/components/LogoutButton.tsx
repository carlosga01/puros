'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-600 rounded-full font-medium text-gray-300 text-xs sm:text-sm transition-all duration-300 hover:border-red-500 hover:text-red-400 hover:shadow-lg hover:shadow-red-500/10"
    >
      Sign Out
    </button>
  );
} 