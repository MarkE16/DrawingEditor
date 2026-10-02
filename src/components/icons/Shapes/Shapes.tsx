import { Shapes as LucideShapes } from "lucide-react";
import type { ComponentProps } from "react";

const Shapes = (props: ComponentProps<"svg">) => (
	<LucideShapes
		size="1em"
		{...props}
	/>
);

export default Shapes;
