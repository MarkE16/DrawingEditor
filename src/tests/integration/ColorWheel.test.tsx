// Lib
import {
	describe,
	it,
	expect,
	beforeEach,
	afterEach,
	vi,
	afterAll
} from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import ColorWheel from "../../components/ColorWheel/ColorWheel";

// Types
import type { CanvasStore } from "../../types";
import { Color, parseColor } from "react-aria-components";
import { PropsWithChildren } from "react";

type MockProps = PropsWithChildren & {
	onChange?: (color: Color) => void;
};

const mockColorWheelProps = vi.fn();
const mockColorAreaProps = vi.fn();
const mockColor = parseColor("#00FF00"); // Simulated color; color is green

// NOTE: Using the click event to simulate the color change because the onChange event is not being triggered
vi.mock("react-aria-components", async (importOriginal) => {
	const original = (await importOriginal()) as NonNullable<
		typeof importOriginal
	>;

	return {
		...original,
		ColorWheel: ({ onChange, children, ...props }: MockProps) => {
			mockColorWheelProps(props);
			return (
				<div
					data-testid="color-wheel"
					onClick={() => onChange && onChange(mockColor)}
					{...props}
				>
					{children}
				</div>
			);
		},
		ColorWheelTrack: () => <div data-testid="color-wheel-track" />,
		ColorThumb: () => <div data-testid="thumb" />,
		ColorArea: ({ onChange, children, ...props }: MockProps) => {
			mockColorAreaProps(props);
			return (
				<div
					data-testid="color-area"
					onClick={() => onChange && onChange(mockColor)}
					{...props}
				>
					{children}
				</div>
			);
		}
	};
});

describe("ColorWheel functionality", () => {
	const preloadedState: Partial<CanvasStore> = {
		width: 400,
		height: 400,
		mode: "move",
		strokeWidth: 5,
		scale: 1,
		dpi: 1,
		position: { x: 0, y: 0 },
		layers: [
			{ name: "Layer 1", id: "1", active: true, hidden: false },
			{ name: "Layer 2", id: "2", active: false, hidden: false }
		],
		color: "#FF0000", // Default red color,
		changeColor: vi.fn()
	};

	beforeEach(() => {
		renderWithProviders(<ColorWheel />, { preloadedState });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should render the component", () => {
		const container = screen.getByTestId("color-wheel-container");
		const colorWheel = screen.getByTestId("color-wheel");
		const colorWheelTrack = screen.getByTestId("color-wheel-track");
		const colorWheelThumbs = screen.getAllByTestId("thumb");
		const colorWheelArea = screen.getByTestId("color-area");

		expect(container).not.toBeNull();
		expect(colorWheel).not.toBeNull();
		expect(colorWheelTrack).not.toBeNull();
		expect(colorWheelArea).not.toBeNull();
		expect(colorWheelThumbs).toHaveLength(2);
	});

	it("should render with default color", () => {
		// Note: We store hex color in the state, but we need to convert it to hsl for the color wheel.
		const expected = parseColor("#FF0000");
		expect(mockColorWheelProps).toHaveBeenCalledWith(
			expect.objectContaining({
				value: expected.toString("hsl")
			})
		);

		expect(mockColorAreaProps).toHaveBeenCalledWith(
			expect.objectContaining({
				value: expected.toString("hsl")
			})
		);
	});

	it("should properly update to a new color when changing through color wheel", () => {
		// Simulate clicking the color wheel
		const colorWheel = screen.getByTestId("color-wheel");
		fireEvent.click(colorWheel);

		// Assert that dispatch was called with the correct action
		expect(preloadedState.changeColor).toHaveBeenCalledWith(
			mockColor.toString("hex")
		);
	});

	it("should properly update to a new color when changing through color area", () => {
		// Simulate clicking the color area
		const colorArea = screen.getByTestId("color-area");
		fireEvent.click(colorArea);

		// Assert that dispatch was called with the correct action
		expect(preloadedState.changeColor).toHaveBeenCalledWith(
			mockColor.toString("hex")
		);
	});

	it("should render the color area with the correct channels", () => {
		expect(mockColorAreaProps).toHaveBeenCalledWith(
			expect.objectContaining({
				xChannel: "saturation",
				yChannel: "lightness"
			})
		);
	});

	it("should correctly compute the color area dimensions", () => {
		const COLOR_WHEEL_INNER_RADIUS = 65;

		const COLOR_AREA_WIDTH = COLOR_WHEEL_INNER_RADIUS * Math.sqrt(2) - 5;
		const COLOR_AREA_HEIGHT = COLOR_WHEEL_INNER_RADIUS * Math.sqrt(2) - 5;

		expect(mockColorAreaProps).toHaveBeenCalledWith(
			expect.objectContaining({
				style: {
					width: `${COLOR_AREA_WIDTH}px`,
					height: `${COLOR_AREA_HEIGHT}px`,
					position: "absolute"
				}
			})
		);
	});
});
