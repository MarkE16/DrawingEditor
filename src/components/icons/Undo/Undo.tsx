import { RotateCcw as LucideRotateCcw } from "lucide-react";
import type { ComponentProps } from "react";

const Undo = (props: ComponentProps<"svg">) => (
	<LucideRotateCcw
		size="1em"
		{...props}
	/>
);

export default Undo;
