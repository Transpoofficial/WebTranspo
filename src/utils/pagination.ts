/**
 * Helper function to extract and validate pagination parameters
 * @param url The URL to extract parameters from
 * @param defaultLimit Default number of items to return
 * @param maxLimit Maximum number of items that can be requested
 * @returns Validated skip and limit values
 */
export function getPaginationParams(
  url: string,
  defaultLimit: number = 10,
  maxLimit: number = 100
): { skip: number; limit: number } {
  const { searchParams } = new URL(url);

  // Parse skip parameter, default to 0
  const skipParam = searchParams.get("skip");
  const skip = skipParam ? parseInt(skipParam, 10) : 0;

  // Parse limit parameter, default to defaultLimit
  const limitParam = searchParams.get("limit");
  const requestedLimit = limitParam ? parseInt(limitParam, 10) : defaultLimit;

  // Ensure skip is non-negative
  const validatedSkip = Math.max(0, skip);

  // Ensure limit is between 1 and maxLimit
  const validatedLimit = Math.min(Math.max(1, requestedLimit), maxLimit);

  return {
    skip: validatedSkip,
    limit: validatedLimit,
  };
}
