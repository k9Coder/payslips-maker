import * as React from 'react';
import type { ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 3000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

type State = {
  toasts: ToasterToast[];
};

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };
let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

function dispatch(action: { type: 'ADD_TOAST'; toast: ToasterToast } | { type: 'DISMISS_TOAST'; toastId?: string }) {
  if (action.type === 'ADD_TOAST') {
    memoryState = {
      toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
    };
  } else if (action.type === 'DISMISS_TOAST') {
    memoryState = {
      toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
    };
  }
  listeners.forEach((listener) => listener(memoryState));
}

export function toast({ title, description, variant }: { title?: string; description?: string; variant?: 'default' | 'destructive' }) {
  const id = genId();
  dispatch({ type: 'ADD_TOAST', toast: { id, title, description, variant } });

  setTimeout(() => {
    dispatch({ type: 'DISMISS_TOAST', toastId: id });
  }, TOAST_REMOVE_DELAY);
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return { toasts: state.toasts, toast };
}
