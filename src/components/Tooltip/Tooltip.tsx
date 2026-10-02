// Components
import {
	Provider as TooltipProvider,
	Root as TooltipRoot,
	Trigger as TooltipTrigger,
	Portal as TooltipPortal,
	Content as TooltipContent,
	Arrow as TooltipArrow
} from "@radix-ui/react-tooltip";
import cn from "@/lib/tailwind-utils";

// Types
import type { FC, ReactNode } from "react";

type TooltipProps = {
	text: string;
	position?: "top" | "bottom" | "left" | "right";
	arrow?: boolean;
	children: ReactNode;
};

const Tooltip: FC<TooltipProps> = ({
	children,
	text,
	position = "top",
	arrow = true
}) => {
	const animationClass = () => {
		switch (position) {
			case "top":
				return "animate-tooltip-slide-down";
			case "right":
				return "animate-tooltip-slide-left";
			case "bottom":
				return "animate-tooltip-slide-up";
			case "left":
				return "animate-tooltip-slide-right";
			default:
				return "animate-tooltip-slide-down";
		}
	};

	return (
		<TooltipProvider>
			<TooltipRoot delayDuration={100}>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipPortal>
					<TooltipContent
						side={position}
						className={cn(
							"z-[999] rounded px-2 py-1 text-sm leading-none text-white bg-[#3e3e3e] border border-[#242424]",
							"shadow-[0_10px_38px_-10px_rgba(22,23,24,0.35),0_10px_20px_-15px_rgba(22,23,24,0.2)]",
							"will-change-[transform,opacity]",
							"select-none",
							animationClass()
						)}
						sideOffset={5}
					>
						{text}
						{arrow && <TooltipArrow className="fill-[#3e3e3e]" />}
					</TooltipContent>
				</TooltipPortal>
			</TooltipRoot>
		</TooltipProvider>
	);
};

export default Tooltip;
