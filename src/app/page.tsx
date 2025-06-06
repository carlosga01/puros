import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-black to-red-900/30"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-4 sm:p-6 md:p-8">
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-amber-400">Puros</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-6 sm:space-y-8">
              {/* Company Name */}
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-none">
                  <span className="block bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    PUROS
                  </span>
                </h1>
                
                {/* Description */}
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white font-light tracking-wide">
                    Premium Cigar Community
                  </p>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 font-light max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
                    Discover exceptional cigars, share detailed reviews, and connect with fellow aficionados in the ultimate premium tobacco experience.
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center pt-6 sm:pt-8 px-4 sm:px-0">
                <Link
                  href="/signup"
                  className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full font-semibold text-black text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/25"
                >
                  <span className="relative z-10">Join the Community</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-gray-600 rounded-full font-semibold text-white text-base sm:text-lg transition-all duration-300 hover:border-amber-500 hover:text-amber-400 hover:shadow-lg hover:shadow-amber-500/10"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
      </div>
    </div>
  );
}
