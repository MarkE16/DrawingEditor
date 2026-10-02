import { CanvasReferenceContext } from "@/components/CanvasReferenceProvider/CanvasReferenceProvider";
import { useContext } from "react";

function useCanvasRef() {
	const context = useContext(CanvasReferenceContext);

	if (!context) {
		throw new Error(
			"useCanvasRef must be used within a CanvasReferenceProvider"
		);
	}

	return context;
}

export default useCanvasRef;
