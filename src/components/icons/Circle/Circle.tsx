import { Circle as LucideCircle } from "lucide-react";
import type { ComponentProps } from "react";

const Circle = (props: ComponentProps<"svg">) => (
	<LucideCircle
		size="1em"
		{...props}
	/>
);

export default Circle;
