import { describe, expect, it } from "vitest";

import { act } from "@testing-library/react";

import useTheme from "@/state/hooks/useTheme";
import { renderHookWithProviders } from "../test-utils";

describe("useTheme functionality", () => {
	it("should be dark by default", () => {
		const { result } = renderHookWithProviders(() => useTheme());

		expect(result.current.theme).toBe("dark");
	});

	it("should update the theme", () => {
		const { result } = renderHookWithProviders(() => useTheme());

		act(() => {
			// Update the theme to light
			result.current.setTheme("light");
		});

		expect(result.current.theme).toBe("light");

		act(() => {
			// Update the theme back to dark
			result.current.setTheme("dark");
		});

		expect(result.current.theme).toBe("dark");
	});
});
