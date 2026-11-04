import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

// jsdom không có PointerEvent/TransitionEvent đầy đủ: clientX, pointerId, propertyName sẽ mất nếu không polyfill
if (!("PointerEvent" in window)) {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
    }
  }
  Object.defineProperty(window, "PointerEvent", { value: PointerEventPolyfill });
}

if (!("TransitionEvent" in window)) {
  class TransitionEventPolyfill extends Event {
    propertyName: string;
    constructor(type: string, init: TransitionEventInit = {}) {
      super(type, init);
      this.propertyName = init.propertyName ?? "";
    }
  }
  Object.defineProperty(window, "TransitionEvent", {
    value: TransitionEventPolyfill,
  });
}
