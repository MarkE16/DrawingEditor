// Lib
import { useState, useEffect, useRef } from "react";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";

// Types
import type { ReactNode, RefObject } from "react";
import type { Vector } from "@/types";

type CanvasPointerMarker = {
	canvasSpaceReference: RefObject<HTMLCanvasElement | null>;
};

function CanvasPointerMarker({
	canvasSpaceReference
}: CanvasPointerMarker): ReactNode {
	const { scale, strokeWidth } = useStore(
		useShallow((state) => ({
			scale: state.scale,
			strokeWidth: state.strokeWidth
		}))
	);
	const ref = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState<Vector<2>>([0, 0]);
	const positionX = position[0];
	const positionY = position[1];

	const POINTER_SIZE = strokeWidth * scale;

	useEffect(() => {
		const canvasSpace = canvasSpaceReference.current;
		if (!canvasSpace) return;

		function computeCoordinates(e: MouseEvent) {
			if (!canvasSpace) return;

			const { left, top, width, height } = canvasSpace.getBoundingClientRect();
			let newX;
			let newY;

			const computedX = e.clientX - left + POINTER_SIZE / 2;
			const computedY = e.clientY - top + POINTER_SIZE / 2;

			if (computedX - POINTER_SIZE < 0) {
				// If the pointer is too far to the left, set the x to the left edge of the canvas.
				newX = POINTER_SIZE;
			} else if (computedX > width) {
				// If the pointer is too far to the right, set the x to the right edge of the canvas.
				newX = width;
			} else {
				// Otherwise, set the x to the pointer's position.
				newX = computedX;
			}

			if (computedY - POINTER_SIZE < 0) {
				// If the pointer is too far to the top, set the y to the top edge of the canvas.
				newY = POINTER_SIZE;
			} else if (computedY > height) {
				// If the pointer is too far to the bottom, set the y to the bottom edge of the canvas.
				newY = height;
			} else {
				// Otherwise, set the y to the pointer's position.
				newY = computedY;
			}

			setPosition([newX, newY]);
		}

		document.addEventListener("mousemove", computeCoordinates);

		return () => {
			document.removeEventListener("mousemove", computeCoordinates);
		};
	}, [POINTER_SIZE, canvasSpaceReference]);

	return (
		<div
			ref={ref}
			id="canvas-pointer-marker"
			data-testid="canvas-pointer-marker"
			style={{
				// Remove pointer events so the pointer doesn't interfere with the canvas.
				borderRadius: "50%",
				left: -POINTER_SIZE,
				top: -POINTER_SIZE,
				transform: `translate(${positionX}px, ${positionY}px)`,
				zIndex: 100,
				width: POINTER_SIZE,
				height: POINTER_SIZE,
				position: "absolute"
			}}
		/>
	);
}

export default CanvasPointerMarker;
