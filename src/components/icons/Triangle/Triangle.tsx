import { Triangle as LucideTriangle } from "lucide-react";
import type { ComponentProps } from "react";

const Triangle = (props: ComponentProps<"svg">) => (
	<LucideTriangle
		size="1em"
		{...props}
	/>
);

export default Triangle;
