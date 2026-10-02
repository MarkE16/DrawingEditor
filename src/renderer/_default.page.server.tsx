export { render };
// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = [
	"pageProps",
	"urlPathname",
	"zustandState",
	"theme"
];

import { PageShell } from "./PageShell";
import { escapeInject } from "vite-plugin-ssr/server";
import logo from "@/assets/icons/IdeaDrawnNewLogo.png";
import type { PageContextServer } from "./types";
import { renderToStream } from "react-streaming/server";
import { initializeEditorStore } from "@/state/store";
import type { SliceStores } from "@/types";
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider";

async function render(pageContext: PageContextServer) {
	const { Page, pageProps, theme } = pageContext;
	// This render() hook only supports SSR, see https://vite-plugin-ssr.com/render-modes for how to modify render() to support SPA
	if (!Page)
		throw new Error("My render() hook expects pageContext.Page to be defined");

	const store = initializeEditorStore();
	const preloadedState = store.getState();
	const stateWithoutFunctions: Partial<SliceStores> = Object.fromEntries(
		Object.entries(preloadedState).filter(
			([, value]) => typeof value !== "function"
		)
	);

	pageContext.zustandState = stateWithoutFunctions;

	const html = await renderToStream(
		<ThemeProvider initialTheme={theme}>
			<PageShell pageContext={pageContext}>
				<Page {...pageProps} />
			</PageShell>
		</ThemeProvider>
	);

	// See https://vite-plugin-ssr.com/head
	const { documentProps } = pageContext.exports;
	const title = (documentProps && documentProps.title) || "Live Canvas";
	const desc =
		(documentProps && documentProps.description) ||
		"App using Vite + vite-plugin-ssr";

	// escapeInject is a helper function to escape HTML injections
	// which is common with XXS attacks.
	const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${logo}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
      </head>
      <body class="${theme === "dark" ? "dark" : ""}">
        <div id="entry">${html as unknown as ReadableStream}</div>
      </body>
    </html>`;

	return {
		documentHtml,
		pageContext: {
			// We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
			zustandState: stateWithoutFunctions
		}
	};
}
