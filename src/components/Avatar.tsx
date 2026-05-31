import React, { useState } from 'react';

interface AvatarProps {
  avatar: string | null | undefined;
  className?: string;
  alt?: string;
}

export default function Avatar({ avatar, className = 'h-full w-full object-cover', alt = '' }: AvatarProps) {
  const [hasFailed, setHasFailed] = useState(false);

  // Helper to generate a background color based on name string
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-rose-500 to-red-600',
      'from-amber-500 to-orange-600',
      'from-emerald-500 to-teal-600',
      'from-sky-500 to-blue-600',
      'from-indigo-500 to-violet-600',
      'from-fuchsia-500 to-pink-600',
      'from-purple-500 to-indigo-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return 'کار';
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      // Return first letter of first name and last name
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return trimmed.substring(0, 2).toUpperCase();
  };

  if (!avatar || hasFailed) {
    const initials = getInitials(alt || 'کاربر');
    const bgGradient = getAvatarColor(alt || 'کاربر');
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br ${bgGradient} text-white font-bold select-none shadow-md ${className}`}>
        {initials}
      </div>
    );
  }

  // Check if avatar is an emoji (doesn't start with http/https or data:)
  const isEmoji = !avatar.startsWith('http') && !avatar.startsWith('data:');

  if (isEmoji) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-xl select-none shadow-md ${className}`}>
        {avatar}
      </div>
    );
  }

  return (
    <img 
      src={avatar} 
      alt={alt} 
      className={className} 
      referrerPolicy="no-referrer"
      onError={() => {
        console.warn(`[Avatar] Failed to load remote image: ${avatar}, falling back to elegant initials rendering.`);
        setHasFailed(true);
      }}
    />
  );
}
