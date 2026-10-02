// Lib
import {
	ColorWheel as AriaColorWheel,
	ColorWheelTrack as AriaColorWheelTrack,
	ColorArea as AriaColorArea,
	parseColor
} from "react-aria-components";
import ColorThumb from "@/components/ColorThumb/ColorThumb";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";

// Types
import type { ReactNode } from "react";
import type {
	Color,
	ColorWheelProps as AriaColorWheelProps
} from "react-aria-components";

type ColorWheelProps = Omit<
	AriaColorWheelProps,
	"value" | "onChange" | "outerRadius" | "innerRadius"
>;

function ColorWheel(props: ColorWheelProps): ReactNode {
	const { color, changeColor } = useStore(
		useShallow((state) => ({
			color: state.color,
			changeColor: state.changeColor
		}))
	);

	const onChange = (color: Color) => changeColor(color.toString("hex"));
	const wheelColor = parseColor(color).toString("hsl");

	const COLOR_WHEEL_OUTER_RADIUS = 80;
	const COLOR_WHEEL_INNER_RADIUS = 65;

	// The square goes over the circle a bit, so we subtract 5 to make it fit
	const COLOR_AREA_WIDTH = COLOR_WHEEL_INNER_RADIUS * Math.sqrt(2) - 5;
	const COLOR_AREA_HEIGHT = COLOR_WHEEL_INNER_RADIUS * Math.sqrt(2) - 5;

	const id = "color-wheel-container";

	return (
		<div
			id={id}
			data-testid={id}
			className="flex relative justify-center items-center w-full mb-4"
		>
			<AriaColorWheel
				outerRadius={COLOR_WHEEL_OUTER_RADIUS}
				innerRadius={COLOR_WHEEL_INNER_RADIUS}
				value={wheelColor}
				className="color-wheel"
				data-testid="color-wheel"
				onChange={onChange}
				{...props}
			>
				<AriaColorWheelTrack data-testid="color-wheel-track" />
				<ColorThumb data-testid="color-wheel-thumb" />
			</AriaColorWheel>
			{/**
			 * Note: The ColorArea component implmentation of the xChannel and yChannel only works if the color value is in HSL/HSLA format.
			 * If the errors occur, check the format that the color is in.
			 */}
			<AriaColorArea
				value={wheelColor}
				onChange={onChange}
				className="outline outline-1 outline-black border-2 border-white"
				data-testid="color-area"
				style={{
					width: `${COLOR_AREA_WIDTH}px`,
					height: `${COLOR_AREA_HEIGHT}px`,
					position: "absolute" // Don't know why, but it doesn't work when applying it in the CSS file
				}}
				xChannel="saturation"
				yChannel="lightness"
			>
				<ColorThumb data-testid="color-area-thumb" />
			</AriaColorArea>
		</div>
	);
}

export default ColorWheel;
