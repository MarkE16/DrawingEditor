import {
	Square as LucideSquare,
	SquareDashed as LucideSquareDashed
} from "lucide-react";
import type { ComponentProps } from "react";

const Square = ({
	dashed = false,
	...props
}: ComponentProps<"svg"> & { dashed?: boolean }) =>
	!dashed ? (
		<LucideSquare
			size="1em"
			{...props}
		/>
	) : (
		<LucideSquareDashed
			size="1em"
			{...props}
		/>
	);

export default Square;
