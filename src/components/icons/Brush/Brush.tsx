import { Brush as LucideBrush } from "lucide-react";
import type { ComponentProps } from "react";

const Brush = (props: ComponentProps<"svg">) => (
	<LucideBrush
		size="1em"
		{...props}
	/>
);

export default Brush;
