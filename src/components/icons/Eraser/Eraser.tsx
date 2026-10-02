import { Eraser as LucideEraser } from "lucide-react";
import type { ComponentProps } from "react";

const Eraser = (props: ComponentProps<"svg">) => (
	<LucideEraser
		size="1em"
		{...props}
	/>
);

export default Eraser;
