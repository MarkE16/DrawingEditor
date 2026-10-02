// Lib
import { SHAPES } from "@/state/store";
import { memo, Fragment, useCallback } from "react";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";
import cn from "@/lib/tailwind-utils";

// Type
import type { ReactNode, MouseEvent, ReactElement } from "react";
import type { Shape } from "@/types";

// Components
import ShapeOption from "@/components/ShapeOption/ShapeOption";
import DrawingToolbarRangeConfig from "../DrawingToolbarRangeConfig/DrawingToolbarRangeConfig";

// Icons
import Square from "@/components/icons/Square/Square";
import Circle from "@/components/icons/Circle/Circle";
import Triangle from "../icons/Triangle/Triangle";

const MemoizedShapeOption = memo(ShapeOption);

const SHAPE_ICONS: Record<Shape, ReactElement> = {
	rectangle: <Square />,
	circle: <Circle />,
	triangle: <Triangle />
};

function DrawingToolbar(): ReactNode {
	const {
		mode,
		shape,
		shapeMode,
		changeStrokeWidth,
		changeOpacity,
		changeShapeMode
	} = useStore(
		useShallow((state) => ({
			mode: state.mode,
			shape: state.shape,
			shapeMode: state.shapeMode,
			changeStrokeWidth: state.changeStrokeWidth,
			changeOpacity: state.changeOpacity,
			changeShapeMode: state.changeShapeMode
		}))
	);

	const renderedShapes = (
		<Fragment key="settings_Shapes">
			{SHAPES.map((s) => (
				<MemoizedShapeOption
					key={s}
					icon={SHAPE_ICONS[s]}
					name={s}
					isActive={shape === s}
				/>
			))}
		</Fragment>
	);

	const renderedShapeMode = (
		<div
			className="w-[110px] flex justify-between"
			key="settings_ShapeMode"
		>
			<button
				onClick={() => changeShapeMode("fill")}
				className={cn(
					"border-none inline-flex justify-center w-full text-sm items-center bg-transparent h-[30px] mx-[0.5em] px-1 rounded-sm my-0 cursor-pointer transition-colors duration-100 hover:bg-[#505050]",
					{
						"bg-[#505050] outline outline-[3px] outline-[#7e83da] outline-offset-[2px]":
							shapeMode === "fill"
					}
				)}
			>
				Fill
			</button>
			<button
				onClick={() => changeShapeMode("stroke")}
				className={cn(
					"border-none inline-flex justify-center w-full text-sm items-center bg-transparent h-[30px] mx-[0.5em] px-1 rounded-sm my-0 cursor-pointer transition-colors duration-100 hover:bg-[#505050]",
					{
						"bg-[#505050] outline outline-[3px] outline-[#7e83da] outline-offset-[2px]":
							shapeMode === "stroke"
					}
				)}
			>
				Stroke
			</button>
		</div>
	);

	const renderedStrength = (
		<DrawingToolbarRangeConfig
			label="Size"
			selector={useCallback((state) => state.strokeWidth, [])}
			type="range"
			min={1}
			max={100}
			step={1}
			onFinalizedChange={useCallback(
				(value: number) => changeStrokeWidth(value),
				[changeStrokeWidth]
			)}
		/>
	);

	const renderedOpacity = (
		<DrawingToolbarRangeConfig
			label="Opacity"
			selector={useCallback((state) => state.opacity, [])}
			type="range"
			min={0.01}
			max={1}
			step={0.01}
			onFinalizedChange={useCallback(
				(value: number) => changeOpacity(value),
				[changeOpacity]
			)}
		/>
	);

	const additionalSettings: ReactNode[] = [];

	if (mode === "brush") {
		additionalSettings.push(renderedStrength, renderedOpacity);
	} else if (mode === "eraser") {
		additionalSettings.push(renderedStrength);
	} else if (mode === "shapes") {
		additionalSettings.push(
			renderedShapes,
			renderedShapeMode,
			renderedStrength,
			renderedOpacity
		);
	}

	// Now insert a break between each setting.
	for (let i = 0; i < additionalSettings.length; i++) {
		if (i % 2 !== 0) {
			additionalSettings.splice(
				i,
				0,
				<span
					key={`break-${i}`}
					className="mx-[15px] border-l border-[rgb(99,99,99)] h-[30px]"
				/>
			);
			i++; // Skip the next index since we just added a break
		}
	}

	const stopPropagation = (e: MouseEvent) => e.stopPropagation();

	return (
		<div
		className="flex items-center justify-center text-center absolute top-[10px] w-[80%] min-w-0 min-h-[46px] rounded-[25px] bg-[#303744] shadow-[0_0_10px_rgba(0,0,0,0.5)] p-[0.5em_1.5em] overflow-auto z-[100] pointer-events-none [&>*]:pointer-events-auto"
			data-testid="drawing-toolbar"
			role="toolbar"
			onMouseDown={stopPropagation}
			onMouseMove={stopPropagation}
		>
			{additionalSettings.length > 0 ? (
				additionalSettings
			) : (
				<span className="text-gray-500 text-medium overflow-hidden text-ellipsis whitespace-nowrap">
					Choose a different tool for actions.
				</span>
			)}
		</div>
	);
}

export default DrawingToolbar;
