import { useEffect, useRef, type RefObject } from "react";

/**
 * Attach to an element and run `handler` whenever a pointer-down lands outside
 * it — the shared "click outside to close" behavior for dropdowns/menus.
 *
 * The handler is mirrored into a ref (updated in an effect, not during render)
 * so the document listener subscribes once and still calls the latest callback.
 * Returns the ref to attach to the container element.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handlerRef.current();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return ref;
}
