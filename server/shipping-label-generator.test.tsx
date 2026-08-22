// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

import { ShippingLabelGenerator } from "../client/src/components/ShippingLabelGenerator";

const printWindow = {
  opener: window,
  document: {
    open: vi.fn(),
    write: vi.fn(),
    close: vi.fn(),
  },
  focus: vi.fn(),
  print: vi.fn(),
  addEventListener: vi.fn(),
};

 describe("gerador de etiqueta dos Correios", () => {
  let downloadedFile = "";
  let createObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    downloadedFile = "";
    window.sessionStorage.clear();
    createObjectURL = vi.fn(() => "blob:https://iagomodas.example/label");
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL: vi.fn() });
    vi.spyOn(window, "open").mockReturnValue(printWindow as never);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function click(this: HTMLAnchorElement) {
      downloadedFile = this.download;
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("baixa um HTML da etiqueta antes de abrir a impressão", () => {
    render(<ShippingLabelGenerator />);

    fireEvent.change(screen.getByPlaceholderText("Ex.: IM-2026-001"), { target: { value: "IM-260822-7D5024" } });
    fireEvent.submit(screen.getByRole("button", { name: /baixar e imprimir etiqueta/i }).closest("form")!);

    expect(downloadedFile).toBe("etiqueta-IM-260822-7D5024.html");
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(window.open).toHaveBeenCalledWith("", "_blank");
    expect(printWindow.document.write).toHaveBeenCalledWith(expect.stringContaining("Etiqueta de endereço"));
    expect(printWindow.addEventListener).toHaveBeenCalledWith("load", expect.any(Function), { once: true });
    expect(screen.getByRole("status").textContent).toContain("Etiqueta baixada e aberta para impressão");
  });
});
