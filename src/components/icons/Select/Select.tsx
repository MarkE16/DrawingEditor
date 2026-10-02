import { MousePointer2 as LucideMousePointer2 } from "lucide-react";
import type { ComponentProps } from "react";

const Select = (props: ComponentProps<"svg">) => (
	<LucideMousePointer2
		size="1em"
		{...props}
	/>
);

export default Select;
