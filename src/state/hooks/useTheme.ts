import { useContext } from "react";
import { ThemeContext } from "@/components/ThemeProvider/ThemeProvider";

function useTheme() {
	return useContext(ThemeContext);
}

export default useTheme;
