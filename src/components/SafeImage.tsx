import React, { useState, useEffect } from 'react';
import { FALLBACK_IMG, getPokemonImg } from '../constants';

export const SafeImage = ({ 
  src, 
  alt, 
  className, 
  cdnIndex, 
  onCdnError,
  pokemonId 
}: { 
  src?: string, 
  alt?: string, 
  className?: string, 
  cdnIndex?: number,
  onCdnError?: () => void,
  pokemonId?: string | number
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (pokemonId !== undefined && cdnIndex !== undefined) {
      setCurrentSrc(getPokemonImg(pokemonId, cdnIndex));
    } else {
      setCurrentSrc(src);
    }
  }, [src, pokemonId, cdnIndex]);

  const handleError = () => {
    if (onCdnError) {
      onCdnError();
    } else {
      setFailed(true);
      setCurrentSrc(FALLBACK_IMG);
    }
  };

  return (
    <img 
      src={currentSrc || FALLBACK_IMG} 
      alt={alt} 
      className={className} 
      referrerPolicy="no-referrer" 
      onError={handleError}
    />
  );
};
