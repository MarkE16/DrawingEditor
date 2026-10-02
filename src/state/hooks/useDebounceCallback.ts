import { useCallback, useEffect, useRef } from "react";

/**
 * Debounce a function so that it is called only after a specified delay.
 * Future calls to the function will reset a timer, preventing the function from being invoked
 * until the delay has elapsed without further calls.
 * @param callback A function to debounce.
 * @param delay The number of milliseconds to wait before invoking the callback.
 * @returns The debounced function.
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDebounceCallback<F extends (...args: any[]) => ReturnType<F>>(
	callback: F,
	delay: number
) {
	const timeout = useRef<ReturnType<typeof setTimeout>>(null);

	useEffect(() => {
		return () => {
			if (timeout.current) {
				clearTimeout(timeout.current);
			}
		};
	}, []);

	return useCallback(
		function (...args: Parameters<F>) {
			if (timeout.current) {
				clearTimeout(timeout.current);
			}
			timeout.current = setTimeout(() => {
				callback(...args);
				timeout.current = null;
			}, delay);
		},
		[callback, delay]
	);
}

export default useDebounceCallback;
