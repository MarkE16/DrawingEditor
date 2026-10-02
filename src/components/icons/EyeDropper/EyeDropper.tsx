import { Pipette as LucidePipette } from "lucide-react";
import type { ComponentProps } from "react";

const EyeDropper = (props: ComponentProps<"svg">) => (
	<LucidePipette
		size="1em"
		{...props}
	/>
);

export default EyeDropper;
