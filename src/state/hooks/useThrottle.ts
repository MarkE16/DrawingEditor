import { useCallback, useRef } from "react";

/**
 * Throttle a function to limit its execution rate.
 * @param fn The function to throttle.
 * @param delay The delay in milliseconds between calls.
 * Default is 1000 milliseconds (1 second).
 * @returns The throttled function.
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
function useThrottle<F extends (...args: any[]) => ReturnType<F>>(
	fn: F,
	delay: number = 1000
) {
	const lastNow = useRef<number>(Date.now());

	return useCallback(
		function (...args: Parameters<F>) {
			const now = Date.now();
			if (now - lastNow.current >= delay) {
				lastNow.current = now;
				return fn(...args);
			}
		},
		[fn, delay]
	);
}

export default useThrottle;
