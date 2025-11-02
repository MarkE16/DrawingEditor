import { v4 as uuidv4 } from "uuid";

export type CanvasState = {
	width: number;
	height: number;
	background: string;
	mode: Mode;
	shape: Shape;
	shapeMode: "fill" | "stroke";
	color: string;
	opacity: number;
	strokeWidth: number;
	layers: Layer[];
	currentLayer: number;
	scale: number;
	dpi: number;
	position: Vector<2>;
	referenceWindowEnabled: boolean;
};

export type Mode =
	| "brush"
	| "eraser"
	| "shapes"
	| "text"
	| "eye_drop"
	| "zoom_in"
	| "zoom_out"
	| "move"
	| "pan"
	| "undo"
	| "redo";

export type RectProperties = Dimensions & Coordinates;

export type Shape = "rectangle" | "circle" | "triangle";
export type Coordinates = {
	x: number;
	y: number;
};
export type Layer = {
	name: string;
	id: ReturnType<typeof uuidv4>;
	active: boolean;
	hidden: boolean;
};
export type ShapeMode = {
	name: Shape;
	icon: string;
};
export type Shapes = Shape[];
export type ToolbarMode = {
	name: Mode;
	shortcut: string;
};
export type Modes = ToolbarMode[];

export type ResizePosition = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";

export type CanvasElementType =
	| Shape
	| "text"
	| "image"
	| Extract<Mode, "brush" | "eraser">;

export type FontProperties = {
	size: number;
	family: string;
	content: string;
};

type BuildTuple<
	L extends number,
	T extends unknown[] = []
> = T["length"] extends L ? T : BuildTuple<L, [...T, T[number]]>;

export type Vector<N extends number> = BuildTuple<N, [number]>;
export type CanvasElementPath = Vector<2>;

export type CanvasElement = {
	x: number;
	y: number;
	width: number;
	height: number;
	type: CanvasElementType;
	color: string;
	id: string;
	text?: FontProperties;
	path: CanvasElementPath[];
	layerId: string;
	drawType: "fill" | "stroke";
	strokeWidth: number;
	opacity: number;
	// Inverted means if the current y coordinate is less
	// than the initial y coordinate (the coordinate when the mouse was pressed)
	inverted: boolean;
	// More properties later...
};

export type Dimensions = {
	width: number;
	height: number;
};

export type SavedCanvasProperties = {
	layers: Layer[];
	elements: Omit<CanvasElement, "focused">[];
};
