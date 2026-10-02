module.exports = {
	rules: {
		"react-refresh/only-export-components": "warn",
		"react/prop-types": "off"
	},
	reportUnusedDisableDirectives: true,
	ignorePatterns: [
		"dist/*",
		"renderer/*",
		"coverage/*",
		"*.config.js",
		"*.config.ts",
		"src/tests/test-utils.tsx"
	],
	env: { browser: true, es2020: true, node: true },
	parserOptions: { ecmaVersion: "latest", sourceType: "module" },
	settings: { react: { version: "detect" } },
	plugins: ["react-refresh"],
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:react-hooks/recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier"
	],
	parser: "@typescript-eslint/parser"
};
