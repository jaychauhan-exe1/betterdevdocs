"use client";

/**
 * Triggers cheerful, enthusiastic haptic vibration feedback for mobile and supported devices.
 */
export function triggerHaptic(type: "light" | "medium" | "success" | "celebrate" | "warning" = "light") {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;
  try {
    switch (type) {
      case "light":
        navigator.vibrate(10);
        break;
      case "medium":
        navigator.vibrate(22);
        break;
      case "success":
      case "celebrate":
        // Enthusiastic, rhythmic celebratory victory pattern
        navigator.vibrate([15, 30, 20, 35, 30, 50, 60]);
        break;
      case "warning":
        navigator.vibrate([25, 50, 25]);
        break;
    }
  } catch {
    // Ignore if vibration permission rejected by browser
  }
}
