import { Maximize as LucideMaximize } from "lucide-react";
import type { ComponentProps } from "react";

const Fullscreen = (props: ComponentProps<"svg">) => (
	<LucideMaximize
		size="1em"
		{...props}
	/>
);

export default Fullscreen;
