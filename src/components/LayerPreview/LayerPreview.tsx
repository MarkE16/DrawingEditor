// Lib
import { useEffect, useRef } from "react";
import useCanvasRedrawListener from "@/state/hooks/useCanvasRedrawListener";
import useStore from "@/state/hooks/useStore";

// Types
import type { ReactNode } from "react";

type LayerPreviewProps = Readonly<{
	id: string;
}>;

const PREVIEW_WIDTH = 36; // Width of the preview canvas
const DEBOUNCE_REDRAW = true;
const PREVIEW_DRAW = true;

function LayerPreview({ id }: LayerPreviewProps): ReactNode {
	const previewRef = useRef<HTMLCanvasElement>(null);
	const drawCanvas = useStore((state) => state.drawCanvas);

	// Initial draw
	useEffect(() => {
		const canvas = previewRef.current;
		if (!canvas) return;
		drawCanvas(canvas, canvas, { layerId: id, preview: PREVIEW_DRAW });
	}, [drawCanvas, id]);

	// Then listen for future redraws
	useCanvasRedrawListener(previewRef, id, DEBOUNCE_REDRAW, PREVIEW_DRAW);

	return (
		<canvas
			ref={previewRef}
			className="h-full bg-white ml-1"
			width={PREVIEW_WIDTH}
			height={PREVIEW_WIDTH}
			style={{ width: PREVIEW_WIDTH, height: PREVIEW_WIDTH }}
			// Using data-testid for testing purposes
			data-testid={`preview-${id}`}
		/>
	);
}

export default LayerPreview;
