// Components
import { ColorThumb as AriaColorThumb } from "react-aria-components";
import cn from "@/lib/tailwind-utils";

// Types
import type { ComponentProps, ReactNode } from "react";

function ColorThumb({ className, ...props }: ComponentProps<"div">): ReactNode {
	return (
		<AriaColorThumb
			className={cn(
				"border-2 border-white shadow-[0_0_0_1px_black,inset_0_0_0_1px_black] w-5 h-5 rounded-full box-border data-[focus-visible]:w-6 data-[focus-visible]:h-6",
				className
			)}
			{...props}
		/>
	);
}

export default ColorThumb;
