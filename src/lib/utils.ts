import { v4 as uuidv4 } from "uuid";
import type { Layer, Vector } from "../types";

type CapitalizeOptions = {
	titleCase: boolean;
	delimiter: string;
};
/**
 * Capitalizes the first letter of a string and leaves the rest
 * of the string untouched.
 * @param str The string to capitalize.
 * @param options The options object.
 * @returns The capitalized string.
 *
 * @example
 * capitalize("hello, world!"); // => "Hello, world!"
 *
 * capitalize("hello, world!", { titleCase: true }); // => "Hello, World!"
 */
function capitalize(str: string, options?: CapitalizeOptions): string {
	if (!options) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	if (options.titleCase) {
		return str
			.split(options.delimiter)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(options.delimiter);
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Create a new Layer object.
 * @param name The name of the layer. Defaults to "New Layer".
 * @param id The id of the layer. Defaults to a randomly generated UUID.
 * @returns A new Layer object.
 *
 * @example
 * createLayer(); // => { name: "New Layer", id: "1234-5678-9012-3456", active: false, hidden: false }
 *
 * createLayer("Background"); // => { name: "Background", id: "1234-5678-9012-3456", active: false, hidden: false }
 *
 * createLayer("Foreground", "9876-5432-1098-7654"); // => { name: "Foreground", id: "9876-5432-1098-7654", active: false, hidden: false }
 */
function createLayer(name: string = "New Layer", id: string = uuidv4()): Layer {
	return {
		name,
		id,
		active: false,
		hidden: false
	};
}
/**
 * Swaps the position of two elements in an array. This is done by
 * selecting an element at the `from` index and moving it to the `to` index.
 * The element at the `to` index is then moved to the `from` index.
 *
 * If the `from` or `to` index is out of bounds, the original array is returned.
 * @param arr An array to perform the swap on.
 * @param from The index of the element to move.
 * @param to The new index of the moving element.
 * @returns The modified array, if indices are valid.
 */
function swapElements<T>(arr: T[], from: number, to: number): T[] {
	if (from < 0 || from >= arr.length) {
		return arr;
	}

	if (to < 0 || to >= arr.length) {
		return arr;
	}

	const elementAtTo = arr[to];
	const elementAtFrom = arr[from];

	return arr.map((element, i) => {
		if (i === from) return elementAtTo;
		if (i === to) return elementAtFrom;
		return element;
	});
}

/**
 * Navigate to a new route. This function is merely a wrapper around `window.location.href`, mainly
 * for convenience and readability.
 * @param href - The route to navigate to.
 * @returns void
 *
 * @example
 * // Assume the base URL is https://example.com/
 * navigateTo("/home"); // => https://example.com/home
 *
 * navigateTo("about"); // => https://example.com/about
 *
 * navigateTo("/nested/route"); // => https://example.com/nested/route
 *
 * navigateTo("another/nested/route"); // => https://example.com/another/nested/route
 */
function navigateTo(href: string): void {
	if (typeof window === "undefined") {
		throw new Error(`\`navigateTo\` can only be invoked in the browser.`);
	}

	let url = href;

	if (!url.startsWith("/")) {
		url = `/${url}`;
	}

	window.location.href = url;
}

/**
 * Determines whether two HTML elements are intersecting by comparing their bounding rectangles.
 * @param rect1 An HTML element.
 * @param rect2 An HTML element.
 * @returns whether the two rectangles are intersecting.
 */
function isRectIntersecting(rect1: Element, rect2: Element): boolean {
	const {
		left: r1Left,
		top: r1Top,
		bottom: r1Bottom,
		right: r1Right
	} = rect1.getBoundingClientRect();
	const {
		left: r2Left,
		top: r2Top,
		bottom: r2Bottom,
		right: r2Right
	} = rect2.getBoundingClientRect();

	return (
		r1Left < r2Right && r1Right > r2Left && r1Top < r2Bottom && r1Bottom > r2Top
	);
}

/**
 * Debounce a function by delaying its invocation by a specified number of milliseconds. If the debounced function is invoked again before the delay has elapsed, the timer is reset.
 * @param fn A function.
 * @param ms The number of milliseconds to wait before invoking the function.
 * @returns The debounced function.
 */
function debounce<T, A extends unknown[]>(
	fn: (this: T, ...args: A) => T,
	ms: number
) {
	let id: ReturnType<typeof setTimeout> | null = null;

	return function (this: T, ...args: A) {
		if (id !== null) {
			clearTimeout(id);
			id = null;
		}
		id = setTimeout(() => {
			fn.apply(this, args);
			id = null;
		}, ms);
	};
}

/**
 * Retrieves the value of a cookie by its name.
 * @param name The cookie name.
 * @returns The value of the cookie, or null if the cookie does not exist.
 */
function getCookie(name: string): string | null {
	const regexp = new RegExp(`(^| )${name}=([^;]+)`);
	const match = document.cookie.match(regexp);
	return match ? decodeURIComponent(match[2]) : null;
}

function updateVector2(vector: Vector<2>, x: number, y: number) {
	vector[0] = x;
	vector[1] = y;
}

type OperatingSystem = "Windows" | "MacOS" | "Linux";

/**
 * Detects the operating system of the user based on the user agent string.
 * @returns The operating system.
 */
function detectOperatingSystem(): OperatingSystem {
	if (typeof window === "undefined") {
		return "Windows"; // Default to Windows if not in a browser environment
	}
	const userAgent = window.navigator.userAgent.toLowerCase();

	if (userAgent.indexOf("win") !== -1) return "Windows";
	if (userAgent.indexOf("mac") !== -1) return "MacOS";
	if (userAgent.indexOf("x11") !== -1 || userAgent.indexOf("linux") !== -1)
		return "Linux";

	throw new Error(`Unsupported operating system detected: ${userAgent}`);
}

/**
 *
 * @param noChange Whether visually, nothing may have not changed.
 */
function redrawCanvas(noChange: boolean = false) {
	document.dispatchEvent(
		new CustomEvent("canvas:redraw", { detail: { noChange } })
	);
}

export {
	capitalize,
	createLayer,
	swapElements,
	navigateTo,
	isRectIntersecting,
	debounce,
	getCookie,
	updateVector2,
	detectOperatingSystem,
	redrawCanvas
};
