// Bottom edge of the part of the window that isn't covered by something fixed
// to the bottom of the screen. The install bar (InstallPrompts.tsx) publishes
// its height as --mly-bottom-inset on <html> while it's showing; it's 0
// otherwise. Use this instead of window.innerHeight when checking that an
// element is fully visible or scrolling it into view.
export function viewportBottom(): number {
  const inset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--mly-bottom-inset"));
  return window.innerHeight - (Number.isFinite(inset) ? inset : 0);
}
