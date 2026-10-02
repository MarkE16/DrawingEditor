import { FlipVertical2 as LucideFlipVertical2 } from "lucide-react";
import type { ComponentProps } from "react";

const Flip = (props: ComponentProps<"svg">) => (
	<LucideFlipVertical2
		size="1em"
		{...props}
	/>
);

export default Flip;
