import { RefreshCw as LucideRefreshCw } from "lucide-react";
import type { ComponentProps } from "react";

const Rotate = (props: ComponentProps<"svg">) => (
	<LucideRefreshCw
		size="1em"
		{...props}
	/>
);

export default Rotate;
