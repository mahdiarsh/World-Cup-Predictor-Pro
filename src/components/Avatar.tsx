import React from 'react';

interface AvatarProps {
  avatar: string | null | undefined;
  className?: string;
  alt?: string;
}

export default function Avatar({ avatar, className = 'h-full w-full object-cover', alt = '' }: AvatarProps) {
  if (!avatar) {
    return (
      <div className={`flex items-center justify-center bg-slate-800 text-sm font-sans ${className}`}>
        👤
      </div>
    );
  }

  // Check if avatar is an emoji (doesn't start with http/https or data:)
  const isEmoji = !avatar.startsWith('http') && !avatar.startsWith('data:');

  if (isEmoji) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-xl select-none ${className}`}>
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
    />
  );
}
