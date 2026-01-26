import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Hook to automatically track visitor traffic source on page load
 * Fails silently to not disrupt user experience
 */
export function useTrafficTracking() {
  const trackVisit = trpc.trafficTracking.trackVisit.useMutation();

  useEffect(() => {
    // Only track once per session
    const hasTracked = sessionStorage.getItem("traffic_tracked");
    if (hasTracked) {
      return;
    }

    // Delay tracking to ensure page is fully loaded
    const timeoutId = setTimeout(() => {
      try {
        // Get referrer
        const referrer = document.referrer || null;

        // Parse URL parameters for UTM tracking
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get("utm_source");
        const utmMedium = urlParams.get("utm_medium");
        const utmCampaign = urlParams.get("utm_campaign");

        // Get landing page
        const landingPage = window.location.href;

        // Track the visit
        trackVisit.mutate(
          {
            referrer,
            utmSource,
            utmMedium,
            utmCampaign,
            landingPage,
          },
          {
            onSuccess: () => {
              // Mark as tracked silently
              sessionStorage.setItem("traffic_tracked", "true");
            },
            onError: () => {
              // Fail silently - tracking should not disrupt user experience
              // Mark as tracked anyway to prevent repeated failed attempts
              sessionStorage.setItem("traffic_tracked", "true");
            },
          }
        );
      } catch (error) {
        // Catch any synchronous errors and fail silently
        sessionStorage.setItem("traffic_tracked", "true");
      }
    }, 1000); // Wait 1 second after page load

    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array - only run once on mount
}
