import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Hook to automatically track visitor traffic source on page load
 */
export function useTrafficTracking() {
  const trackVisit = trpc.trafficTracking.trackVisit.useMutation();

  useEffect(() => {
    // Only track once per session
    const hasTracked = sessionStorage.getItem("traffic_tracked");
    if (hasTracked) {
      return;
    }

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
        onSuccess: (data) => {
          console.log("[Traffic Tracking] Visit tracked:", data.sourceType);
          sessionStorage.setItem("traffic_tracked", "true");
        },
        onError: (error) => {
          console.error("[Traffic Tracking] Failed to track visit:", error);
        },
      }
    );
  }, [trackVisit]);
}
