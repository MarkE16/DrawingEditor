import type { PropsWithChildren, ReactNode } from "react";
import type {
	RenderOptions,
	RenderResult,
	RenderHookResult,
	RenderHookOptions
} from "@testing-library/react";
import { beforeAll, afterAll, vi } from "vitest";
import type { SliceStores } from "@/types";
import type { Store } from "@/state/store";
import { render, renderHook } from "@testing-library/react";
import { StoreProvider } from "@/components/StoreContext/StoreContext";

import { initializeEditorStore } from "@/state/store";
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider";

type ExtendedRenderOptions = Omit<RenderOptions, "queries"> & {
	preloadedState?: Partial<SliceStores>;
	store?: Store;
};

type ExtendedRenderHookOptions<P> = Omit<RenderHookOptions<P>, "wrapper"> & {
	preloadedState?: Partial<SliceStores>;
	store?: Store;
};

/**
 * Renders a React component with a Zustand store and other providers. This function
 * should only be used for testing purposes.
 * @param ui A React component to render.
 * @param obj An object containing optional preloadedState, store, and other render options.
 * @returns Render options returned by React Testing Library.
 */
export function renderWithProviders(
	ui: ReactNode,
	{
		preloadedState = {},
		store = initializeEditorStore(preloadedState),
		...renderOptions
	}: ExtendedRenderOptions = {}
): RenderResult {
	const Wrapper = ({ children }: PropsWithChildren) => (
		<ThemeProvider>
			<StoreProvider store={store}>{children}</StoreProvider>
		</ThemeProvider>
	);

	return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Renders a React hook with a Zustand store and other providers. This function should only be used for testing purposes.
 * @param hook A React hook. This should commonly be a custom hook.
 * @param obj An object containing optional preloadedState, store, and other render options.
 * @returns Render options returned by React Testing Library.
 */
export function renderHookWithProviders<Result, Props>(
	hook: (props: Props) => Result,
	{
		preloadedState = {},
		store = initializeEditorStore(preloadedState),
		...renderOptions
	}: ExtendedRenderHookOptions<Props> = {}
): RenderHookResult<Result, Props> {
	const Wrapper = ({ children }: PropsWithChildren) => (
		<ThemeProvider>
			<StoreProvider store={store}>{children}</StoreProvider>
		</ThemeProvider>
	);

	return renderHook(hook, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Below is to get testing working around headless UIs such as Radix.
 * https://www.luisball.com/blog/using-radixui-with-react-testing-library
 */

/**
 * JSDOM does not support all the APIs that we need for testing
 * (see here: https://github.com/jsdom/jsdom/issues/2527).
 *
 * In this setup file, we mock the missing Browser APIs:
 * - PointerEvent
 * - ResizeObserver
 * - DOMRect
 * - HTMLElement.prototype.scrollIntoView
 * - HTMLElement.prototype.hasPointerCapture
 * - HTMLElement.prototype.releasePointerCapture
 *
 * This allows us to test components that rely on these APIs. The mocked APIs
 * are removed after all tests have run.
 */

function installMouseEvent() {
	beforeAll(() => {
		const oldMouseEvent = MouseEvent;
		// @ts-ignore
		global.MouseEvent = class FakeMouseEvent extends MouseEvent {
			_init: { pageX: number; pageY: number };
			constructor(name: string, init: { pageX: number; pageY: number }) {
				// @ts-ignore
				super(name, init);
				this._init = init;
			}
			get pageX() {
				return this._init.pageX;
			}
			get pageY() {
				return this._init.pageY;
			}
		};
		// @ts-ignore
		global.MouseEvent.oldMouseEvent = oldMouseEvent;
	});

	afterAll(() => {
		// @ts-ignore
		global.MouseEvent = global.MouseEvent.oldMouseEvent;
	});
}

function installPointerEvent() {
	beforeAll(() => {
		// @ts-ignore
		global.PointerEvent = class FakePointerEvent extends MouseEvent {
			_init: {
				pageX: number;
				pageY: number;
				pointerType: string;
				pointerId: number;
				width: number;
				height: number;
			};
			constructor(
				name: string,
				init: {
					pageX: number;
					pageY: number;
					pointerType: string;
					pointerId: number;
					width: number;
					height: number;
				}
			) {
				// @ts-ignore
				super(name, init);
				this._init = init;
			}
			get pointerType() {
				return this._init.pointerType;
			}
			get pointerId() {
				return this._init.pointerId;
			}
			get pageX() {
				return this._init.pageX;
			}
			get pageY() {
				return this._init.pageY;
			}
			get width() {
				return this._init.width;
			}
			get height() {
				return this._init.height;
			}
		};
	});

	afterAll(() => {
		// @ts-ignore
		delete global.PointerEvent;
	});
}

function installResizeObserver() {
	beforeAll(() => {
		const oldResizeObserver = global.ResizeObserver;
		// @ts-ignore
		global.ResizeObserver = class FakeResizeObserver {
			cb: any;
			constructor(cb: any) {
				this.cb = cb;
			}
			observe() {
				this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }]);
			}
			unobserve() {}
			disconnect() {}
			oldResizeObserver: any;
		};
		// @ts-ignore
		global.ResizeObserver.oldResizeObserver = oldResizeObserver;
	});

	afterAll(() => {
		// @ts-ignore
		global.ResizeObserver = global.ResizeObserver.oldResizeObserver;
	});
}

function installDOMRect() {
	beforeAll(() => {
		const oldDOMRect = DOMRect;
		// @ts-ignore
		global.DOMRect = class FakeDOMRect {
			static fromRect() {
				return {
					top: 0,
					left: 0,
					bottom: 0,
					right: 0,
					width: 0,
					height: 0
				};
			}
			oldDOMRect: any;
		};
		// @ts-ignore
		global.DOMRect.oldDOMRect = oldDOMRect;
	});

	afterAll(() => {
		// @ts-ignore
		global.DOMRect = global.DOMRect.oldDOMRect;
	});
}

function installScrollIntoView() {
	beforeAll(() => {
		const oldScrollIntoView = HTMLElement.prototype.scrollIntoView;
		HTMLElement.prototype.scrollIntoView = function () {
			// Mock implementation
		};
		// @ts-ignore
		HTMLElement.prototype.scrollIntoView.oldScrollIntoView = oldScrollIntoView;
	});

	afterAll(() => {
		HTMLElement.prototype.scrollIntoView =
			// @ts-ignore
			HTMLElement.prototype.scrollIntoView.oldScrollIntoView;
	});
}

function installHasPointerCapture() {
	beforeAll(() => {
		const oldHasPointerCapture = HTMLElement.prototype.hasPointerCapture;
		HTMLElement.prototype.hasPointerCapture = function () {
			// Mock implementation
			return true;
		};
		// @ts-ignore
		HTMLElement.prototype.hasPointerCapture.oldHasPointerCapture =
			oldHasPointerCapture;
	});

	afterAll(() => {
		HTMLElement.prototype.hasPointerCapture =
			// @ts-ignore
			HTMLElement.prototype.hasPointerCapture.oldHasPointerCapture;
	});
}

function installReleasePointerCapture() {
	beforeAll(() => {
		const oldReleasePointerCapture =
			HTMLElement.prototype.releasePointerCapture;
		HTMLElement.prototype.releasePointerCapture = function () {
			// Mock implementation
		};
		// @ts-ignore
		HTMLElement.prototype.releasePointerCapture.oldReleasePointerCapture =
			oldReleasePointerCapture;
	});

	afterAll(() => {
		HTMLElement.prototype.releasePointerCapture =
			// @ts-ignore
			HTMLElement.prototype.releasePointerCapture.oldReleasePointerCapture;
	});
}

/**
 * Initialize missing Browser APIs
 * to properly test headless UIs.
 */
export function eventSetup() {
	installMouseEvent();
	installPointerEvent();
	installResizeObserver();
	installDOMRect();
	installScrollIntoView();
	installHasPointerCapture();
	installReleasePointerCapture();
}

export function mockURLInterface() {
	const originalCreateObjectURL = URL.createObjectURL;
	const originalRevokeObjectURL = URL.revokeObjectURL;

	beforeAll(() => {
		URL.createObjectURL = vi.fn().mockReturnValue("blob://localhost:3000/1234");
		URL.revokeObjectURL = vi.fn();
	});

	afterAll(() => {
		URL.createObjectURL = originalCreateObjectURL;
		URL.revokeObjectURL = originalRevokeObjectURL;
	});
}
