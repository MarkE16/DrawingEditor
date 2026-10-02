import {
	describe,
	it,
	expect,
	beforeEach,
	beforeAll,
	afterAll,
	vi,
	afterEach
} from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";

import ReferenceWindow from "../../components/ReferenceWindow/ReferenceWindow";

describe("Reference Window functionality", () => {
	let originalCreateObjectURL: typeof URL.createObjectURL;
	let originalRevokeObjectURL: typeof URL.revokeObjectURL;

	beforeAll(() => {
		originalCreateObjectURL = URL.createObjectURL;
		originalRevokeObjectURL = URL.revokeObjectURL;

		URL.createObjectURL = vi.fn(() => "blob:http://localhost:3000/1234");
		URL.revokeObjectURL = vi.fn();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		URL.createObjectURL = originalCreateObjectURL;
		URL.revokeObjectURL = originalRevokeObjectURL;
	});

	beforeEach(() => {
		renderWithProviders(<ReferenceWindow />);
	});

	it("should render the component", () => {
		expect(screen.getByTestId("reference-window")).toBeInTheDocument();
	});

	it("should render the title", () => {
		expect(screen.getByText("Reference Window")).toBeInTheDocument();
	});

	it("should render the close button", () => {
		expect(screen.getByTestId("close-ref-window")).toBeInTheDocument();
	});

	it("should render with no image displayed", () => {
		expect(
			screen.getByText(/Drop an image here to use as a reference./)
		).toBeInTheDocument();
	});

	it("should render the controls with everything disabled except replacing an image and pin", () => {
		const controls = [
			"scale-slider",
			"zoom-in",
			"zoom-out",
			"pin",
			"flip",
			"rotate"
		];

		controls.forEach((control) => {
			const controlElement = screen.getByTestId(control);
			if (control === "pin") {
				expect(controlElement).not.toBeDisabled();
			} else {
				expect(controlElement).toBeDisabled();
			}
		});

		const replaceImage = screen.getByText("Replace Image");
		expect(replaceImage).toBeInTheDocument();
		expect(replaceImage).not.toBeDisabled();
	});

	it("should display an image when one is dropped", () => {
		const file = new File(["(⌐□_□)"], "example.png", {
			type: "image/png"
		});
		const dragZone = screen.getByTestId("reference-window-content");

		fireEvent.drop(dragZone, { dataTransfer: { files: [file] } });

		const img = screen.getByAltText("Reference");

		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", "blob:http://localhost:3000/1234");
		expect(
			screen.queryByText(/Drop an image here to use as a reference./)
		).not.toBeInTheDocument();
	});

	it("should display an error when an invalid file is dropped", () => {
		const alertSpy = vi.spyOn(window, "alert");
		const file = new File(["(⌐□_□)"], "example.txt", {
			type: "text/plain"
		});
		const dragZone = screen.getByTestId("reference-window-content");

		fireEvent.drop(dragZone, { dataTransfer: { files: [file] } });

		expect(alertSpy).toHaveBeenCalledWith("Invalid file type.");
	});

	it("should display an image with 'Replace Image'", () => {
		const file = new File(["(⌐□_□)"], "example.png", {
			type: "image/png"
		});
		const replaceImage = screen.getByText("Replace Image");
		const hiddenInput = screen.getByTestId("ref-window-file-input");
		const hiddenInputSpy = vi.spyOn(hiddenInput, "click");

		fireEvent.click(replaceImage);
		expect(hiddenInputSpy).toHaveBeenCalledOnce();

		fireEvent.change(hiddenInput, { target: { files: [file] } });

		const img = screen.getByAltText("Reference");

		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", "blob:http://localhost:3000/1234");
		expect(
			screen.queryByText(/Drop an image here to use as a reference./)
		).not.toBeInTheDocument();
	});

	it("should display an error when an invalid file is selected", () => {
		const alertSpy = vi.spyOn(window, "alert");
		const file = new File(["(⌐□_□)"], "example.txt", {
			type: "text/plain"
		});
		const hiddenInput = screen.getByTestId("ref-window-file-input");

		fireEvent.change(hiddenInput, { target: { files: [file] } });

		expect(alertSpy).toHaveBeenCalledWith("Invalid file type.");
	});

	it("should zoom in with the button", () => {
		const zoomIn = screen.getByTestId("zoom-in");
		const dragZone = screen.getByTestId("reference-window-content");

		fireEvent.drop(dragZone, {
			dataTransfer: {
				files: [new File(["(⌐□_□)"], "example.png", { type: "image/png" })]
			}
		});

		const img = screen.getByAltText("Reference");
		fireEvent.click(zoomIn);

		// The scale is 50 by default for the slider to be
		// at the middle of the slider. We also have to divide
		// by 50 to get the actual scale. Increasing the scale is
		// done by incrementing by 10. 60 / 50 = 1.2.
		expect(img).toHaveStyle("transform: rotate(0deg) scaleX(1) scale(1.2)");
	});

	it("should zoom out with the button", () => {
		const zoomOut = screen.getByTestId("zoom-out");
		const dragZone = screen.getByTestId("reference-window-content");

		fireEvent.drop(dragZone, {
			dataTransfer: {
				files: [new File(["(⌐□_□)"], "example.png", { type: "image/png" })]
			}
		});

		const img = screen.getByAltText("Reference");
		fireEvent.click(zoomOut);

		// The scale is 50 by default for the slider to be
		// at the middle of the slider. We also have to divide
		// by 50 to get the actual scale. Decreasing the scale is
		// done by decrementing by 10. 40 / 50 = 0.8.
		expect(img).toHaveStyle("transform: rotate(0deg) scaleX(1) scale(0.8)");
	});

	it("should zoom in and out with the slider", () => {
		const slider = screen.getByTestId("scale-slider");
		const dragZone = screen.getByTestId("reference-window-content");

		fireEvent.drop(dragZone, {
			dataTransfer: {
				files: [new File(["(⌐□_□)"], "example.png", { type: "image/png" })]
			}
		});

		const img = screen.getByAltText("Reference");
		fireEvent.change(slider, { target: { value: "70" } });

		// Zoom in.
		// 70 / 50 = 1.4
		expect(img).toHaveStyle("transform: rotate(0deg) scaleX(1) scale(1.4)");

		// Zoom out.
		// 30 / 50 = 0.6
		fireEvent.change(slider, { target: { value: "30" } });

		expect(img).toHaveStyle("transform: rotate(0deg) scaleX(1) scale(0.6)");
	});

	it("should pin the window", () => {
		const pin = screen.getByTestId("pin");

		fireEvent.click(pin);

		const window = screen.getByTestId("reference-window");
		expect(window).toHaveClass("relative");
		expect(window).not.toHaveClass("absolute");
	});

	it("should flip the image", () => {
		const flip = screen.getByTestId("flip");
		const dragZone = screen.getByTestId("reference-window-content");

		fireEvent.drop(dragZone, {
			dataTransfer: {
				files: [new File(["(⌐□_□)"], "example.png", { type: "image/png" })]
			}
		});

		const img = screen.getByAltText("Reference");
		fireEvent.click(flip);

		expect(img).toHaveStyle("transform: rotate(0deg) scaleX(-1) scale(1)");
	});

	it("should rotate the image", () => {
		const rotate = screen.getByTestId("rotate");
		const dragZone = screen.getByTestId("reference-window-content");

		fireEvent.drop(dragZone, {
			dataTransfer: {
				files: [new File(["(⌐□_□)"], "example.png", { type: "image/png" })]
			}
		});

		const img = screen.getByAltText("Reference");

		// Rotate 90 degrees 4 times.
		// First rotation: 90 % 360 = 90
		// Second rotation: 180 % 360 = 180
		// Third rotation: 270 % 360 = 270
		// Fourth rotation: 360 % 360 = 0
		for (let i = 0; i < 4; i++) {
			fireEvent.click(rotate);

			const rotation = ((i + 1) * 90) % 360;

			expect(img).toHaveStyle(
				`transform: rotate(${rotation}deg) scaleX(1) scale(1)`
			);
		}
	});

	it("should enable minimal mode", () => {
		const dragZone = screen.getByTestId("reference-window-content");

		fireEvent.drop(dragZone, {
			dataTransfer: {
				files: [new File(["(⌐□_□)"], "example.png", { type: "image/png" })]
			}
		});

		const img = screen.getByAltText("Reference");

		// Minimal mode is disabled by default.
		// Clicking the image should enable minimal mode.
		// When minimal mode is enabled, the controls should be hidden.

		fireEvent.click(img);

		const controls = screen.queryByTestId("reference-window-controls");
		expect(controls).not.toBeInTheDocument();
	});

	it("should disable minimal mode", () => {
		const dragZone = screen.getByTestId("reference-window-content");

		fireEvent.drop(dragZone, {
			dataTransfer: {
				files: [new File(["(⌐□_□)"], "example.png", { type: "image/png" })]
			}
		});

		const img = screen.getByAltText("Reference");

		// Minimal mode is disabled by default.
		// Clicking the image should enable minimal mode.
		// Clicking the image again should disable minimal mode.
		// When minimal mode is disabled, the controls should be visible.

		fireEvent.click(img);
		let controls = screen.queryByTestId("reference-window-controls");
		expect(controls).not.toBeInTheDocument();

		fireEvent.click(img);

		controls = screen.getByTestId("reference-window-controls");
		expect(controls).toBeInTheDocument();
	});
});
