import { CloudUpload as LucideCloudUpload } from "lucide-react";
import type { ComponentProps } from "react";

const CloudUpload = (props: ComponentProps<"svg">) => (
	<LucideCloudUpload
		size="1em"
		{...props}
	/>
);

export default CloudUpload;
