import { useEffect, useRef, useState } from 'react';

export function useVideoLazyLoad() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded) {
            // 视频进入视口，开始加载
            const source = videoElement.querySelector('source');
            if (source && source.dataset.src) {
              source.src = source.dataset.src;
              videoElement.load();
              setIsLoaded(true);
            }
          }
        });
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1,
      }
    );

    observer.observe(videoElement);

    return () => {
      observer.disconnect();
    };
  }, [isLoaded]);

  return { videoRef, isLoaded };
}
