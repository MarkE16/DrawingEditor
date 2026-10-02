import { usePageContext } from "@/renderer/usePageContext";

/**
 * Returns the initial state of the editor.
 * Note that this hook serves to only be used
 * in the context of performing hydration.
 * It should not be used for general usage.
 * @returns The initial state.
 */
function useInitialEditorState() {
	const { zustandState } = usePageContext();
	return zustandState;
}

export default useInitialEditorState;
