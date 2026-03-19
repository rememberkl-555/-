import React, { useState, useEffect, useRef } from 'react';
import { FALLBACK_IMG, getPokemonImg, CDNS } from '../constants';

export const SafeImage = ({ 
  src, 
  alt, 
  className, 
  cdnIndex = 0, 
  pokemonId // We keep this prop for backwards compatibility but ignore it for URL construction
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
  const lastSrcRef = useRef<string | undefined>(undefined);

  // A reliable base64 fallback image (a simple colored square/circle or text) to ensure it NEVER fails
  const RELIABLE_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23333' rx='20'/%3E%3Ctext x='50' y='50' font-family='monospace' font-size='14' fill='%23fff' text-anchor='middle' dominant-baseline='middle'%3E?%3C/text%3E%3C/svg%3E";

  useEffect(() => {
    // Reset state if the original src changes
    if (src !== lastSrcRef.current) {
      attemptsRef.current = 0;
      setFailed(false);
      setLocalCdnIndex(cdnIndex);
      lastSrcRef.current = src;
    }

    if (failed) {
      setCurrentSrc(RELIABLE_FALLBACK);
      return;
    }

    if (src) {
      // Extract the filename (e.g., "74.png" or "poke-ball.png") from the src
      const match = src.match(/\/([^\/]+\.png)$/);
      if (match && match[1]) {
        const filename = match[1];
        // If it's an official artwork, use the CDNS array
        if (src.includes('official-artwork')) {
          const baseUrl = CDNS[localCdnIndex] || CDNS[0];
          setCurrentSrc(`${baseUrl}${filename}`);
        } else if (src.includes('/items/')) {
          // Proxy item images as well
          setCurrentSrc(`/api/item-image/${filename}`);
        } else {
          // For other images, just use the original src
          setCurrentSrc(src);
        }
      } else {
        setCurrentSrc(src);
      }
    } else {
      setCurrentSrc(RELIABLE_FALLBACK);
    }
  }, [src, localCdnIndex, failed, cdnIndex]);

  const handleError = () => {
    if (failed) return;

    if (!src || !src.includes('official-artwork')) {
      setFailed(true);
      setCurrentSrc(RELIABLE_FALLBACK);
      return;
    }

    attemptsRef.current += 1;
    
    // If we've tried all CDNs, stop and show fallback
    if (attemptsRef.current >= CDNS.length) {
      setFailed(true);
      setCurrentSrc(RELIABLE_FALLBACK);
      return;
    }

    // Try the next CDN locally
    setLocalCdnIndex((prev) => (prev + 1) % CDNS.length);
  };

  return (
    <img 
      src={currentSrc || RELIABLE_FALLBACK} 
      alt={alt} 
      className={className} 
      referrerPolicy="no-referrer" 
      onError={handleError}
    />
  );
};
