import { Check as LucideCheck } from "lucide-react";
import type { ComponentProps } from "react";

const Checkmark = (props: ComponentProps<"svg">) => (
	<LucideCheck
		size="1em"
		{...props}
	/>
);

export default Checkmark;
