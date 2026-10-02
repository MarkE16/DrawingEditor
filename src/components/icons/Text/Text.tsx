import { Type as LucideType } from "lucide-react";
import type { ComponentProps } from "react";

const Text = (props: ComponentProps<"svg">) => (
	<LucideType
		size="1em"
		{...props}
	/>
);

export default Text;
