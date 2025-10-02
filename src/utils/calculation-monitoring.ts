// ✅ Price Calculation Monitoring & Analytics
// Tracks when large discrepancies occur between frontend and backend calculations

interface CalculationDiscrepancy {
  timestamp: string;
  vehicleType: string;
  frontendDistance: number;
  backendDistance: number;
  frontendPrice: number;
  backendPrice: number;
  distanceDifference: number;
  priceDifference: number;
  userAgent?: string;
  sessionId?: string;
}

interface CalculationAnalytics {
  totalCalculations: number;
  discrepancies: CalculationDiscrepancy[];
  errorRate: number;
  lastUpdated: string;
}

// In-memory storage (in production, use proper database)
const calculationLog: CalculationAnalytics = {
  totalCalculations: 0,
  discrepancies: [],
  errorRate: 0,
  lastUpdated: new Date().toISOString(),
};

/**
 * Log calculation discrepancy for monitoring
 */
export function logCalculationDiscrepancy(
  data: Omit<CalculationDiscrepancy, "timestamp">
) {
  const discrepancy: CalculationDiscrepancy = {
    ...data,
    timestamp: new Date().toISOString(),
  };

  calculationLog.totalCalculations++;
  calculationLog.discrepancies.push(discrepancy);
  calculationLog.errorRate =
    calculationLog.discrepancies.length / calculationLog.totalCalculations;
  calculationLog.lastUpdated = new Date().toISOString();

  // Log to console for debugging
  console.warn("🚨 Calculation Discrepancy Detected:", discrepancy);

  // Keep only last 100 discrepancies to prevent memory issues
  if (calculationLog.discrepancies.length > 100) {
    calculationLog.discrepancies = calculationLog.discrepancies.slice(-100);
  }

  // In production, send to monitoring service
  // sendToMonitoringService(discrepancy);
}

/**
 * Get calculation analytics
 */
export function getCalculationAnalytics(): CalculationAnalytics {
  return { ...calculationLog };
}

/**
 * Check if discrepancy is within acceptable limits
 */
export function isDiscrepancyAcceptable(
  frontendPrice: number,
  backendPrice: number,
  frontendDistance: number,
  backendDistance: number,
  vehicleType: string
): {
  acceptable: boolean;
  reason?: string;
  recommendation?: string;
} {
  const priceDifference = Math.abs(frontendPrice - backendPrice);
  const distanceDifference = Math.abs(frontendDistance - backendDistance);

  // ✅ RESTORED: Normal tolerances after fixing root cause (traffic params)
  let priceTolerancePercentage = 0.05; // 5% tolerance
  let distanceTolerancePercentage = 0.1; // 10% tolerance for distance

  // Log detailed information for debugging
  console.log("🔍 Discrepancy Analysis:", {
    vehicleType,
    frontendPrice,
    backendPrice,
    priceDifference,
    pricePercentage: ((priceDifference / backendPrice) * 100).toFixed(2) + "%",
    frontendDistance,
    backendDistance,
    distanceDifference,
    distancePercentage:
      backendDistance > 0
        ? ((distanceDifference / backendDistance) * 100).toFixed(2) + "%"
        : "N/A",
  });

  // Adjust for long distances - reasonable tolerances
  if (frontendDistance > 1000) {
    priceTolerancePercentage = 0.08; // 8% for very long distances
    distanceTolerancePercentage = 0.15; // 15% for very long distances
  } else if (frontendDistance > 500) {
    priceTolerancePercentage = 0.07; // 7% for long distances
    distanceTolerancePercentage = 0.12; // 12% for long distances
  } else if (frontendDistance > 200) {
    priceTolerancePercentage = 0.06; // 6% for medium distances
    distanceTolerancePercentage = 0.1; // 10% for medium distances
  }

  // Small tolerance increase for Hiace Premio due to high prices
  if (vehicleType.toLowerCase().includes("premio")) {
    priceTolerancePercentage += 0.02; // Add 2%
  }

  const maxPriceDifference = Math.max(
    backendPrice * priceTolerancePercentage,
    10000 // Allow at least 10k IDR difference
  );

  const maxDistanceDifference = Math.max(
    backendDistance * distanceTolerancePercentage,
    20 // Allow at least 20km difference
  );

  // Check price discrepancy
  if (priceDifference > maxPriceDifference) {
    return {
      acceptable: false,
      reason: `Price difference too large: ${priceDifference.toLocaleString()} IDR (${((priceDifference / backendPrice) * 100).toFixed(1)}%)`,
      recommendation: "Refresh page and recalculate route",
    };
  }

  // Check distance discrepancy
  if (distanceDifference > maxDistanceDifference) {
    return {
      acceptable: false,
      reason: `Distance difference too large: ${distanceDifference.toFixed(2)} km (${((distanceDifference / backendDistance) * 100).toFixed(1)}%)`,
      recommendation: "Refresh page and recalculate route",
    };
  }

  return { acceptable: true };
}

/**
 * Generate recommendation based on discrepancy pattern
 */
export function generateDiscrepancyRecommendation(
  recentDiscrepancies: CalculationDiscrepancy[]
): string {
  if (recentDiscrepancies.length === 0) {
    return "No recent discrepancies detected";
  }

  const avgDistanceDiff =
    recentDiscrepancies.reduce((sum, d) => sum + d.distanceDifference, 0) /
    recentDiscrepancies.length;
  const avgPriceDiff =
    recentDiscrepancies.reduce((sum, d) => sum + d.priceDifference, 0) /
    recentDiscrepancies.length;

  if (avgDistanceDiff > 50) {
    return "Large distance discrepancies detected. Check Google Maps API rate limits and network connectivity.";
  }

  if (avgPriceDiff > 100000) {
    return "Large price discrepancies detected. Verify pricing formulas and consider implementing progressive pricing.";
  }

  return "Minor discrepancies detected. Monitor for patterns.";
}
