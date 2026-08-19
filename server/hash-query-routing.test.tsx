// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Router, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { afterEach, describe, expect, it } from "vitest";

function CurrentRoute() {
  const [location] = useLocation();
  return <output data-testid="current-route">{location}</output>;
}

function renderRouteWithQuery(path: "/admin" | "/checkout") {
  window.history.replaceState({}, "", `/iago-modas/?verificacao=rota#${path}`);
  render(
    <Router hook={useHashLocation}>
      <CurrentRoute />
    </Router>,
  );
}

describe("rotas hash com parâmetros de consulta", () => {
  afterEach(() => cleanup());

  it("mantém a rota administrativa quando a URL possui query string", () => {
    renderRouteWithQuery("/admin");
    expect(screen.getByTestId("current-route").textContent).toBe("/admin");
  });

  it("mantém a rota de checkout quando a URL possui query string", () => {
    renderRouteWithQuery("/checkout");
    expect(screen.getByTestId("current-route").textContent).toBe("/checkout");
  });
});
