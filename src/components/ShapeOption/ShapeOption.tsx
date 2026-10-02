// Lib
import * as Utils from "@/lib/utils";
import cn from "@/lib/tailwind-utils";
import useStore from "@/state/hooks/useStore";

// Types
import type { Shape } from "@/types";
import type { ReactElement } from "react";

// Components
import Tooltip from "@/components/Tooltip/Tooltip";

type ShapeOptionProps = Readonly<{
	icon: ReactElement;
	name: Shape;
	isActive: boolean;
}>;

function ShapeOption({ icon, name, isActive }: ShapeOptionProps) {
	const changeShape = useStore((state) => state.changeShape);

	const handleShapeChange = () => {
		changeShape(name);
	};

	return (
		<Tooltip
			text={Utils.capitalize(name)}
			position="bottom"
		>
			<button
				className={cn(
					"border-none inline-flex justify-center items-center bg-transparent w-[30px] h-[30px] rounded-full mx-[0.5em] my-0 cursor-pointer transition-colors duration-100 hover:bg-[#505050]",
					{
						"bg-[#505050] outline outline-[3px] outline-[#7e83da] outline-offset-[2px]":
							isActive
					}
				)}
				onClick={handleShapeChange}
				data-testid={`shape-${name}`}
			>
				{icon}
			</button>
		</Tooltip>
	);
}

export default ShapeOption;
