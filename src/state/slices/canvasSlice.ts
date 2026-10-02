import type { StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
	Mode,
	Layer,
	Coordinates,
	Dimensions,
	CanvasStore,
	SavedCanvasProperties,
	Shape,
	SliceStores,
	DrawOptions,
	CanvasElement
} from "@/types";
import * as Utils from "@/lib/utils";
import ImageElementStore from "../stores/ImageElementStore";

export const createCanvasSlice: StateCreator<
	SliceStores,
	[],
	[],
	CanvasStore
> = (set, get) => {
	function changeDimensions(payload: Partial<Dimensions>) {
		set((state) => ({
			width: payload.width ?? state.width,
			height: payload.height ?? state.height
		}));
	}

	function changeColor(payload: string) {
		set({ color: payload });
	}

	function changeOpacity(payload: number) {
		set({
			opacity: Math.max(Math.min(payload, 1), 0)
		});
	}

	function changeMode(payload: Mode) {
		set({ mode: payload });
	}

	function changeShape(payload: Shape) {
		set({ shape: payload });
	}

	function changeShapeMode(payload: "fill" | "stroke") {
		set({ shapeMode: payload });
	}

	function changeStrokeWidth(payload: number) {
		set({ strokeWidth: Math.max(Math.min(payload, 100), 1) });
	}

	function changeDPI(payload: number) {
		set({ dpi: payload });
	}

	function createLayer(payload?: { name?: string; id?: string }) {
		const layer = Utils.createLayer(payload?.name, payload?.id);

		set((state) => ({
			layers: [...state.layers, layer]
		}));
	}

	function deleteLayer(payload: string) {
		set((state) => ({
			layers: state.layers.filter((layer) => layer.id !== payload)
		}));
	}

	function toggleLayer(payload: string) {
		const layers = get().layers;
		let nextActiveLayerIndex = 0;
		const newLayers = layers.map((layer, i) => {
			if (layer.id === payload) {
				nextActiveLayerIndex = i;
			}
			return {
				...layer,
				active: layer.id === payload
			};
		});

		set({ layers: newLayers, currentLayer: nextActiveLayerIndex });
	}

	function toggleLayerVisibility(payload: string) {
		const layers = get().layers;
		const newLayers = layers.map((layer) => {
			if (layer.id === payload) {
				layer.hidden = !layer.hidden;
			}
			return layer;
		});
		set({ layers: newLayers });
	}

	function moveLayerUp(payload: string) {
		const layers = get().layers;
		const index = layers.findIndex((layer) => layer.id === payload);
		const newLayers = Utils.swapElements(layers, index, index - 1);

		set({ layers: newLayers });
	}

	function moveLayerDown(payload: string) {
		const layers = get().layers;
		const index = layers.findIndex((layer) => layer.id === payload);
		const newLayers = Utils.swapElements(layers, index, index + 1);

		set({ layers: newLayers });
	}

	function renameLayer(payload: { id: string; newName: string }) {
		const layers = get().layers;
		const newLayers = layers.map((layer) => {
			if (layer.id === payload.id) {
				layer.name = payload.newName;
			}
			return layer;
		});

		set({ layers: newLayers });
	}

	function removeLayer(payload: string) {
		set((state) => {
			if (state.layers.length === 1) {
				return state;
			}

			let activeLayerIndex = 0;
			const pendingLayer = state.layers.find((layer, i) => {
				if (layer.id === payload) {
					activeLayerIndex = i;
				}
				return layer.id === payload;
			})!;
			const newLayers = state.layers.filter(
				(layer) => layer.id !== pendingLayer.id
			);
			if (pendingLayer.active) {
				newLayers[0].active = true;
				activeLayerIndex = 0;
			}

			return { layers: newLayers, currentLayer: activeLayerIndex };
		});
	}

	function setLayers(payload: Layer[]) {
		set({ layers: payload });
	}

	function getActiveLayer(): Layer {
		const { layers, currentLayer } = get();
		if (layers.length === 0) {
			throw new Error("No layers available to get the active layer.");
		}

		return layers[currentLayer];
	}

	function setZoom(zoom: number) {
		set({
			scale: zoom
		});
	}

	function performZoom(clientX: number, clientY: number, factor: number) {
		const {
			position: [posX, posY],
			scale
		} = get();
		const localX = clientX;
		const localY = clientY;

		const newScale = scale + factor * -0.01;

		const newX = localX - (localX - posX) * (newScale / scale);
		const newY = localY - (localY - posY) * (newScale / scale);

		set({
			scale: Math.min(Math.max(newScale, 0.1), 3),
			position: [newX, newY]
		});
	}

	function setPosition(payload: Partial<Coordinates>) {
		set((state) => ({
			position: [payload.x ?? state.position[0], payload.y ?? state.position[1]]
		}));
	}

	function changeX(payload: number) {
		set((state) => ({
			position: [state.position[0] + payload, state.position[1]]
		}));
	}

	function changeY(payload: number) {
		set((state) => ({
			position: [state.position[0], state.position[1] + payload]
		}));
	}

	/**
	 * A function that prepares the canvas for saving
	 * by converting the canvas elements to blobs. Note
	 * that the elements are also saved, but they are
	 * processed internally, so they are not needed as
	 * an argument.
	 * @param layerRefs The array of layer references
	 * @returns A promise that resolves to the saved
	 * canvas properties. They are returned because the
	 * function does not have access to the useIndexed
	 * custom hook that is used to save the layers and
	 * elements. Therefore, the caller must save the
	 * layers and elements themselves.
	 */
	function prepareForSave(): SavedCanvasProperties {
		const { layers, elements } = get();

		return { layers, elements };
	}

	/**
	 * A helper function that returns an array of lines of the given text that fit within the given width.
	 * @param text The text to split into lines.
	 * @param width The width of the text container.
	 * @param ctx The 2D context of the canvas.
	 */
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
	function generateTextLines(
		text: string,
		width: number,
		ctx: CanvasRenderingContext2D
	): string[] {
		const lines: string[] = [];
		let charsLeft = text;

		while (charsLeft.length > 0) {
			let splitIndex = charsLeft.length;

			// Find the index to split the word at.
			while (
				ctx.measureText(charsLeft.slice(0, splitIndex)).width > width &&
				splitIndex > 0
			) {
				splitIndex--;
			}

			// Require one character.
			if (splitIndex === 0) {
				splitIndex = 1;
			}

			const splitWord = charsLeft.slice(0, splitIndex);

			// "Super long words" can contain new lines,
			// which can disrupt the word wrapping logic.
			// Therefore, we need to account for new lines.
			const hasNewLine = splitWord.indexOf("\n");

			if (hasNewLine !== -1) {
				lines.push(splitWord.slice(0, hasNewLine));
				charsLeft = charsLeft.slice(hasNewLine + 1);
			} else {
				lines.push(splitWord);
				charsLeft = charsLeft.slice(splitIndex);
			}
		}
		return lines;
	}

	function prepareForExport(
		ref: HTMLCanvasElement,
		quality: number = 1
	): Promise<Blob> {
		const { width, height } = get();
		const substituteCanvas = document.createElement("canvas");

		substituteCanvas.width = width;
		substituteCanvas.height = height;

		const ctx = substituteCanvas.getContext("2d");
		if (!ctx) {
			throw new Error(
				"Failed to get 2D context from canvas when attempting to export."
			);
		}

		drawCanvas(substituteCanvas, ref, { preview: true });

		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				substituteCanvas.toBlob(
					(blob) => {
						if (!blob)
							throw new Error("Failed to extract blob when exporting.");
						resolve(blob);
					},
					"image/png",
					quality
				);
			});
		});
	}

	function toggleReferenceWindow() {
		set((state) => ({
			referenceWindowEnabled: !state.referenceWindowEnabled
		}));
	}

	function getPointerPosition(
		canvas: HTMLCanvasElement,
		clientX: number,
		clientY: number
	): Coordinates {
		const {
			position: [posX, posY],
			scale
		} = get();
		const rect = canvas.getBoundingClientRect();
		const x = (clientX - rect.left - posX) / scale;
		const y = (clientY - rect.top - posY) / scale;

		return { x, y };
	}

	function isCanvasOffscreen(
		canvas: HTMLCanvasElement,
		dx: number,
		dy: number
	): {
		left: boolean;
		top: boolean;
	} {
		const { width: canvasWidth, height: canvasHeight, position, scale } = get();
		const [posX, posY] = position;

		const rect = canvas.getBoundingClientRect();

		const viewportWidth = rect.width;
		const viewportHeight = rect.height;

		const newX = posX + dx;
		const newY = posY + dy;

		const leftX = newX + (viewportWidth / 2 - (canvasWidth * scale) / 2);
		const topY = newY + (viewportHeight / 2 - (canvasHeight * scale) / 2);
		const rightX = leftX + canvasWidth * scale;
		const bottomY = topY + canvasHeight * scale;

		const minVisibleArea = 20;

		return {
			left: rightX < minVisibleArea || leftX > viewportWidth - minVisibleArea,
			top: bottomY < minVisibleArea || topY > viewportHeight - minVisibleArea
		};
	}

	function centerCanvas(ref: HTMLCanvasElement) {
		const { width: canvasWidth, height: canvasHeight } = get();
		const rect = ref.getBoundingClientRect();

		const viewportWidth = rect.width;
		const viewportHeight = rect.height;

		const posX = viewportWidth / 2 - canvasWidth / 2;
		const posY = viewportHeight / 2 - canvasHeight / 2;
		set({
			position: [posX, posY]
		});
	}

	function drawPaperCanvas(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		preview: boolean = false
	) {
		const { width, height, background } = get();
		ctx.beginPath();
		ctx.rect(x, y, width, height);
		ctx.globalCompositeOperation = "destination-over";
		ctx.globalAlpha = 1;

		if (background === "transparent" && !preview) {
			// If the background is transparent, fill with a checkerboard pattern.
			const pattern = document.createElement("canvas");
			const pctx = pattern.getContext("2d");
			if (!pctx) {
				throw new Error("Failed to get 2D context for pattern.");
			}
			pattern.width = 20;
			pattern.height = 20;
			pctx.fillStyle = "#ccc";
			pctx.fillRect(0, 0, 20, 20);
			pctx.fillStyle = "#fff";
			pctx.fillRect(0, 0, 10, 10);
			pctx.fillRect(10, 10, 10, 10);
			const checkerPattern = ctx.createPattern(pattern, "repeat");
			if (checkerPattern) {
				ctx.fillStyle = checkerPattern;
			} else {
				ctx.fillStyle = "#fff"; // Fallback to white if pattern creation fails
			}
		} else {
			ctx.fillStyle = background;
		}
		ctx.fill();
		ctx.globalCompositeOperation = "source-over";
	}

	/**
	 *
	 * @param baseCanvas An HTMLCanvasElement to apply the drawing operations on.
	 * @param DOMCanvas The HTMLCanvasElement that is in the DOM. Use the `useCanvasRef` hook
	 * to get access to the DOM node if you do not have easy access to it.
	 * @param options Addtional drawing options.
	 */
	function drawCanvas(
		baseCanvas: HTMLCanvasElement,
		DOMCanvas: HTMLCanvasElement,
		options?: DrawOptions
	) {
		const {
			mode,
			elements,
			layers,
			width: canvasWidth,
			height: canvasHeight,
			position: [posX, posY],
			scale,
			opacity,
			strokeWidth,
			color
		} = get();

		if (layers.length === 0) {
			throw new Error("No layers available to draw on the canvas.");
		}

		const ctx = baseCanvas.getContext("2d");
		if (!ctx) {
			throw new Error("Failed to get 2D context from canvas when drawing.");
		}

		const visibilityMap = new Map<string, boolean>();
		const positionMap = new Map<string, number>();

		for (let i = 0; i < layers.length; i++) {
			const layer = layers[i];
			visibilityMap.set(layer.id, layer.hidden);
			positionMap.set(layer.id, layers.length - 1 - i);
		}
		// Create a deep copy of the elements.
		let copyElements = JSON.parse(JSON.stringify(elements)) as CanvasElement[];
		copyElements = copyElements.filter((element) => {
			if (options?.layerId) {
				return element.layerId === options.layerId;
			}
			return !visibilityMap.get(element.layerId);
		});

		copyElements.sort((a, b) => {
			const aPosition = positionMap.get(a.layerId) ?? 0;
			const bPosition = positionMap.get(b.layerId) ?? 0;
			return aPosition - bPosition;
		});

		ctx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);

		if (!options?.preview) {
			const rect = DOMCanvas.getBoundingClientRect();

			baseCanvas.width = rect.width;
			baseCanvas.height = rect.height;

			ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any existing transforms

			// Apply scaling and translation for panning and zooming.
			ctx.setTransform(scale, 0, 0, scale, posX, posY);

			ctx.save();

			ctx.beginPath();
			ctx.rect(0, 0, canvasWidth, canvasHeight);
			// Clip to the canvas area so that drawings outside the canvas are not visible.
			ctx.clip();
		} else {
			// Scale the canvas down so that all the elements fit inside of it.
			ctx.save();

			const scaleX = baseCanvas.width / canvasWidth;
			const scaleY = baseCanvas.height / canvasHeight;

			ctx.scale(scaleX, scaleY);
		}

		for (const element of copyElements) {
			const { width, height, x, y } = element;

			ctx.fillStyle = element.color;
			ctx.lineWidth = element.strokeWidth;
			ctx.lineCap = "round";
			ctx.globalAlpha = element.opacity;
			ctx.strokeStyle = element.color;
			ctx.globalCompositeOperation =
				element.type === "eraser" ? "destination-out" : "source-over";

			switch (element.type) {
				case "brush":
				case "eraser": {
					ctx.beginPath();
					for (let i = 0; i < element.path.length; i++) {
						const point = element.path[i];
						const x = point[0];
						const y = point[1];
						if (i === 0) {
							ctx.moveTo(x, y);
						} else {
							const lastPoint = element.path[i - 1];
							const lastX = lastPoint[0];
							const lastY = lastPoint[1];
							// Add a quadratic curve for smoother lines
							const midX = (lastX + x) / 2;
							const midY = (lastY + y) / 2;
							ctx.quadraticCurveTo(lastX, lastY, midX, midY);
						}
					}
					ctx.stroke();
					break;
				}
				case "circle": {
					ctx.beginPath();
					ctx.ellipse(
						x + width / 2,
						y + height / 2,
						width / 2,
						height / 2,
						0,
						0,
						2 * Math.PI
					);
					ctx.closePath();
					if (element.drawType === "fill") {
						ctx.fill();
					} else {
						ctx.stroke();
					}
					break;
				}
				case "rectangle": {
					if (element.drawType === "fill") {
						ctx.fillRect(x, y, width, height);
					} else {
						ctx.strokeRect(x, y, width, height);
					}
					break;
				}

				case "triangle": {
					ctx.beginPath();
					if (element.inverted) {
						ctx.moveTo(x + width / 2, y + height);
						ctx.lineTo(x + width, y);
						ctx.lineTo(x, y);
					} else {
						ctx.moveTo(x + width / 2, y);
						ctx.lineTo(x + width, y + height);
						ctx.lineTo(x, y + height);
					}
					ctx.closePath();

					if (element.drawType === "fill") {
						ctx.fill();
					} else {
						ctx.stroke();
					}
					break;
				}
				case "image": {
					const img = ImageElementStore.getImage(element.id);
					if (!img) {
						console.error(
							"Tried to render an image element of id " +
								element.id +
								", but no image existed in the ImageElementStore."
						);
					} else {
						ctx.drawImage(img, x, y, width, height);
					}
				}
			}
		}

		// Finally, draw the paper canvas (background)
		drawPaperCanvas(ctx, 0, 0, options?.preview);

		ctx.restore();

		// After drawing everything, reset the styles back to the current settings
		// if not in preview mode. This is for the main canvas where the user draws,
		// and we want to keep style settings persistent.
		if (!options?.preview) {
			ctx.globalAlpha = opacity;
			ctx.strokeStyle = color;
			ctx.fillStyle = color;
			ctx.lineWidth = strokeWidth;
			ctx.globalCompositeOperation =
				mode === "eraser" ? "destination-out" : "source-over";
			ctx.lineCap = "round";
		}
	}

	function resetLayersAndElements() {
		set({
			layers: [{ name: "Layer 1", id: uuidv4(), active: true, hidden: false }],
			elements: []
		});
	}

	return {
		width: 400,
		height: 400,
		mode: "move",
		background: "#ffffff",
		shape: "rectangle",
		shapeMode: "fill",
		color: "#000000",
		opacity: 1,
		strokeWidth: 5,
		layers: [{ name: "Layer 1", id: uuidv4(), active: true, hidden: false }],
		currentLayer: 0,
		scale: 1,
		dpi: 1,
		position: [0, 0], // => [x, y]
		referenceWindowEnabled: false,
		changeDimensions,
		changeColor,
		changeOpacity,
		changeMode,
		changeShape,
		changeShapeMode,
		changeStrokeWidth,
		changeDPI,
		createLayer,
		deleteLayer,
		toggleLayer,
		toggleLayerVisibility,
		moveLayerUp,
		moveLayerDown,
		renameLayer,
		removeLayer,
		setLayers,
		getActiveLayer,
		setZoom,
		performZoom,
		setPosition,
		changeX,
		changeY,
		prepareForSave,
		prepareForExport,
		toggleReferenceWindow,
		getPointerPosition,
		isCanvasOffscreen,
		centerCanvas,
		drawPaperCanvas,
		drawCanvas,
		resetLayersAndElements
	};
};
