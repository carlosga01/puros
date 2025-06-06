import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LogoutButton from '../../components/LogoutButton';
import ProfileIcon from '../../components/ProfileIcon';

export default async function HomePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If no profile exists, redirect to profile setup
  if (!profile) {
    redirect('/profile-setup');
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-black to-red-900/20"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Puros</h1>
                  <p className="text-xs sm:text-sm text-gray-400">Premium Cigar Hub</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center space-x-3">
                  <ProfileIcon profile={profile} />
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-gray-400">Welcome back</p>
                    <p className="font-medium text-sm sm:text-base">{profile.first_name}</p>
                  </div>
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                YOUR CLUB
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 font-light">Ready to explore premium cigars?</p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {/* Reviews Card */}
            <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">⭐</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Reviews</h3>
                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Share your experiences</p>
                <div className="text-amber-400 font-semibold text-sm sm:text-base">Coming Soon</div>
              </div>
            </div>

            {/* Discover Card */}
            <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">🔍</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Discover</h3>
                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Find new favorites</p>
                <div className="text-amber-400 font-semibold text-sm sm:text-base">Coming Soon</div>
              </div>
            </div>

            {/* Community Card */}
            <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">👥</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Community</h3>
                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Connect with others</p>
                <div className="text-amber-400 font-semibold text-sm sm:text-base">Coming Soon</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 w-full sm:w-auto">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Begin?</h3>
              <p className="text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">Your premium cigar journey starts here</p>
              <button className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full font-semibold text-black text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/25">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </main>

        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
      </div>
    </div>
  );
}