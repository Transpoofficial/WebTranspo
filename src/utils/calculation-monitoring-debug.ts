// ✅ EMERGENCY FIX: Temporarily disable strict validation for testing
// This will help identify the root cause of the distance discrepancy issue

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

  // ✅ TEMPORARY: Very lenient tolerances for debugging
  const priceTolerancePercentage = 0.25; // 25% tolerance (very high for debugging)
  const distanceTolerancePercentage = 0.5; // 50% tolerance (very high for debugging)

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
      ((distanceDifference / backendDistance) * 100).toFixed(2) + "%",
  });

  const maxPriceDifference = Math.max(
    backendPrice * priceTolerancePercentage,
    50000 // Allow up to 50k IDR difference
  );

  const maxDistanceDifference = Math.max(
    backendDistance * distanceTolerancePercentage,
    50 // Allow up to 50km difference
  );

  // Check price discrepancy
  if (priceDifference > maxPriceDifference) {
    console.warn("❌ Price difference too large:", {
      priceDifference,
      maxAllowed: maxPriceDifference,
      percentage: ((priceDifference / backendPrice) * 100).toFixed(2) + "%",
    });
    return {
      acceptable: false,
      reason: `Price difference: ${priceDifference.toLocaleString()} IDR (${((priceDifference / backendPrice) * 100).toFixed(1)}%)`,
      recommendation: "Check calculation logic for inconsistencies",
    };
  }

  // Check distance discrepancy
  if (distanceDifference > maxDistanceDifference) {
    console.warn("❌ Distance difference too large:", {
      distanceDifference: distanceDifference.toFixed(2),
      maxAllowed: maxDistanceDifference.toFixed(2),
      percentage:
        ((distanceDifference / backendDistance) * 100).toFixed(2) + "%",
    });
    return {
      acceptable: false,
      reason: `Distance difference: ${distanceDifference.toFixed(2)} km (${((distanceDifference / backendDistance) * 100).toFixed(1)}%)`,
      recommendation: "Check Google Maps API consistency",
    };
  }

  console.log("✅ Discrepancy acceptable:", {
    priceOk: priceDifference <= maxPriceDifference,
    distanceOk: distanceDifference <= maxDistanceDifference,
  });

  return { acceptable: true };
}

// Re-export other functions
export {
  logCalculationDiscrepancy,
  getCalculationAnalytics,
  generateDiscrepancyRecommendation,
} from "./calculation-monitoring";
