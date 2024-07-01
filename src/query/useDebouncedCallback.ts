import { type DependencyList, useCallback, useRef } from "react";

export default function useDebouncedCallback<
  // biome-ignore lint/suspicious/noExplicitAny: intentional
  T extends (...args: any[]) => ReturnType<T>,
>(func: T, wait?: number, deps: DependencyList = []): T {
  const timerId = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timerId.current);
      timerId.current = setTimeout(() => func(...args), wait);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [func, wait, ...deps],
  ) as T;
}
