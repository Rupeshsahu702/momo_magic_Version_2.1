import { useState, useEffect } from 'react';

/**
 * Custom hook for robust menu image loading with retry logic and failure caching.
 * 
 * CRITICAL: This hook prevents continuous image loading errors by implementing:
 * 1. Retry mechanism - Attempts to load images up to MAX_RETRIES times
 * 2. Failure caching - Stores failed URLs in localStorage to avoid repeated attempts
 * 3. Fallback handling - Shows default image after all retries exhausted
 * 
 * DO NOT DELETE OR MODIFY without understanding the complete flow:
 * - Prevents infinite retry loops that can cause performance issues
 * - Reduces unnecessary network requests for known-bad URLs
 * - Improves user experience by quickly showing fallback for failed images
 * 
 * @param {string} imageUrl - The backend image URL to load
 * @param {string} fallbackUrl - The default/fallback image to use on failure
 * @returns {object} { imageSrc, isLoading, hasError, retryCount }
 */

// IMPORTANT: Max retry count is set to 2 for these reasons:
// 1. Allows temporary network issues a chance to resolve
// 2. Prevents infinite retry loops that waste bandwidth and CPU
// 3. Balances between user experience and performance
// DO NOT increase this value without considering the performance implications
const MAX_RETRIES = 2;

// LocalStorage key for caching failed image URLs
// This prevents the app from repeatedly trying to load images that are known to fail
// The cache persists across sessions, so users don't experience repeated load attempts
const FAILURE_CACHE_KEY = 'momo_magic_failed_images';

/**
 * Check if an image URL has previously failed to load
 * Uses localStorage to maintain a cache of failed URLs across sessions
 * 
 * @param {string} url - Image URL to check
 * @returns {boolean} True if URL has failed before
 */
const isImageCached = (url) => {
    if (!url) return false;

    try {
        const cachedFailures = JSON.parse(localStorage.getItem(FAILURE_CACHE_KEY) || '{}');
        return cachedFailures[url] === true;
    } catch (error) {
        console.error('Error reading image failure cache:', error);
        return false;
    }
};

/**
 * Cache a failed image URL to prevent future retry attempts
 * This optimization prevents wasting network requests on URLs known to fail
 * 
 * @param {string} url - Failed image URL to cache
 */
const cacheFailedImage = (url) => {
    if (!url) return;

    try {
        const cachedFailures = JSON.parse(localStorage.getItem(FAILURE_CACHE_KEY) || '{}');
        cachedFailures[url] = true;
        localStorage.setItem(FAILURE_CACHE_KEY, JSON.stringify(cachedFailures));
    } catch (error) {
        console.error('Error caching failed image:', error);
    }
};

/**
 * Clear the failure cache (useful for admin actions or debugging)
 * Call this when images are updated on the backend to give them another chance
 */
export const clearImageFailureCache = () => {
    try {
        localStorage.removeItem(FAILURE_CACHE_KEY);
    } catch (error) {
        console.error('Error clearing image failure cache:', error);
    }
};

const useMenuImage = (imageUrl, fallbackUrl = '/images/special_dishes.png') => {
    const [imageSrc, setImageSrc] = useState(fallbackUrl);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        // If no image URL provided, use fallback immediately
        if (!imageUrl) {
            setImageSrc(fallbackUrl);
            setIsLoading(false);
            setHasError(true);
            return;
        }

        // OPTIMIZATION: Check if this URL has failed before
        // If it's in the failure cache, skip directly to fallback
        // This prevents wasting time and bandwidth on known-bad URLs
        if (isImageCached(imageUrl)) {
            setImageSrc(fallbackUrl);
            setIsLoading(false);
            setHasError(true);
            return;
        }

        // Reset state when URL changes
        setIsLoading(true);
        setHasError(false);
        setRetryCount(0);

        // Create a new image object to test loading
        const img = new Image();

        // SUCCESS: Image loaded successfully
        const handleLoad = () => {
            setImageSrc(imageUrl);
            setIsLoading(false);
            setHasError(false);
        };

        // FAILURE: Image failed to load
        const handleError = () => {
            // RETRY LOGIC: If we haven't exceeded max retries, try again
            if (retryCount < MAX_RETRIES) {
                setRetryCount(prev => prev + 1);
                // Small delay before retry to handle temporary network issues
                setTimeout(() => {
                    img.src = imageUrl; // Trigger reload
                }, 300);
            } else {
                // FALLBACK: All retries exhausted
                // 1. Use the fallback image
                setImageSrc(fallbackUrl);
                setIsLoading(false);
                setHasError(true);

                // 2. Cache this failure to prevent future retry attempts
                // This is CRITICAL for performance - without it, every render
                // would attempt to load the image again, causing network spam
                cacheFailedImage(imageUrl);
            }
        };

        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);
        img.src = imageUrl;

        // Cleanup event listeners
        return () => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
        };
    }, [imageUrl, fallbackUrl, retryCount]);

    return { imageSrc, isLoading, hasError, retryCount };
};

export default useMenuImage;
