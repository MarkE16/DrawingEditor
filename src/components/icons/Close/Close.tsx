import { XIcon as LucideXIcon } from "lucide-react";
import type { ComponentProps } from "react";

const Close = (props: ComponentProps<"svg">) => (
	<LucideXIcon
		size="1em"
		{...props}
	/>
);

export default Close;
