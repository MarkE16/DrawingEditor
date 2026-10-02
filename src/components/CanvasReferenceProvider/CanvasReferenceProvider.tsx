import { createContext, useMemo, useState } from "react";

import type { Dispatch, ReactNode, SetStateAction } from "react";

const CanvasReferenceContext = createContext<{
	ref: HTMLCanvasElement | null;
	setRef: Dispatch<SetStateAction<HTMLCanvasElement | null>>;
} | null>(null);

type CanvasReferenceProviderProps = Readonly<{
	children: ReactNode;
}>;

function CanvasReferenceProvider({
	children
}: CanvasReferenceProviderProps): ReactNode {
	const [ref, setRef] = useState<HTMLCanvasElement | null>(null);

	const value = useMemo(() => ({ ref, setRef }), [ref]);

	return (
		<CanvasReferenceContext.Provider value={value}>
			{children}
		</CanvasReferenceContext.Provider>
	);
}

export { CanvasReferenceContext, CanvasReferenceProvider };
