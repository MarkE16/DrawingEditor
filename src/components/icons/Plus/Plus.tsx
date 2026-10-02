import { Plus as LucidePlus } from "lucide-react";
import type { ComponentProps } from "react";

const Plus = (props: ComponentProps<"svg">) => (
	<LucidePlus
		size="1em"
		{...props}
	/>
);

export default Plus;
