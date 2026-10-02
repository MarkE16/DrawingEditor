// Lib
import { useState } from "react";
import useStore from "@/state/hooks/useStore";

// Types
import type {
	ChangeEvent,
	ComponentPropsWithoutRef,
	KeyboardEvent
} from "react";
import type { SliceStores } from "@/types";

// Components
import Input from "@/components/ui/input";

type DrawingToolbarRangeConfigProps = Omit<
	ComponentPropsWithoutRef<"input">,
	"value" | "onChange" | "disabled"
> & {
	label: string;
	selector: (state: SliceStores) => number;
	onFinalizedChange?: (value: number) => void;
};

function DrawingToolbarRangeConfig({
	label,
	selector,
	onFinalizedChange,
	min,
	max,
	step,
	...props
}: DrawingToolbarRangeConfigProps) {
	const [configValue, setConfigValue] = useState<number>(useStore(selector));
	const [isEditing, setIsEditing] = useState<boolean>(false);

	function onDoubleClick() {
		setIsEditing(true);
	}

	function onUpdate() {
		setIsEditing(false);
		onFinalizedChange?.(configValue);
	}

	function onEnterPress(e: KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			onUpdate();
		}
	}

	function onChange(e: ChangeEvent<HTMLInputElement>) {
		const value = Number(e.target.value);
		const minNum = Number(min ?? 0);
		const maxNum = Number(max ?? 100);
		setConfigValue(Math.max(Math.min(value, maxNum), minNum));
	}

	return (
		<>
			<span className="text-sm">{label}</span>
			<input
				className="mx-2"
				value={configValue}
				onChange={onChange}
				onMouseUp={onUpdate}
				disabled={isEditing}
				min={min}
				max={max}
				step={step}
				{...props}
			/>
			{isEditing ? (
				<Input
					className="mx-2 w-12 h-[100%] border-b text-sm outline-none"
					autoFocus
					value={configValue}
					onChange={onChange}
					onBlur={onUpdate}
					onKeyDown={onEnterPress}
				/>
			) : (
				<span
					className="text-sm mx-2"
					onDoubleClick={onDoubleClick}
				>
					{configValue}
				</span>
			)}
		</>
	);
}

export default DrawingToolbarRangeConfig;
