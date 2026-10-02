import {
	describe,
	vi,
	it,
	expect,
	beforeEach,
	beforeAll,
	afterEach,
	afterAll
} from "vitest";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithProviders } from "@/tests/test-utils";
import LayerPreview from "@/components/LayerPreview/LayerPreview";
import { CanvasStore } from "@/types";

describe("LayerPreview functionality", () => {
	const drawCanvasMock = vi.fn();

	beforeAll(() => {
		vi.useFakeTimers();
	});

	beforeEach(() => {
		const preloadedState: Partial<CanvasStore> = {
			layers: [
				{
					id: "layer-123",
					name: "Layer 1",
					active: true,
					hidden: false
				},
				{
					id: "layer-456",
					name: "Layer 2",
					active: false,
					hidden: false
				}
			],
			drawCanvas: drawCanvasMock
		};
		renderWithProviders(<LayerPreview id="layer-123" />, { preloadedState });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});
	it("should render the component", () => {
		const layerPreview = screen.getByTestId("preview-layer-123");
		expect(layerPreview).toBeInTheDocument();
	});

	it("should update the preview once", () => {
		fireEvent(document, new CustomEvent("canvas:redraw"));

		vi.advanceTimersByTime(500);

		expect(drawCanvasMock).toHaveBeenCalled();
	});

	it("should not update the preview if no change was detected", () => {
		fireEvent(
			document,
			new CustomEvent("canvas:redraw", {
				detail: { noChange: true }
			})
		);

		vi.advanceTimersByTime(500);

		expect(drawCanvasMock).not.toHaveBeenCalled();
	});
});
