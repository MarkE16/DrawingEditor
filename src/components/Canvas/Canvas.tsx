// Lib
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { parseColor } from "react-aria-components";
import { useShallow } from "zustand/react/shallow";
import useStoreSubscription from "@/state/hooks/useStoreSubscription";
import useStore from "@/state/hooks/useStore";
import useThrottle from "@/state/hooks/useThrottle";
import useCanvasRedrawListener from "@/state/hooks/useCanvasRedrawListener";
import useCanvasRef from "@/state/hooks/useCanvasRef";
import { redrawCanvas, updateVector2 } from "@/lib/utils";
import ElementsStore from "@/state/stores/ElementsStore";
import LayersStore from "@/state/stores/LayersStore";
import ImageElementStore from "@/state/stores/ImageElementStore";
import useStoreContext from "@/state/hooks/useStoreContext";

// Types
import type {
	Dispatch,
	MouseEvent as ReactMouseEvent,
	SetStateAction
} from "react";
import { CanvasElementPath, Vector } from "@/types";

type CanvasProps = {
	setLoading: Dispatch<SetStateAction<boolean>>;
};

const THROTTLE_DELAY_MS = 10; // milliseconds

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(function Canvas(
	{ setLoading },
	ref
) {
	const {
		mode,
		shape,
		width,
		height,
		drawPaperCanvas,
		changeMode,
		changeColor,
		createElement,
		getActiveLayer,
		pushHistory,
		getPointerPosition,
		centerCanvas,
		setElements,
		setLayers
	} = useStore(
		useShallow((state) => ({
			mode: state.mode,
			shape: state.shape,
			width: state.width,
			height: state.height,
			dpi: state.dpi,
			position: state.position,
			changeMode: state.changeMode,
			changeColor: state.changeColor,
			createElement: state.createElement,
			getActiveLayer: state.getActiveLayer,
			pushHistory: state.pushHistory,
			getPointerPosition: state.getPointerPosition,
			drawPaperCanvas: state.drawPaperCanvas,
			centerCanvas: state.centerCanvas,
			setElements: state.setElements,
			setLayers: state.setLayers
		}))
	);
	const store = useStoreContext();
	const { setRef } = useCanvasRef();
	const color = useStoreSubscription((state) => state.color);
	const shapeMode = useStoreSubscription((state) => state.shapeMode);

	const isDrawing = useRef<boolean>(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const currentPath2D = useRef<Path2D>(null);
	const currentPath = useRef<CanvasElementPath[]>([]);
	const initialPosition = useRef<Vector<2>>([0, 0]);

	// Handler for when the mouse is pressed down on the canvas.
	// This should initiate the drawing process.
	const onMouseDown = (e: ReactMouseEvent<HTMLCanvasElement>) => {
		// isDrawing.current =
		// 	(mode === "draw" || mode === "erase") && !isMovingElement.current;

		const canvas = e.currentTarget;

		const onCanvas = e.target === canvas || canvas.contains(e.target as Node);

		if (!onCanvas) {
			return;
		}

		const ctx = canvas.getContext("2d", {
			willReadFrequently: true
		});

		if (!ctx) {
			throw new Error("Couldn't get the 2D context of the canvas.");
		}

		// Calculate the position of the mouse relative to the canvas.
		const { x, y } = getPointerPosition(canvas, e.clientX, e.clientY);
		const floorX = Math.floor(x);
		const floorY = Math.floor(y);

		if (!isDrawing.current) {
			updateVector2(initialPosition.current, floorX, floorY);
		}
		const activeLayer = getActiveLayer();
		isDrawing.current = !activeLayer.hidden;

		if (mode === "brush" || mode === "eraser") {
			currentPath2D.current = new Path2D();
			currentPath2D.current.moveTo(floorX, floorY);
			// Save the current path.
			currentPath.current.push([floorX, floorY]);
		} else if (mode === "eye_drop") {
			// `getPointerPosition` gives us the position in world coordinates,
			// but we need the position in canvas coordinates for `getImageData`.
			const rect = canvas.getBoundingClientRect();
			const canvasX = Math.floor(e.clientX - rect.left);
			const canvasY = Math.floor(e.clientY - rect.top);
			const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;

			const colorStr = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

			changeColor(parseColor(colorStr).toString("hex"));
			changeMode("move");
		}
	};

	const onMouseMove = useThrottle((e: MouseEvent) => {
		// If the left mouse button is not pressed, then we should not draw.
		// If the layer is hidden, we should not draw.
		// If the user is grabbing the canvas (for moving), we should not draw.
		const canvas = canvasRef.current;
		if (!canvas) {
			throw new Error("Canvas Ref is not set. This is a bug.");
		}

		const onCanvas = e.target === canvas || canvas.contains(e.target as Node);

		if (e.buttons !== 1 || !isDrawing.current || !onCanvas) {
			return;
		}
		if (mode === "shapes" || !currentPath2D.current) {
			currentPath2D.current = new Path2D();
		}
		const ctx = canvas.getContext("2d");

		if (!ctx) throw new Error("Couldn't get the 2D context of the canvas.");

		// Calculate the position of the mouse relative to the canvas.
		const { x, y } = getPointerPosition(canvas, e.clientX, e.clientY);
		const floorX = Math.floor(x);
		const floorY = Math.floor(y);

		const currentShapeMode = shapeMode.current;

		redrawCanvas();
		ctx.save();
		ctx.rect(0, 0, width, height);
		ctx.clip();

		switch (mode) {
			case "brush":
			case "eraser": {
				const lastPoint = currentPath.current[currentPath.current.length - 1];
				const lastPointX = lastPoint[0];
				const lastPointY = lastPoint[1];
				const midPointX = lastPointX + (floorX - lastPointX) / 2;
				const midPointY = lastPointY + (floorY - lastPointY) / 2;

				currentPath2D.current.quadraticCurveTo(
					lastPointX,
					lastPointY,
					midPointX,
					midPointY
				);
				ctx.stroke(currentPath2D.current);

				currentPath.current.push([floorX, floorY]);

				drawPaperCanvas(ctx, 0, 0);
				break;
			}

			case "shapes": {
				const initX = initialPosition.current[0];
				const initY = initialPosition.current[1];
				const width = x - initX;
				const height = y - initY;
				if (shape === "circle") {
					currentPath2D.current.ellipse(
						Math.min(x + Math.abs(width) / 2, initX + Math.abs(width) / 2),
						Math.min(y + Math.abs(height) / 2, initY + Math.abs(height) / 2),
						Math.abs(width) / 2,
						Math.abs(height) / 2,
						0,
						0,
						Math.PI * 2
					);
				} else if (shape === "rectangle") {
					currentPath2D.current.rect(initX, initY, width, height);
				} else if (shape === "triangle") {
					currentPath2D.current.moveTo(initX + width / 2, initY);
					currentPath2D.current.lineTo(initX, initY + height);
					currentPath2D.current.lineTo(initX + width, initY + height);
				}

				currentPath2D.current.closePath();
				if (currentShapeMode === "fill") {
					ctx.fill(currentPath2D.current);
				} else {
					ctx.stroke(currentPath2D.current);
				}
				break;
			}

			default: {
				break;
			}
		}
		ctx.restore();
	}, THROTTLE_DELAY_MS);

	// Handler for when the mouse is moved on the canvas.
	// This should handle a majority of the drawing process.

	const onMouseUp = (e: ReactMouseEvent<HTMLCanvasElement>) => {
		isDrawing.current = false;

		const activeLayer = getActiveLayer();
		const canvas = e.currentTarget;

		const onCanvas = e.target === canvas || canvas.contains(e.target as Node);

		if (!onCanvas || activeLayer.hidden) {
			return;
		}

		const ctx = canvas.getContext("2d");

		if (!ctx) throw new Error("Couldn't get the 2D context of the canvas.");

		const { x, y } = getPointerPosition(canvas, e.clientX, e.clientY);
		const [initX, initY] = initialPosition.current;

		let elementType;
		let elementPayload;
		if (mode === "shapes") {
			elementType = shape;
			elementPayload = {
				x: Math.min(x, initX),
				y: Math.min(y, initY),
				width: Math.abs(x - initX),
				height: Math.abs(y - initY),
				color: color.current,
				layerId: activeLayer.id,
				inverted: y < initY
			};
		} else if (mode === "brush" || mode === "eraser") {
			elementType = mode;
			elementPayload = {
				color: color.current,
				path: currentPath.current
			};
		} else {
			throw new Error(`Unsupported mode: ${mode}`);
		}

		const properties = createElement(elementType, elementPayload);

		updateVector2(initialPosition.current, 0, 0);

		pushHistory({
			type: "add_element",
			properties
		});
		currentPath.current = [];
		redrawCanvas();
	};

	const onMouseEnter = (e: ReactMouseEvent<HTMLCanvasElement>) => {
		if (e.buttons === 1) {
			onMouseDown(e);
		}
	};

	useImperativeHandle(ref, () => canvasRef.current!, []);

	useCanvasRedrawListener(canvasRef);

	useEffect(() => {
		document.addEventListener("mousemove", onMouseMove);
		setRef(canvasRef.current);
		return () => document.removeEventListener("mousemove", onMouseMove);
	}, [onMouseMove, setRef]);

	// Initially center the canvas.
	useEffect(() => {
		const ref = canvasRef.current;
		if (!ref) return;

		const persistStoreName = store.persist.getOptions().name;

		if (!persistStoreName) return;

		const savedStateExists = localStorage.getItem(persistStoreName) !== null;

		if (!savedStateExists) {
			centerCanvas(ref);
		}
	}, [centerCanvas, store]);

	useEffect(() => {
		async function updateLayersAndElements() {
			const elements = await ElementsStore.getElements();
			const layers = await LayersStore.getLayers();
			await ImageElementStore.loadImages();

			// There must always be at least one layer.
			// If there are no layers, do not update,
			// and instead use the default layer state.
			if (layers.length > 0) {
				setLayers(
					layers
						.sort((a, b) => a[1].position - b[1].position)
						.map(([id, { name }], i) => ({
							name,
							id,
							active: i === 0,
							hidden: false
						}))
				);
			}
			setElements(elements.map(([, element]) => element));
			setLoading(false);
			redrawCanvas();
		}

		updateLayersAndElements();
	}, [setElements, setLayers, setLoading]);

	return (
		<canvas
			data-testid="canvas-layer"
			id="canvas"
			data-mode={mode}
			data-canvas-width={width} // CSS pixels
			data-canvas-height={height} // CSS pixels
			className="absolute w-full h-full cursor-inherit z-0 data-[mode=move]:cursor-grab data-[mode=pan]:cursor-grab data-[mode=selection]:cursor-default data-[mode=draw]:cursor-none data-[mode=erase]:cursor-none data-[mode=zoom_in]:cursor-zoom-in data-[mode=zoom_out]:cursor-zoom-out data-[mode=text]:cursor-text data-[mode=eye_drop]:cursor-crosshair"
			ref={canvasRef}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseEnter={onMouseEnter}
		/>
	);
});

export default Canvas;
