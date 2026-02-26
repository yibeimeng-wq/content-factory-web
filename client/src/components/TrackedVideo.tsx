import { useRef } from 'react';
import { trpc } from '@/lib/trpc';

interface TrackedVideoProps {
  videoId: string;
  videoType: 'ecommerce' | 'creators' | 'kols' | 'jesus-manus';
  videoSrc: string;
}

export function TrackedVideo({ videoId, videoType, videoSrc }: TrackedVideoProps) {
  const trackVideoPlay = trpc.videoTracking.trackPlayback.useMutation();
  const hasTrackedRef = useRef(false);

  const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const overlay = e.currentTarget.nextElementSibling as HTMLElement;
    if (overlay) overlay.style.display = 'none';
    
    // Track video play (only once per session)
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      trackVideoPlay.mutate({ videoType });
    }
  };

  const handlePause = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const overlay = e.currentTarget.nextElementSibling as HTMLElement;
    if (overlay) overlay.style.display = 'flex';
  };

  const handleEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const duration = Math.floor(e.currentTarget.currentTime);
    trackVideoPlay.mutate({ 
      videoType, 
      duration, 
      completed: true 
    });
  };

  const aspectRatio = videoType === 'jesus-manus' ? '16/9' : '9/16';

  return (
    <video 
      id={videoId}
      ref={(el) => {
        if (el && !el.dataset.observed) {
          el.dataset.observed = 'true';
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  const source = el.querySelector('source');
                  if (source && source.dataset.src) {
                    source.src = source.dataset.src;
                    el.load();
                  }
                  observer.disconnect();
                }
              });
            },
            { rootMargin: '100px', threshold: 0.1 }
          );
          observer.observe(el);
        }
      }}
      className="w-full object-contain bg-black"
      style={{ aspectRatio }}
      controls
      preload="none"
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={handleEnded}
    >
      <source data-src={videoSrc} type="video/mp4" />
      您的浏览器不支持视频播放。
    </video>
  );
}
