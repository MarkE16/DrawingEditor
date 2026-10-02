import {
	expect,
	beforeEach,
	beforeAll,
	afterAll,
	describe,
	it,
	vi,
	afterEach
} from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import type { Color } from "react-aria-components";
import { parseColor } from "react-aria-components";
import Main from "../../components/Main/Main";
import { PropsWithChildren } from "react";
import { CanvasStore } from "../../types";

type MockProps = PropsWithChildren & {
	onChange?: (color: Color) => void;
};

const MOCK_COLOR = parseColor("#ff0000");

vi.mock("react-aria-components", async (importOriginal) => {
	const original = (await importOriginal()) as NonNullable<
		typeof importOriginal
	>;

	return {
		...original,
		// If the ColorThumb component is not mocked, an error related to useContext throws
		// and I'm not sure why. This is a workaround until the issue is identified.
		ColorThumb: () => <div data-testid="thumb" />,
		ColorArea: ({ onChange, children, ...props }: MockProps) => {
			return (
				<div
					data-testid="color-area"
					onClick={() => onChange && onChange(MOCK_COLOR)}
					{...props}
				>
					{children}
				</div>
			);
		}
	};
});

describe("Canvas Interactive Functionality", () => {
	let createObjectURLOriginal: typeof URL.createObjectURL;
	let revokeObjectURLOriginal: typeof URL.revokeObjectURL;
	const boundingClientRect: DOMRect = {
		x: 50,
		y: 64,
		width: 1364,
		height: 939,
		top: 64,
		right: 1414,
		bottom: 1003,
		left: 50,
		toJSON: vi.fn()
	};
	const mockState: Partial<CanvasStore> = {
		layers: [
			{
				id: "1",
				name: "Layer 1",
				active: true,
				hidden: false
			}
		],
		changeColor: vi.fn(),
		prepareForExport: vi.fn().mockResolvedValue(new Blob())
	};

	beforeEach(() => {
		renderWithProviders(<Main />, {
			preloadedState: mockState
		});
	});

	beforeAll(() => {
		createObjectURLOriginal = URL.createObjectURL;
		revokeObjectURLOriginal = URL.revokeObjectURL;

		URL.createObjectURL = vi.fn(() => "blob:http://localhost:3000/1234");
		URL.revokeObjectURL = vi.fn();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		URL.createObjectURL = createObjectURLOriginal;
		URL.revokeObjectURL = revokeObjectURLOriginal;

		vi.restoreAllMocks();
	});

	it("should render the Main component", () => {
		expect(screen.getByRole("main")).toBeInTheDocument();
	});

	describe("Moving canvas functionality", () => {
		it("should move the canvas with pan tool", () => {
			const pan = screen.getByTestId("tool-pan");
			const space = screen.getByTestId("canvas-container");
			const canvas = screen.getByTestId("canvas-layer");
			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			const beforeX = 100;
			const beforeY = 100;
			const afterX = 200;
			const afterY = 200;

			// Verify that the canvas is in its default position.
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			// First, we need to click on the tool and then click on the canvas to start the drag.

			fireEvent.click(pan);

			expect(pan).toHaveClass("bg-[#d1836a]");

			fireEvent.mouseDown(space, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			// Now, let's move the mouse to move the canvas.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});
			fireEvent.mouseUp(document);

			// The canvas should be moved.
			expect(canvas.style.transform).toBe(
				`translate(${afterX - beforeX}px, ${afterY - beforeY}px) scale(1)`
			);
			expect(boundingRectMock).toHaveBeenCalled();
		});
		it("should not move the canvas when the mode is not pan", () => {
			const space = screen.getByTestId("canvas-container");
			const canvas = screen.getByTestId("canvas-layer");
			vi.spyOn(space, "getBoundingClientRect").mockReturnValue(
				boundingClientRect
			);

			const beforeX = 100;
			const beforeY = 100;
			const afterX = 200;
			const afterY = 200;

			// Verify that the canvas is in its default position.
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			fireEvent.mouseDown(space, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			// Now, let's move the mouse to move the canvas.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});
			fireEvent.mouseUp(document);

			// The canvas should not be moved.
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");
		});
	});

	describe("Zoom functionality", () => {
		it("should zoom the canvas in and out using the toolbar button", () => {
			let toolButton = screen.getByTestId("tool-zoom_in");
			const space = screen.getByTestId("canvas-container");
			const canvases = screen.queryAllByTestId("canvas-layer");

			expect(canvases).toHaveLength(1);

			const canvas = canvases[0];
			expect(canvas).toBeInTheDocument();
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			// First, let's zoom in.
			fireEvent.click(toolButton);
			expect(toolButton).toHaveClass("bg-[#d1836a]");

			fireEvent.click(space);

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1.1)");

			// Now, let's zoom out.
			toolButton = screen.getByTestId("tool-zoom_out");

			fireEvent.click(toolButton);
			expect(toolButton).toHaveClass("bg-[#d1836a]");

			fireEvent.click(space);

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");
		});

		it("should zoom the canvas in and out using the keyboard shortcuts", () => {
			const canvases = screen.queryAllByTestId("canvas-layer");

			expect(canvases).toHaveLength(1);

			const canvas = canvases[0];
			expect(canvas).toBeInTheDocument();
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			fireEvent.keyDown(document, { key: "+" });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1.1)");

			fireEvent.keyDown(document, { key: "_" });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");
		});

		it("should zoom the canvas in and out using the mouse wheel with shift key held", () => {
			const space = screen.getByTestId("canvas-container");
			const canvases = screen.queryAllByTestId("canvas-layer");

			expect(canvases).toHaveLength(1);

			const canvas = canvases[0];
			expect(canvas).toBeInTheDocument();
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			// Shift key must be held to zoom in and out with the mouse wheel.
			fireEvent.wheel(space, { deltaY: -100, shiftKey: true });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1.1)");

			fireEvent.wheel(space, { deltaY: 100, shiftKey: true });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");
		});

		it("should not zoom the canvas in and out using the mouse wheel without shift key held", () => {
			const space = screen.getByTestId("canvas-container");
			const canvases = screen.queryAllByTestId("canvas-layer");

			expect(canvases).toHaveLength(1);

			const canvas = canvases[0];
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			// Shift key must be held to zoom in and out with the mouse wheel.
			fireEvent.wheel(space, { deltaY: -100 });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			fireEvent.wheel(space, { deltaY: 100 });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");
		});
	});

	describe("Canvas functionality", () => {
		const canvasBoundingClientRect: DOMRect = {
			x: 149.5,
			y: 334,
			width: 400,
			height: 400,
			top: 334,
			right: 549.5,
			bottom: 734,
			left: 149.5,
			toJSON: vi.fn()
		};

		it("should render a canvas layer", () => {
			const canvas = screen.queryByTestId("canvas-layer");

			expect(canvas).toBeInTheDocument();
			expect(canvas).toBeInstanceOf(HTMLCanvasElement);
			expect(canvas).toHaveAttribute("width", "400");
			expect(canvas).toHaveAttribute("height", "400");
			expect(canvas).not.toHaveClass("opacity-0");
		});

		it("should draw a line", () => {
			const drawTool = screen.getByTestId("tool-brush");
			let pointerMarker = screen.queryByTestId("canvas-pointer-marker");
			const canvas = screen.getByTestId("canvas-layer") as HTMLCanvasElement;
			const ctx = canvas.getContext("2d");

			expect(pointerMarker).not.toBeInTheDocument();

			fireEvent.click(drawTool);

			pointerMarker = screen.getByTestId("canvas-pointer-marker");

			expect(pointerMarker).not.toBeVisible();

			if (!ctx) throw new Error("Canvas context not found");

			const mockMoveTo = vi.fn();
			const mockLineTo = vi.fn();

			const mockPath2D = {
				moveTo: mockMoveTo,
				lineTo: mockLineTo
			};

			vi.spyOn(global, "Path2D").mockImplementation(
				() => mockPath2D as unknown as Path2D
			);
			vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue(
				canvasBoundingClientRect
			);
			// We need to mock the stroke method to avoid errors where the original
			// stroke method will throw if the passed argument is not a Path2D object.
			const mockStroke = vi.spyOn(ctx, "stroke").mockImplementation(vi.fn());

			const beforeX = 100;
			const beforeY = 100;
			const afterX = 200;
			const afterY = 200;

			fireEvent.mouseDown(canvas, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			fireEvent.mouseMove(canvas, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			expect(ctx.globalCompositeOperation).toBe("source-over");
			expect(mockStroke).toHaveBeenCalledWith(mockPath2D);
			expect(mockMoveTo).toHaveBeenCalledWith(beforeX - 149.5, beforeY - 334);
			expect(mockLineTo).toHaveBeenCalledWith(afterX - 149.5, afterY - 334);
			fireEvent.mouseUp(canvas);
		});

		it("should erase a section of the canvas", () => {
			const eraseTool = screen.getByTestId("tool-eraser");
			const canvas = screen.getByTestId("canvas-layer") as HTMLCanvasElement;
			const ctx = canvas.getContext("2d");

			vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue(
				canvasBoundingClientRect
			);

			fireEvent.click(eraseTool);

			if (!ctx) throw new Error("Canvas context not found");

			const afterX = 200;
			const afterY = 200;

			const strokeSpy = vi.spyOn(ctx, "stroke").mockImplementation(vi.fn());

			fireEvent.mouseDown(canvas, { buttons: 1 });
			fireEvent.mouseMove(canvas, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});
			expect(ctx.globalCompositeOperation).toBe("destination-out");
			expect(strokeSpy).toHaveBeenCalled();

			fireEvent.mouseUp(canvas);
		});

		it("should change the color based on the eye drop tool", () => {
			const moveTool = screen.getByTestId("tool-move");
			const eyeDropTool = screen.getByTestId("tool-eye_drop");
			const canvas = screen.getByTestId("canvas-layer") as HTMLCanvasElement;

			fireEvent.click(eyeDropTool);

			expect(moveTool).not.toHaveClass("bg-[#d1836a]");

			const ctx = canvas.getContext("2d");

			if (!ctx) throw new Error("Canvas context not found");

			vi.spyOn(ctx, "getImageData").mockReturnValue({
				data: new Uint8ClampedArray([255, 0, 0, 255]),
				width: 1,
				height: 1,
				colorSpace: "srgb"
			});

			fireEvent.mouseDown(canvas, { buttons: 1 });

			expect(mockState.changeColor).toHaveBeenCalledWith("#FF0000");
			// After the color is changed, the eye drop tool should be deactivated
			// and the move tool should be activated.
			expect(moveTool).toHaveClass("bg-[#d1836a]");
		});
	});
});
