import type {
	CanvasElement,
	Shape,
	CanvasState,
	Dimensions,
	Mode,
	Layer,
	Coordinates,
	HistoryAction,
	SavedCanvasProperties,
	CanvasElementType
} from "../types";

export type DrawOptions = Partial<{
	/* The specific layer to draw. */
	layerId: string;

	/* Whether to skip certain drawing options (such as positioning the canvas) */
	preview: boolean;
}>;

export type CanvasElementsStore = {
	elements: CanvasElement[];
	copiedElements: CanvasElement[];
	createElement: (
		type: CanvasElementType,
		properties?: Omit<
			Partial<CanvasElement>,
			"id" | "drawType" | "strokeWidth" | "opacity"
		>
	) => CanvasElement;
	changeElementProperties: (
		callback: (el: CanvasElement) => CanvasElement,
		predicate: (el: CanvasElement) => boolean
	) => void;
	deleteElement: (predicate: (el: CanvasElement) => boolean) => string[];
	setElements: (elements: CanvasElement[]) => void;
	copyElement: (predicate: (el: CanvasElement) => boolean) => void;
	pasteElement: () => void;
};

export type CanvasStore = CanvasState & {
	changeDimensions: (payload: Partial<Dimensions>) => void;
	changeColor: (payload: string) => void;
	changeOpacity: (payload: number) => void;
	changeMode: (payload: Mode) => void;
	changeShape: (payload: Shape) => void;
	changeShapeMode: (payload: "fill" | "stroke") => void;
	changeStrokeWidth: (payload: number) => void;
	changeDPI: (payload: number) => void;
	createLayer: (payload?: { name?: string; id?: string }) => void;
	deleteLayer: (payload: string) => void;
	toggleLayer: (payload: string) => void;
	toggleLayerVisibility: (payload: string) => void;
	moveLayerUp: (payload: string) => void;
	moveLayerDown: (payload: string) => void;
	renameLayer: (payload: { id: string; newName: string }) => void;
	removeLayer: (payload: string) => void;
	setLayers: (payload: Layer[]) => void;
	getActiveLayer: () => Layer;
	setZoom: (zoom: number) => void;
	performZoom: (clientX: number, clientY: number, factor: number) => void;
	setPosition: (payload: Partial<Coordinates>) => void;
	changeX: (payload: number) => void;
	changeY: (payload: number) => void;
	toggleReferenceWindow: () => void;
	prepareForSave: () => SavedCanvasProperties;
	prepareForExport: (ref: HTMLCanvasElement, quality?: number) => Promise<Blob>;
	drawCanvas: (
		baseCanvas: HTMLCanvasElement,
		DOMCanvas: HTMLCanvasElement,
		options?: DrawOptions
	) => void;
	getPointerPosition: (
		canvas: HTMLCanvasElement,
		clientX: number,
		clientY: number
	) => Coordinates;
	isCanvasOffscreen: (
		canvas: HTMLCanvasElement,
		dx: number,
		dy: number
	) => {
		left: boolean;
		top: boolean;
	};
	centerCanvas: (ref: HTMLCanvasElement) => void;
	drawPaperCanvas: (
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		preview?: boolean
	) => void;
	resetLayersAndElements: () => void;
};

export type HistoryStore = {
	undoStack: HistoryAction[];
	redoStack: HistoryAction[];
	pushHistory: (action: HistoryAction) => void;
	undo: () => void;
	redo: () => void;
	canUndo: () => boolean;
	canRedo: () => boolean;
	clearHistory: () => void;
};

export type SliceStores = CanvasStore & CanvasElementsStore & HistoryStore;
