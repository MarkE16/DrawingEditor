export { render };

import { hydrateRoot } from "react-dom/client";
import { PageShell } from "./PageShell";
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider";
import type { PageContextClient } from "./types";
import "./index.css";

// This render() hook only supports SSR, see https://vite-plugin-ssr.com/render-modes for how to modify render() to support SPA
async function render(pageContext: PageContextClient) {
	const { Page, pageProps, theme } = pageContext;
	if (!Page)
		throw new Error(
			"Client-side render() hook expects pageContext.Page to be defined"
		);
	const root = document.getElementById("entry");
	if (!root) throw new Error("DOM element #entry not found");

	hydrateRoot(
		root,
		<ThemeProvider initialTheme={theme}>
			<PageShell pageContext={pageContext}>
				<Page {...pageProps} />
			</PageShell>
		</ThemeProvider>
	);
}

// Note from developer: we shouldn't have to think about switching to
// client-side routing, so this should be commented out. However,
// if we do need to switch to client-side routing, we can uncomment this.
// So, keep this here.

/* To enable Client-side Routing:
export const clientRouting = true
// !! WARNING !! Before doing so, read https://vite-plugin-ssr.com/clientRouting */
