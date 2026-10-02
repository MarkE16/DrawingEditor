import { ChevronUp as LucideChevronUp } from "lucide-react";
import type { ComponentProps } from "react";

const ArrowUp = (props: ComponentProps<"svg">) => (
	<LucideChevronUp
		size="1em"
		{...props}
	/>
);

export default ArrowUp;
