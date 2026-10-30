import React, { useState } from 'react';

interface ClauseCiteLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  theme?: 'dark' | 'light' | 'mono';
}

export default function ClauseCiteLogo({
  size = 'md',
  showText = true,
  className = '',
  theme = 'light',
}: ClauseCiteLogoProps) {
  const [imgError, setImgError] = useState(false);

  const iconSizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-10 h-10 rounded-2xl',
    xl: 'w-12 h-12 rounded-2xl',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem Icon using the custom ClauseCite logo from image_59637767.png */}
      <div
        className={`${iconSizeClasses[size]} relative overflow-hidden bg-black flex items-center justify-center transition-transform hover:scale-105 shadow-xs shrink-0 border border-gray-900/10`}
      >
        {!imgError ? (
          <img
            src="/assets/aistudio/image_59637767.png"
            alt="ClauseCite Logo"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover select-none"
          />
        ) : (
          <span className="font-extrabold text-white text-sm">C</span>
        )}
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <span className={`${textSizeClasses[size]} font-extrabold tracking-tight text-gray-900`}>
            Clause<span className="text-black">Cite</span>
          </span>
          <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">
            Legal AI Suite
          </span>
        </div>
      )}
    </div>
  );
}
