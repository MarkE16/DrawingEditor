// Lib
import { useState, useRef } from "react";
import { parseColor } from "react-aria-components";

// Components
import {
	Button,
	ColorPicker as AriaColorPicker,
	Dialog,
	DialogTrigger,
	Popover,
	SliderOutput,
	SliderTrack,
	ColorSwatch as AriaColorSwatch,
	ColorSlider as AriaColorSlider,
	ColorArea as AriaColorArea
} from "react-aria-components";
import ColorThumb from "../ColorThumb/ColorThumb";
import ColorField from "../ColorField/ColorField";

// Styles - CSS for ColorSlider and Tailwind for everything else
import "./ColorPicker.styles.css";

// Types
import type { ReactNode, MouseEvent, ChangeEvent } from "react";
import type { Color } from "react-aria-components";
import type { CanvasElement } from "@/types";

type ColorPickerProps = {
	label: string;
	__for: keyof Pick<CanvasElement, "color">;
	value: string;
};

function ColorPicker({ label, __for, value }: ColorPickerProps): ReactNode {
	const [hex, setHex] = useState<string>(parseColor(value).toString("hex"));
	const startColor = useRef<string>(value);

	const handleColorChange = (color: Color) => {
		const hex = color.toString("hex");

		setHex(hex);
	};

	const onHexChange = async (e: ChangeEvent<HTMLInputElement>) => {
		try {
			const color = parseColor(e.target.value);
			handleColorChange(color);
		} catch (e: unknown) {
			// Do nothing. This should be thrown if the hex is invalid.
		}

		setHex(e.target.value);
	};

	const onOpenChange = (isOpen: boolean) => {
		// Closing, prepare to update the preview.
		if (!isOpen) {
			setHex(parseColor(value).toString("hex"));

			// Only update the preview if the color has changed.
			if (startColor.current !== value) {
				//...
			}
		} else {
			// Opening, save the current color.
			startColor.current = value;
		}
	};

	const stopPropagation = (e: MouseEvent) => e.stopPropagation();

	return (
		<div
			role="presentation"
			data-testid={`${__for}-color-picker`}
			onMouseDown={stopPropagation}
			onMouseMove={stopPropagation}
		>
			<AriaColorPicker>
				<DialogTrigger onOpenChange={onOpenChange}>
					<Button
						className="flex items-center gap-2 bg-transparent border-0 p-0 m-0 mx-[5px] text-white text-base rounded outline-none appearance-none focus-visible:outline-2 focus-visible:outline-[#0078d4] focus-visible:outline-offset-2"
						data-testid={`${__for}-picker-button`}
					>
						<AriaColorSwatch
							className="w-[30px] h-[30px] rounded shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
							color={value}
						/>
						<span>{label}</span>
					</Button>
					<Popover
						placement="bottom start"
						className="border border-[#373737] shadow-[0_8px_20px_rgba(0,0,0,0.1)] rounded-md bg-[#191919] text-white outline-none max-w-[250px] data-[entering]:animate-popover-slide data-[exiting]:animate-popover-slide-reverse data-[placement=top]:[--origin:translateY(8px)] data-[placement=bottom]:[--origin:translateY(-8px)] data-[placement=right]:[--origin:translateX(-8px)] data-[placement=left]:[--origin:translateX(8px)]"
						data-testid={`${__for}-picker-popover`}
					>
						<Dialog className="outline-none p-[15px] flex flex-col gap-2 min-w-[192px] max-h-full box-border overflow-auto">
							<AriaColorArea
								colorSpace="hsb"
								xChannel="saturation"
								yChannel="brightness"
								className="w-[192px] h-[192px] rounded flex-shrink-0"
								data-testid="picker-area"
								onChange={handleColorChange}
								value={value}
							>
								<ColorThumb />
							</AriaColorArea>
							<AriaColorSlider
								colorSpace="hsb"
								channel="hue"
								className="react-aria-ColorSlider"
								data-testid="picker-slider"
								onChange={handleColorChange}
								value={value}
							>
								<SliderOutput />
								<SliderTrack>
									<ColorThumb className="top-2" />
								</SliderTrack>
							</AriaColorSlider>
							<ColorField
								data-testid="picker-field"
								label="Hex"
								value={hex}
								onChange={onHexChange}
							/>
						</Dialog>
					</Popover>
				</DialogTrigger>
			</AriaColorPicker>
		</div>
	);
}

export default ColorPicker;
