"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Extend Window interface for analytics
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

interface WebVitalsProps {
  debug?: boolean;
}

export default function WebVitals({ debug = false }: WebVitalsProps) {
  const pathname = usePathname();
  useEffect(() => {
    // Import web-vitals dynamically
    import("web-vitals").then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      function sendToAnalytics(metric: {
        name: string;
        id: string;
        value: number;
      }) {
        if (debug) {
          console.log("Web Vitals:", metric);
        } // Send to Google Analytics
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", metric.name, {
            event_category: "Web Vitals",
            event_label: metric.id,
            value: Math.round(
              metric.name === "CLS" ? metric.value * 1000 : metric.value
            ),
            non_interaction: true,
          });
        }

        // Send to custom analytics endpoint if needed
        if (process.env.NODE_ENV === "production") {
          fetch("/api/analytics/web-vitals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              metric: metric.name,
              value: metric.value,
              id: metric.id,
              path: pathname,
              timestamp: Date.now(),
            }),
          }).catch(console.error);
        }
      }

      // Measure Core Web Vitals using correct API
      onCLS(sendToAnalytics);
      onINP(sendToAnalytics); // onINP replaces onFID in v5
      onFCP(sendToAnalytics);
      onLCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
    });
  }, [pathname, debug]);

  return null;
}

// Performance observer for monitoring
export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    // Monitor Long Tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn("Long task detected:", {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            }); // Send to analytics
            if (typeof window !== "undefined" && window.gtag) {
              window.gtag("event", "long_task", {
                event_category: "Performance",
                event_label: "Long Task",
                value: Math.round(entry.duration),
              });
            }
          }
        }
      });

      longTaskObserver.observe({ entryTypes: ["longtask"] });

      return () => {
        longTaskObserver.disconnect();
      };
    } catch {
      console.warn("PerformanceObserver not supported for longtask");
    }
  }, []);
}

// Hook for tracking page load performance
export function usePageLoadTracking() {
  const pathname = usePathname();

  useEffect(() => {
    const startTime = performance.now();

    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "page_load_time", {
          event_category: "Performance",
          event_label: pathname,
          value: Math.round(loadTime),
        });
      }
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, [pathname]);
}
