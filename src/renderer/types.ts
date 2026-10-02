export type { PageContextServer };
export type { PageContextClient };
export type { PageContext };
export type { PageProps };

import { SliceStores } from "@/types";
import type {
	PageContextBuiltInServer,
	/*
  // When using Client Routing https://vite-plugin-ssr.com/clientRouting
  PageContextBuiltInClientWithClientRouting as PageContextBuiltInClient
  /*/
	// When using Server Routing
	PageContextBuiltInClientWithServerRouting as PageContextBuiltInClient
	//*/
} from "vite-plugin-ssr/types";

type Page = (pageProps: PageProps) => React.ReactElement;
type PageProps = Record<string, unknown>;

export type PageContextCustom = {
	Page: Page;
	pageProps?: PageProps;
	urlPathname: string;
	zustandState: Partial<SliceStores>;
	theme: "light" | "dark" | "system";
	exports: {
		documentProps?: {
			title?: string;
			description?: string;
		};
	};
};

type PageContextServer = PageContextBuiltInServer<Page> & PageContextCustom;
type PageContextClient = PageContextBuiltInClient<Page> & PageContextCustom;

type PageContext = PageContextClient | PageContextServer;
