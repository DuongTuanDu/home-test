import { useCallback, useEffect, useRef, useState } from "react";
import { CarouselArrows } from "./CarouselArrows";
import type { CarouselProps, CarouselSlide } from "./types";

const DEFAULT_GAP = 16;
const DEFAULT_AUTO_PLAY = 3000;
const MIN_DRAG = 40;
const VIEWPORT_WIDTH = 750;
const VIEWPORT_HEIGHT = 300;
const CARD_WIDTH = 300;
const CARD_HEIGHT = 300;

export function Carousel({
  slides,
  gap = DEFAULT_GAP,
  autoPlayInterval = DEFAULT_AUTO_PLAY,
  minDragDistance = MIN_DRAG,
  viewportWidth = VIEWPORT_WIDTH,
  viewportHeight = VIEWPORT_HEIGHT,
  cardWidth = CARD_WIDTH,
  cardHeight = CARD_HEIGHT,
  clickable = true,
  className = "",
}: CarouselProps) {
  const count = slides.length;
  const slideStep = cardWidth + gap;
  // Số thẻ clone mỗi đầu: phải đủ lấp đầy viewport, nếu không cuối track sẽ trống rồi mới "nhảy"
  const clones =
    count >= 3
      ? Math.min(count, Math.ceil(viewportWidth / slideStep) + 1)
      : 0;
  const extendedSlides: CarouselSlide[] =
    count >= 3
      ? [...slides.slice(count - clones), ...slides, ...slides.slice(0, clones)]
      : [];
  const total = extendedSlides.length;

  const [index, setIndex] = useState(clones);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [noTransition, setNoTransition] = useState(false);
  const startXRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const dragBlockClickUntilRef = useRef(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((nextIndex: number, animate = true) => {
    if (!animate) {
      setNoTransition(true);
      setIndex(nextIndex);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setNoTransition(false));
      });
      return;
    }
    setNoTransition(false);
    setIndex(nextIndex);
  }, []);

  // Clamp để bấm/kéo nhanh liên tiếp không đẩy index ra ngoài track
  const step = useCallback(
    (dir: 1 | -1) => goTo(Math.max(0, Math.min(total - 1, index + dir))),
    [index, total, goTo],
  );

  const goNext = useCallback(() => step(1), [step]);
  const goPrev = useCallback(() => step(-1), [step]);

  useEffect(() => {
    if (count < 3 || autoPlayInterval <= 0 || isPaused || isDragging) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }
    autoPlayRef.current = setInterval(() => {
      goNext();
    }, autoPlayInterval);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [count, autoPlayInterval, isPaused, isDragging, index, goNext]);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      // Bỏ qua transition bubble lên từ thẻ con (hover opacity...)
      if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
      // Vùng clone giống hệt vùng thật dịch đi `count` thẻ → nhảy không thấy được
      if (index < clones) {
        goTo(index + count, false);
      } else if (index >= clones + count) {
        goTo(index - count, false);
      }
    },
    [index, clones, count, goTo],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    startXRef.current = e.clientX;
    hasDraggedRef.current = false;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - startXRef.current;
      if (Math.abs(delta) >= minDragDistance) hasDraggedRef.current = true;
      setDragOffset(delta);
    },
    [isDragging, minDragDistance],
  );

  const endDrag = useCallback(
    (delta: number) => {
      setIsDragging(false);
      if (Math.abs(delta) >= minDragDistance) {
        if (delta > 0) goPrev();
        else goNext();
        dragBlockClickUntilRef.current = Date.now() + 300;
      }
      setDragOffset(0);
    },
    [minDragDistance, goPrev, goNext],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    endDrag(dragOffset);
  }, [isDragging, dragOffset, endDrag]);

  const handlePointerLeave = useCallback(() => {
    if (isDragging) endDrag(dragOffset);
  }, [isDragging, dragOffset, endDrag]);

  const handleCardClick = useCallback(
    (slide: CarouselSlide) => {
      if (!clickable) return;
      if (hasDraggedRef.current || Date.now() < dragBlockClickUntilRef.current)
        return;
      if (slide.landing_page) {
        window.open(slide.landing_page, "_blank", "noopener,noreferrer");
      }
    },
    [clickable],
  );

  const translateX = -index * slideStep + dragOffset;

  if (count < 3) {
    return (
      <div
        className={className}
        style={{ width: viewportWidth, height: viewportHeight }}
      >
        <p className="text-muted-foreground">Cần tối thiểu 3 thẻ.</p>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        width: viewportWidth,
        height: viewportHeight,
        maxWidth: "100%",
      }}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
    >
      <CarouselArrows onPrev={goPrev} onNext={goNext} />
      <div
        ref={trackRef}
        className="flex h-full"
        style={{
          width: "max-content",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "pan-y",
          userSelect: "none",
          transform: `translate3d(${translateX}px, 0, 0)`,
          transition:
            noTransition || isDragging
              ? "none"
            : "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          willChange: "transform",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerLeave}
        onPointerLeave={handlePointerLeave}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedSlides.map((slide, i) => (
          <div
            key={`${slide.id}-${i}`}
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick(slide)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick(slide);
              }
            }}
            className="relative flex-shrink-0 overflow-hidden rounded-lg bg-muted transition-opacity hover:opacity-95 active:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{
              width: cardWidth,
              height: cardHeight,
              marginRight: i < total - 1 ? gap : 0,
            }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              draggable={false}
              className="h-full w-full object-cover pointer-events-none"
            />
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-sm font-medium"
              style={{ padding: "8px 12px" }}
            >
              {slide.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Carousel;
