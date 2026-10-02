import { getCookie } from "@/lib/utils";
import {
	ReactNode,
	createContext,
	useState,
	useEffect,
	useMemo,
	useCallback
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeContext = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContext>({
	theme: "light",
	setTheme: () => {}
});

type ThemeProviderProps = {
	children: ReactNode;
	initialTheme?: Theme;
	key?: string;
};

function ThemeProvider({
	children,
	initialTheme = "dark",
	key = "id-theme"
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window === "undefined") {
			return initialTheme;
		}

		const storedTheme = getCookie(key);
		if (storedTheme) {
			return storedTheme as Theme;
		}
		return initialTheme;
	});

	useEffect(() => {
		const root = document.documentElement;

		root.classList.remove("light", "dark", "system");

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";

			root.classList.add(systemTheme);
		} else {
			root.classList.add(theme);
		}

		return () => {
			root.classList.remove("light", "dark", "system");
		};
	}, [theme]);

	const updateTheme = useCallback(
		(theme: Theme) => {
			document.cookie = `${key}=${theme}; path=/; max-age=31536000; secure; samesite=strict`;
			setTheme(theme);
		},
		[key]
	);

	const value = useMemo(
		() => ({
			theme,
			setTheme: updateTheme
		}),
		[theme, updateTheme]
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export { ThemeProvider, ThemeContext };
