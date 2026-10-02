import { RotateCw as LucideRotateCw } from "lucide-react";
import type { ComponentProps } from "react";

const Redo = (props: ComponentProps<"svg">) => (
	<LucideRotateCw
		size="1em"
		{...props}
	/>
);

export default Redo;
