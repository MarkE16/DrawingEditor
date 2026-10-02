import { ChevronDown as LucideChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

const ArrowDown = (props: ComponentProps<"svg">) => (
	<LucideChevronDown
		size="1em"
		{...props}
	/>
);

export default ArrowDown;
