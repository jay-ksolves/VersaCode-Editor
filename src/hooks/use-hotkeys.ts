import { useEffect } from 'react';

type HotkeyCallback = (event: KeyboardEvent) => void;

export function useHotkeys(
  hotkey: string,
  callback: HotkeyCallback,
  deps: any[] = []
) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const [keys, ...modifiers] = hotkey.split('+').reverse();
      const key = keys.toLowerCase();
      
      const requiredModifiers = {
        ctrl: modifiers.includes('ctrl'),
        alt: modifiers.includes('alt'),
        shift: modifiers.includes('shift'),
        meta: modifiers.includes('cmd'),
      };
      
      if (
        event.key.toLowerCase() === key &&
        event.ctrlKey === requiredModifiers.ctrl &&
        event.altKey === requiredModifiers.alt &&
        event.shiftKey === requiredModifiers.shift &&
        event.metaKey === requiredModifiers.meta
      ) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [hotkey, ...deps]);
}
