import React, { useState, useEffect, useRef } from 'react';
import { FALLBACK_IMG, getPokemonImg, CDNS } from '../constants';

export const SafeImage = ({ 
  src, 
  alt, 
  className, 
  cdnIndex = 0, 
  pokemonId 
}: { 
  src?: string, 
  alt?: string, 
  className?: string, 
  cdnIndex?: number,
  pokemonId?: string | number
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [localCdnIndex, setLocalCdnIndex] = useState(cdnIndex);
  const attemptsRef = useRef(0);
  const lastPokemonIdRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    // Reset state if pokemonId changes
    if (pokemonId !== lastPokemonIdRef.current) {
      attemptsRef.current = 0;
      setFailed(false);
      setLocalCdnIndex(cdnIndex);
      lastPokemonIdRef.current = pokemonId;
    }

    if (failed) {
      setCurrentSrc(FALLBACK_IMG);
      return;
    }

    if (pokemonId !== undefined) {
      setCurrentSrc(getPokemonImg(pokemonId, localCdnIndex));
    } else {
      setCurrentSrc(src);
    }
  }, [src, pokemonId, localCdnIndex, failed, cdnIndex]);

  const handleError = () => {
    if (failed) return;

    if (pokemonId === undefined) {
      setFailed(true);
      setCurrentSrc(FALLBACK_IMG);
      return;
    }

    attemptsRef.current += 1;
    
    // If we've tried all CDNs, stop and show fallback
    if (attemptsRef.current >= CDNS.length) {
      setFailed(true);
      setCurrentSrc(FALLBACK_IMG);
      return;
    }

    // Try the next CDN locally
    setLocalCdnIndex((prev) => (prev + 1) % CDNS.length);
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
