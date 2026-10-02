import { describe, it, expect, beforeEach, vi } from "vitest";
import { act } from "@testing-library/react";
import { renderHookWithProviders } from "../test-utils";
import type { RenderHookResult } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import useStore from "../../state/hooks/useStore";
import type { CanvasElement, HistoryAction, SliceStores } from "../../types";
import { MODES } from "../../state/store";

const exampleStore: SliceStores = {
	background: "#ffffff",
	width: 400,
	height: 400,
	shape: "rectangle",
	mode: "move",
	strokeWidth: 5,
	opacity: 1,
	shapeMode: "fill",
	dpi: 1,
	color: "#000000",
	scale: 1,
	position: [0, 0],
	layers: [
		{ name: "Layer 1", id: expect.any(String), active: true, hidden: false }
	],
	currentLayer: 0,
	elements: [],
	copiedElements: [],
	undoStack: [],
	redoStack: [],
	referenceWindowEnabled: false,
	changeMode: expect.any(Function),
	changeColor: expect.any(Function),
	setLayers: expect.any(Function),
	setPosition: expect.any(Function),
	changeX: expect.any(Function),
	changeY: expect.any(Function),
	changeShape: expect.any(Function),
	changeDimensions: expect.any(Function),
	changeDPI: expect.any(Function),
	changeOpacity: expect.any(Function),
	changeShapeMode: expect.any(Function),
	getActiveLayer: expect.any(Function),
	changeStrokeWidth: expect.any(Function),
	moveLayerUp: expect.any(Function),
	moveLayerDown: expect.any(Function),
	createLayer: expect.any(Function),
	changeElementProperties: expect.any(Function),
	deleteElement: expect.any(Function),
	undo: expect.any(Function),
	redo: expect.any(Function),
	deleteLayer: expect.any(Function),
	toggleLayer: expect.any(Function),
	toggleLayerVisibility: expect.any(Function),
	renameLayer: expect.any(Function),
	removeLayer: expect.any(Function),
	createElement: expect.any(Function),
	setElements: expect.any(Function),
	copyElement: expect.any(Function),
	pasteElement: expect.any(Function),
	pushHistory: expect.any(Function),
	toggleReferenceWindow: expect.any(Function),
	prepareForExport: expect.any(Function),
	prepareForSave: expect.any(Function),
	drawCanvas: expect.any(Function)
};

describe("useStore functionality", () => {
	let result: RenderHookResult<SliceStores, unknown>;

	beforeEach(() => {
		result = renderHookWithProviders(() => useStore((state) => state));
	});

	it("should return the entire store", () => {
		expect(result.result.current).toEqual(exampleStore);
	});

	it("should throw if the hook is not under the StoreProvider", () => {
		const error = "useStore must be used within a StoreProvider";
		expect(() => renderHook(() => useStore((state) => state))).toThrowError(
			error
		);
	});

	describe("Canvas store functionality", () => {
		it("should return the appropriate selectors", () => {
			const result1 = renderHookWithProviders(() =>
				useStore((state) => state.width)
			);
			expect(result1.result.current).toBe(400);

			const result2 = renderHookWithProviders(() =>
				useStore((state) => state.elements)
			);
			expect(result2.result.current).toEqual([]);

			const result3 = renderHookWithProviders(() =>
				useStore((state) => state.createElement)
			);
			expect(result3.result.current).toEqual(expect.any(Function));
		});

		it("should change the dimensions to given values", () => {
			expect(result.result.current.width).toBe(400);
			expect(result.result.current.height).toBe(400);

			act(() => {
				result.result.current.changeDimensions({ width: 500, height: 500 });
			});

			expect(result.result.current.width).toBe(500);
			expect(result.result.current.height).toBe(500);
		});

		it("should not change a dimension if not provided", () => {
			expect(result.result.current.width).toBe(400);
			expect(result.result.current.height).toBe(400);

			act(() => {
				result.result.current.changeDimensions({ width: 500 });
			});

			expect(result.result.current.width).toBe(500);
			expect(result.result.current.height).toBe(400);

			act(() => {
				result.result.current.changeDimensions({ height: 500 });
			});

			expect(result.result.current.width).toBe(500);
			expect(result.result.current.height).toBe(500);

			act(() => {
				result.result.current.changeDimensions({});
			});

			expect(result.result.current.width).toBe(500);
			expect(result.result.current.height).toBe(500);
		});

		it("should return the initial mode", () => {
			expect(result.result.current.mode).toBe(exampleStore.mode);
		});

		it("should properly update to all existing modes", () => {
			for (const mode of MODES) {
				act(() => {
					result.result.current.changeMode(mode.name);
				});

				expect(result.result.current.mode).toBe(mode.name);
			}
		});

		it("should return the initial color", () => {
			expect(result.result.current.color).toBe(exampleStore.color);
		});

		it("should properly update the color", () => {
			const newColor = "#FF0000";
			act(() => {
				result.result.current.changeColor(newColor);
			});
			expect(result.result.current.color).toBe(newColor);
		});

		it("should return the initial stroke width", () => {
			expect(result.result.current.strokeWidth).toBe(exampleStore.strokeWidth);
		});

		it("should properly update the stroke width", () => {
			const newWidth = 10;
			act(() => {
				result.result.current.changeStrokeWidth(newWidth);
			});
			expect(result.result.current.strokeWidth).toBe(newWidth);
		});

		it("should not allow stroke width to be outside 1-100", () => {
			let newWidth = 101;
			act(() => {
				result.result.current.changeStrokeWidth(newWidth);
			});
			expect(result.result.current.strokeWidth).toBe(100);

			newWidth = 0;
			act(() => {
				result.result.current.changeStrokeWidth(newWidth);
			});
			expect(result.result.current.strokeWidth).toBe(1);
		});

		it("should return the initial layer", () => {
			expect(result.result.current.layers).toEqual(exampleStore.layers);
		});

		it("should create a new layer", () => {
			const newLayer = {
				name: "Layer 2",
				id: expect.any(String),
				active: false,
				hidden: false
			};
			act(() => {
				result.result.current.createLayer(newLayer);
			});
			expect(result.result.current.layers).toEqual([
				...exampleStore.layers,
				newLayer
			]);
		});

		it("should remove a layer when more than 1 layer", () => {
			// Push a new layer
			const newLayer = {
				name: "Layer 2",
				id: expect.any(String),
				active: false,
				hidden: false
			};

			act(() => {
				result.result.current.createLayer(newLayer);
			});

			// Remove the first layer
			const layerToRemove = result.result.current.layers[0];

			act(() => {
				result.result.current.removeLayer(layerToRemove.id);
			});

			newLayer.active = true; // Since there is only one layer, it should be active

			expect(result.result.current.layers).toEqual([newLayer]);
		});

		it("should not remove a layer if there is one layer", () => {
			const layerToRemove = result.result.current.layers[0];
			act(() => {
				result.result.current.removeLayer(layerToRemove.id);
			});
			expect(result.result.current.layers).toEqual(exampleStore.layers);
		});

		it("should not remove a layer if not found", () => {
			act(() => {
				result.result.current.removeLayer("1234-5678-9123-4567");
			});
			expect(result.result.current.layers).toEqual(exampleStore.layers);
		});

		it("should set layers to given payload", () => {
			const newLayers = [
				{
					name: "Layer 1",
					id: "1234-5678-9123-4567",
					active: true,
					hidden: false
				},
				{
					name: "Layer 3",
					id: "1234-5678-9123-4569",
					active: false,
					hidden: false
				}
			];
			act(() => {
				result.result.current.setLayers(newLayers);
			});
			expect(result.result.current.layers).toEqual(newLayers);
		});

		it("should return the initial scale", () => {
			expect(result.result.current.scale).toBe(exampleStore.scale);
		});

		it("should return the initial position", () => {
			expect(result.result.current.position).toEqual(exampleStore.position);
		});

		it("should set the position to the given values", () => {
			act(() => {
				result.result.current.setPosition({ x: 10, y: 10 });
			});
			expect(result.result.current.position).toEqual({ x: 10, y: 10 });
		});

		it("should increase the X position by 5", () => {
			act(() => {
				result.result.current.changeX(5);
			});
			expect(result.result.current.position[0]).toBe(5);
		});

		it("should decrease the X position by 5", () => {
			act(() => {
				result.result.current.changeX(-5);
			});
			expect(result.result.current.position[0]).toBe(-5);
		});

		it("should increase the Y position by 5", () => {
			act(() => {
				result.result.current.changeY(5);
			});
			expect(result.result.current.position[1]).toBe(5);
		});

		it("should decrease the Y position by 5", () => {
			act(() => {
				result.result.current.changeY(-5);
			});
			expect(result.result.current.position[1]).toBe(-5);
		});

		it("should return the initial DPI", () => {
			expect(result.result.current.dpi).toBe(exampleStore.dpi);
		});

		it("should set the DPI to the given value", () => {
			act(() => {
				result.result.current.changeDPI(2);
			});
			expect(result.result.current.dpi).toBe(2);
		});

		it("should return json of layers and elements for saving", () => {
			const layers = [
				{
					name: "Layer 1",
					id: "1234-5678-9123-4567",
					active: true,
					hidden: false
				},
				{
					name: "Layer 3",
					id: "1234-5678-9123-4569",
					active: false,
					hidden: false
				}
			];
			const elements: CanvasElement[] = [
				{
					id: "1234-5678-9123-4567",
					type: "rectangle",
					x: 10,
					y: 10,
					width: 100,
					height: 100,
					color: "#000000",
					inverted: false,
					path: [],
					opacity: 1,
					strokeWidth: 5,
					drawType: "fill",
					layerId: "1234-5678-9123-4567"
				}
			];
			const expected = {
				layers,
				elements
			};
			act(() => {
				result.result.current.setLayers(layers);
				result.result.current.setElements(elements);
			});
			expect(result.result.current.prepareForSave()).toEqual(expected);
		});

		it("should return a blob for exporting", () => {
			const elements: CanvasElement[] = [
				{
					id: "1234-5678-9123-4567",
					type: "rectangle",
					x: 10,
					y: 10,
					width: 100,
					height: 100,
					color: "#000000",
					inverted: false,
					path: [],
					opacity: 1,
					strokeWidth: 5,
					drawType: "fill",
					layerId: "1234-5678-9123-4567"
				}
			];
			act(() => {
				result.result.current.setElements(elements);
			});
			expect(result.result.current.prepareForExport()).resolves.toEqual(
				expect.any(Blob)
			);
		});

		it("should render the elements in the correct positions relative to the canvas", async () => {
			const canvas = document.createElement("canvas");
			canvas.width = 400;
			canvas.height = 400;
			canvas.id = "1234-5678-9123-4567";
			const elements: CanvasElement[] = [
				{
					id: "1234-5678-9123-4567",
					type: "rectangle",
					x: 10,
					y: 10,
					width: 100,
					height: 100,
					color: "#000000",
					inverted: false,
					path: [],
					opacity: 1,
					strokeWidth: 5,
					drawType: "fill",
					layerId: "1234-5678-9123-4567"
				},
				{
					id: "1234-5678-9123-4568",
					type: "circle",
					x: 20,
					y: 20,
					width: 100,
					height: 100,
					color: "#000000",
					inverted: false,
					path: [],
					opacity: 1,
					strokeWidth: 5,
					drawType: "fill",
					layerId: "1234-5678-9123-4567"
				},
				{
					id: "1234-5678-9123-4569",
					type: "triangle",
					x: 30,
					y: 30,
					width: 100,
					height: 100,
					color: "#000000",
					inverted: false,
					path: [],
					opacity: 1,
					strokeWidth: 5,
					drawType: "fill",
					layerId: "1234-5678-9123-4567"
				}
			];

			const ctx = canvas.getContext("2d");

			if (!ctx) {
				throw new Error("Canvas context not found.");
			}

			vi.spyOn(document, "createElement").mockReturnValue(canvas);

			const strokeSpy = vi.spyOn(ctx, "stroke");
			const fillSpy = vi.spyOn(ctx, "fill");
			const strokeRectSpy = vi.spyOn(ctx, "strokeRect");
			const fillRectSpy = vi.spyOn(ctx, "fillRect");
			const lineToSpy = vi.spyOn(ctx, "lineTo");
			const moveToSpy = vi.spyOn(ctx, "moveTo");
			const ellipseSpy = vi.spyOn(ctx, "ellipse");

			act(() => {
				result.result.current.setElements(elements);
			});

			await result.result.current.prepareForExport();

			for (const element of elements) {
				const { x, y, width, height, type } = element;

				switch (type) {
					case "rectangle":
						expect(fillRectSpy).toHaveBeenCalledWith(x, y, width, height);
						break;
					case "circle":
						expect(ellipseSpy).toHaveBeenCalledWith(
							x + width / 2,
							y + height / 2,
							width / 2,
							height / 2,
							0,
							0,
							Math.PI * 2
						);
						break;
					case "triangle":
						expect(moveToSpy).toHaveBeenCalledWith(x + width / 2, y);
						expect(lineToSpy).toHaveBeenCalledWith(x + width, y + height);
						expect(lineToSpy).toHaveBeenCalledWith(x, y + height);
						break;
					default:
						break;
				}
			}

			expect(strokeRectSpy).toHaveBeenCalledTimes(0); // Since all rectangles use drawType="fill"
			// FillRect is called multiple times:
			// - Once for each rectangle element (1)
			// - Once for the background
			expect(fillRectSpy).toHaveBeenCalledTimes(2);
			expect(fillSpy).toHaveBeenCalledTimes(2); // For circle and triangle
			expect(strokeSpy).toHaveBeenCalledTimes(0); // Since all elements use drawType="fill"
		});

		it("should throw if not given layers to export", () => {
			act(() => {
				result.result.current.setLayers([]);
			});
			expect(() => result.result.current.prepareForExport()).toThrow();
		});
	});

	describe("History store functionality", () => {
		it("should return the initial history stacks", () => {
			expect(result.result.current.undoStack).toEqual(exampleStore.undoStack);
			expect(result.result.current.redoStack).toEqual(exampleStore.redoStack);
		});

		it("should push to the history when creating an element", () => {
			const action: HistoryAction = {
				type: "add_element",
				properties: {
					type: "rectangle",
					x: 10,
					y: 10,
					width: 100,
					height: 100,
					color: "#000000",
					layerId: "1234-5678-9123-4567"
				}
			};
			act(() => {
				result.result.current.pushHistory(action);
			});
			expect(result.result.current.undoStack).toEqual([action]);
			expect(result.result.current.redoStack).toEqual([]);
		});

		it("should undo the last action", () => {
			const action: HistoryAction = {
				type: "add_element",
				properties: {
					type: "rectangle",
					x: 10,
					y: 10,
					width: 100,
					height: 100,
					color: "#000000",
					layerId: "1234-5678-9123-4567"
				}
			};

			act(() => {
				result.result.current.pushHistory(action);
				result.result.current.undo();
			});

			expect(result.result.current.undoStack).toEqual([]);
			expect(result.result.current.redoStack).toEqual([action]);
		});

		it("should redo the last action", () => {
			const action: HistoryAction = {
				type: "add_element",
				properties: {
					type: "rectangle",
					x: 10,
					y: 10,
					width: 100,
					height: 100,
					color: "#000000",
					layerId: "1234-5678-9123-4567"
				}
			};

			act(() => {
				result.result.current.pushHistory(action);
				result.result.current.undo();
				result.result.current.redo();
			});

			expect(result.result.current.undoStack).toEqual([action]);
			expect(result.result.current.redoStack).toEqual([]);
		});

		it("should not undo if there are no actions", () => {
			act(() => {
				result.result.current.undo();
			});
			expect(result.result.current.undoStack).toEqual([]);
			expect(result.result.current.redoStack).toEqual([]);
		});

		it("should not redo if there are no actions", () => {
			act(() => {
				result.result.current.redo();
			});
			expect(result.result.current.undoStack).toEqual([]);
			expect(result.result.current.redoStack).toEqual([]);
		});

		it("should call the appropriate functions when going through history of adding elements", () => {
			const elementPayload: Partial<CanvasElement> = {
				type: "rectangle",
				x: 10,
				y: 10,
				width: 100,
				height: 100,
				color: "#000000",
				layerId: "1234-5678-9123-4567"
			};
			let returnedElement: CanvasElement | null = null;

			act(() => {
				// We need to manually create the element first before pushing to history.
				returnedElement = result.result.current.createElement(
					"rectangle",
					elementPayload
				);
				result.result.current.pushHistory({
					type: "add_element",
					properties: returnedElement
				});
			});

			const createSpy = vi.spyOn(result.result.current, "createElement");
			const deleteSpy = vi.spyOn(result.result.current, "deleteElement");

			// Let's undo.
			act(() => {
				result.result.current.undo();
			});
			expect(deleteSpy).toHaveBeenCalledTimes(1);
			expect(createSpy).not.toHaveBeenCalled();

			// Now let's redo.
			act(() => {
				result.result.current.redo();
			});

			//eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { type, ...rest } = returnedElement || ({} as CanvasElement);

			expect(createSpy).toHaveBeenCalledWith("rectangle", rest);
			expect(deleteSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("Element store functionality", () => {
		it("should return the initial elements", () => {
			expect(result.result.current.elements).toEqual(exampleStore.elements);
		});

		it("should create one shape element with default properties", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});
			expect(result.result.current.elements).toEqual<CanvasElement[]>([
				{
					id: expect.any(String),
					type: "rectangle",
					x: 0,
					y: 0,
					width: 100,
					height: 100,
					color: "#000000",
					inverted: false,
					path: [],
					opacity: 1,
					strokeWidth: 5,
					drawType: "fill",
					layerId: "1234-5678-9123-4567"
				}
			]);
		});

		it("should create one shape element with pre-filled properties", () => {
			const element: CanvasElement = {
				id: expect.any(String),
				type: "rectangle",
				x: 10,
				y: 10,
				width: 100,
				height: 100,
				strokeWidth: 5,
				color: "#000000",
				inverted: false,
				path: [],
				opacity: 1,
				drawType: "fill",
				layerId: "1234-5678-9123-4567"
			};
			act(() => {
				result.result.current.createElement("rectangle", element);
			});
			expect(result.result.current.elements).toEqual([element]);
		});

		it("should create one text element with text properties", () => {
			const element: CanvasElement = {
				id: expect.any(String),
				type: "text",
				x: 10,
				y: 10,
				width: 100,
				height: 100,
				strokeWidth: 5,
				color: "#000000",
				inverted: false,
				path: [],
				opacity: 1,
				drawType: "fill",
				layerId: "1234-5678-9123-4567",
				text: {
					size: 16,
					family: "Arial",
					content: "Text"
				}
			};
			act(() => {
				result.result.current.createElement("text", element);
			});
			expect(result.result.current.elements).toEqual([element]);
		});

		it("should create elements with unique ids", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
				result.result.current.createElement("circle", {
					layerId: "1234-5678-9123-4567"
				});
			});
			const [one, two] = result.result.current.elements;

			expect(one.id).not.toBe(two.id);
		});

		it("should delete an element", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});
			expect(result.result.current.elements).toHaveLength(1);

			const [element] = result.result.current.elements;

			act(() => {
				result.result.current.deleteElement((el) => el.id === element.id);
			});

			expect(result.result.current.elements).toHaveLength(0);
		});

		it("should not delete anything if id doesn't exist", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});
			expect(result.result.current.elements).toHaveLength(1);

			act(() => {
				result.result.current.deleteElement((el) => el.id === "1");
			});

			expect(result.result.current.elements).toHaveLength(1);
		});

		it("should change element properties", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});

			let element = result.result.current.elements[0];
			expect(element.color).toBe("#000000");

			act(() => {
				result.result.current.changeElementProperties(
					(state) => ({
						...state,
						color: "#ffffff"
					}),
					(el) => el.id === element.id
				);
			});

			element = result.result.current.elements[0];
			expect(element.color).toBe("#ffffff");
		});

		it("should not change element properties if id doesn't exist", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});

			let element = result.result.current.elements[0];
			expect(element.color).toBe("#000000");

			act(() => {
				result.result.current.changeElementProperties(
					(state) => ({
						...state,
						color: "#ffffff"
					}),
					(el) => el.id === "1"
				);
			});

			element = result.result.current.elements[0];
			expect(element.color).toBe("#000000");
		});

		it("should throw if text properties are not provided when creating text element", () => {
			const error =
				"Cannot create text element without additional text properties.";
			expect(() => {
				act(() => {
					result.result.current.createElement("text", {
						layerId: "1234-5678-9123-4567"
					});
				});
			}).toThrowError(error);
		});
	});
});
