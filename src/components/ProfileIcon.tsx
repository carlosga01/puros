'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

interface ProfileIconProps {
  profile: Profile;
}

export default function ProfileIcon({ profile }: ProfileIconProps) {
  const getInitials = () => {
    const firstInitial = profile.first_name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = profile.last_name?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  return (
    <Link
      href="/profile"
      className="group relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center overflow-hidden hover:scale-110 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
    >
      {profile.avatar_url ? (
        <Image
          src={profile.avatar_url}
          alt={`${profile.first_name} ${profile.last_name}`}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs sm:text-sm font-semibold text-amber-400">
          {getInitials()}
        </span>
      )}
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full"></div>
    </Link>
  );
} 