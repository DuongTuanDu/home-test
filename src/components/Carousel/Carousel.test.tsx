import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Carousel } from "./Carousel";
import type { CarouselSlide } from "./types";

// Với viewport 750 + thẻ 300 + gap 16: slideStep = 316, clones = min(5, ceil(750/316)+1) = 4
const STEP = 316;
const CLONES = 4;
const COUNT = 5;

const makeSlides = (n: number): CarouselSlide[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    title: `Slide ${i + 1}`,
    image: `/img-${i + 1}.png`,
    landing_page: `https://example.com/${i + 1}`,
  }));

const getTrack = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[style*="translate3d"]')!;

/** Index hiện tại của track suy ra từ translateX (khi không có drag offset) */
const getIndex = (container: HTMLElement) => {
  const match = getTrack(container).style.transform.match(
    /translate3d\((-?[\d.]+)px/,
  );
  return Math.round(-Number(match![1]) / STEP);
};

const finishTransition = (container: HTMLElement) =>
  fireEvent.transitionEnd(getTrack(container), { propertyName: "transform" });

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

// Mỗi tick một act riêng: effect autoplay tạo lại interval sau mỗi lần index đổi
const tick = (times: number, ms = 1000) => {
  for (let i = 0; i < times; i++) advance(ms);
};

const drag = (container: HTMLElement, from: number, to: number) => {
  const track = getTrack(container);
  fireEvent.pointerDown(track, { clientX: from, pointerId: 1 });
  fireEvent.pointerMove(track, { clientX: to, pointerId: 1 });
  fireEvent.pointerUp(track, { clientX: to, pointerId: 1 });
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("Carousel", () => {
  describe("count < 3", () => {
    it.each([0, 1, 2])("hiện thông báo khi có %i slide", (n) => {
      const { container } = render(<Carousel slides={makeSlides(n)} />);
      expect(screen.getByText("Cần tối thiểu 3 thẻ.")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(container.querySelector('[style*="translate3d"]')).toBeNull();
    });

    it("không autoplay khi count < 3", () => {
      render(<Carousel slides={makeSlides(2)} autoPlayInterval={1000} />);
      expect(vi.getTimerCount()).toBe(0);
    });

    it("count = 3 render carousel, không hiện thông báo", () => {
      render(<Carousel slides={makeSlides(3)} />);
      expect(screen.queryByText("Cần tối thiểu 3 thẻ.")).not.toBeInTheDocument();
      expect(screen.getAllByRole("button").length).toBeGreaterThan(3);
    });
  });

  describe("autoplay", () => {
    it("bắt đầu ở slide thật đầu tiên (sau vùng clone)", () => {
      const { container } = render(<Carousel slides={makeSlides(COUNT)} />);
      expect(getIndex(container)).toBe(CLONES);
    });

    it("tiến 1 slide sau mỗi autoPlayInterval", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={1000} />,
      );
      advance(999);
      expect(getIndex(container)).toBe(CLONES);
      advance(1);
      expect(getIndex(container)).toBe(CLONES + 1);
      advance(1000);
      expect(getIndex(container)).toBe(CLONES + 2);
    });

    it("dùng mặc định 3000ms", () => {
      const { container } = render(<Carousel slides={makeSlides(COUNT)} />);
      advance(2999);
      expect(getIndex(container)).toBe(CLONES);
      advance(1);
      expect(getIndex(container)).toBe(CLONES + 1);
    });

    it("autoPlayInterval = 0 thì tắt autoplay", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={0} />,
      );
      advance(30_000);
      expect(getIndex(container)).toBe(CLONES);
    });

    it("tạm dừng khi hover và chạy lại khi rời chuột", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={1000} />,
      );
      const viewport = container.firstElementChild!;
      fireEvent.pointerEnter(viewport);
      advance(5000);
      expect(getIndex(container)).toBe(CLONES);

      fireEvent.pointerLeave(viewport);
      advance(1000);
      expect(getIndex(container)).toBe(CLONES + 1);
    });

    it("dọn interval khi unmount", () => {
      const { unmount } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={1000} />,
      );
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("wrap-around", () => {
    it("đi qua slide cuối: vào clone cuối rồi nhảy không animation về slide đầu", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={1000} />,
      );
      tick(COUNT);
      // đang ở clone của slide 1
      expect(getIndex(container)).toBe(CLONES + COUNT);

      finishTransition(container);
      expect(getIndex(container)).toBe(CLONES);
      expect(getTrack(container).style.transition).toBe("none");

      // rAF đôi bật lại transition
      advance(50);
      expect(getTrack(container).style.transition).toContain("transform");
    });

    it("lùi qua slide đầu: vào clone đầu rồi nhảy về slide cuối", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={0} />,
      );
      drag(container, 100, 300); // kéo sang phải => prev
      expect(getIndex(container)).toBe(CLONES - 1);

      finishTransition(container);
      expect(getIndex(container)).toBe(CLONES - 1 + COUNT);
      expect(getTrack(container).style.transition).toBe("none");
    });

    it("không nhảy khi vẫn ở trong vùng slide thật", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={1000} />,
      );
      advance(1000);
      finishTransition(container);
      expect(getIndex(container)).toBe(CLONES + 1);
    });

    it("bỏ qua transitionend không phải của transform", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={1000} />,
      );
      tick(COUNT);
      fireEvent.transitionEnd(getTrack(container), { propertyName: "opacity" });
      expect(getIndex(container)).toBe(CLONES + COUNT);
    });

    it("quay vòng nhiều chu kỳ vẫn nằm trong vùng slide thật", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={1000} />,
      );
      for (let i = 0; i < COUNT * 3; i++) {
        advance(1000);
        finishTransition(container);
        advance(50);
        const idx = getIndex(container);
        expect(idx).toBeGreaterThanOrEqual(CLONES);
        expect(idx).toBeLessThan(CLONES + COUNT);
      }
    });
  });

  describe("kéo / swipe", () => {
    it("kéo sang trái >= minDragDistance thì sang slide kế", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={0} />,
      );
      drag(container, 300, 300 - 40);
      expect(getIndex(container)).toBe(CLONES + 1);
    });

    it("kéo sang phải >= minDragDistance thì về slide trước", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={0} />,
      );
      drag(container, 300, 300 + 40);
      expect(getIndex(container)).toBe(CLONES - 1);
    });

    it("kéo < minDragDistance thì giữ nguyên slide", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={0} />,
      );
      drag(container, 300, 300 - 39);
      expect(getIndex(container)).toBe(CLONES);
    });

    it("tôn trọng minDragDistance tuỳ chỉnh", () => {
      const { container } = render(
        <Carousel
          slides={makeSlides(COUNT)}
          autoPlayInterval={0}
          minDragDistance={100}
        />,
      );
      drag(container, 300, 220);
      expect(getIndex(container)).toBe(CLONES);
      drag(container, 300, 190);
      expect(getIndex(container)).toBe(CLONES + 1);
    });

    it("track bám theo con trỏ khi đang kéo", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={0} />,
      );
      const track = getTrack(container);
      fireEvent.pointerDown(track, { clientX: 300, pointerId: 1 });
      fireEvent.pointerMove(track, { clientX: 250, pointerId: 1 });
      expect(track.style.transform).toBe(
        `translate3d(${-CLONES * STEP - 50}px, 0, 0)`,
      );
      expect(track.style.transition).toBe("none");
    });

    it("autoplay tạm dừng trong lúc kéo", () => {
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={1000} />,
      );
      fireEvent.pointerDown(getTrack(container), { clientX: 300, pointerId: 1 });
      advance(5000);
      expect(getIndex(container)).toBe(CLONES);
    });
  });

  describe("click", () => {
    it("click mở landing_page ở tab mới", () => {
      const open = vi.spyOn(window, "open").mockImplementation(() => null);
      render(<Carousel slides={makeSlides(COUNT)} autoPlayInterval={0} />);
      fireEvent.click(screen.getAllByAltText("Slide 1")[0].parentElement!);
      expect(open).toHaveBeenCalledWith(
        "https://example.com/1",
        "_blank",
        "noopener,noreferrer",
      );
    });

    it("click ngay sau khi kéo bị chặn, sau 300ms thì hoạt động lại", () => {
      const open = vi.spyOn(window, "open").mockImplementation(() => null);
      const { container } = render(
        <Carousel slides={makeSlides(COUNT)} autoPlayInterval={0} />,
      );
      const card = screen.getAllByAltText("Slide 1")[0].parentElement!;
      drag(container, 300, 200);
      fireEvent.click(card);
      expect(open).not.toHaveBeenCalled();

      // pointerdown mới reset hasDragged; chờ hết cửa sổ chặn 300ms
      fireEvent.pointerDown(getTrack(container), { clientX: 0, pointerId: 1 });
      fireEvent.pointerUp(getTrack(container), { clientX: 0, pointerId: 1 });
      advance(301);
      fireEvent.click(card);
      expect(open).toHaveBeenCalledTimes(1);
    });

    it("clickable=false thì không mở link", () => {
      const open = vi.spyOn(window, "open").mockImplementation(() => null);
      render(
        <Carousel
          slides={makeSlides(COUNT)}
          autoPlayInterval={0}
          clickable={false}
        />,
      );
      fireEvent.click(screen.getAllByAltText("Slide 1")[0].parentElement!);
      expect(open).not.toHaveBeenCalled();
    });
  });
});
