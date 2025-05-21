
// Function to generate a UUID v4
export function generateUUID(): string {
  // Using the crypto API to generate a secure random UUID
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation if crypto.randomUUID is not available
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Check if a handover link has expired (6 hours validity)
export function isHandoverExpired(timestamp: string): boolean {
  const handoverTime = new Date(timestamp).getTime();
  const currentTime = new Date().getTime();
  const sixHoursInMs = 6 * 60 * 60 * 1000;
  
  return (currentTime - handoverTime) > sixHoursInMs;
}
