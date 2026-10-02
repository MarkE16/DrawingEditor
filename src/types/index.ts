export * from "./Canvas.types";
export * from "./History.types";
export * from "./Slices.types";

// noChange refers to the case where the canvas is redrawn but no changes were made to the elements.
export type CanvasRedrawEvent = CustomEvent<{ noChange?: boolean }>;

declare global {
	interface Window {}

	// This is so that TypeScript knows that this custom event exists globally.
	interface DocumentEventMap {
		"canvas:redraw": CanvasRedrawEvent;
	}
}
