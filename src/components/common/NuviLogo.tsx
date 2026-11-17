import React from 'react';

interface NuviLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  isLight?: boolean;
  className?: string;
}

export const NuviLogo: React.FC<NuviLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  isLight = false,
  className = '',
}) => {
  const heights = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-13',
    lg: 'h-16 sm:h-18',
    xl: 'h-24',
  };

  return (
    <div 
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
    >
      {/* Imagem Oficial Logo Nuvi em Tons Azuis com Fundo Transparente */}
      <div className="relative shrink-0 flex items-center">
        <img
          src={isLight ? '/logo_blue.png' : '/logo_blue_dark.png'}
          alt="NUVI SaaS"
          className={`${heights[size]} w-auto object-contain filter drop-shadow-sm`}
        />
      </div>

      {showSubtitle && (
        <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500">
          SaaS
        </span>
      )}
    </div>
  );
};
