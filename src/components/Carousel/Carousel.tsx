import { useCallback, useEffect, useRef, useState } from "react";
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
  const extendedSlides: CarouselSlide[] =
    count >= 3 ? [slides[count - 1], ...slides, slides[0]] : [];
  const total = extendedSlides.length;
  const slideStep = cardWidth + gap;

  const [index, setIndex] = useState(1);
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

  const goNext = useCallback(() => {
    goTo(index + 1, true);
  }, [index, goTo]);

  const goPrev = useCallback(() => {
    goTo(index - 1, true);
  }, [index, goTo]);

  useEffect(() => {
    if (count < 3 || autoPlayInterval <= 0 || isPaused) {
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
  }, [count, autoPlayInterval, isPaused, index, goNext]);

  const handleTransitionEnd = useCallback(() => {
    if (index === 0) {
      goTo(count, false);
    } else if (index === total - 1) {
      goTo(1, false);
    }
  }, [index, count, total, goTo]);

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
      className={`overflow-hidden select-none ${className}`}
      style={{
        width: viewportWidth,
        height: viewportHeight,
        maxWidth: "100%",
      }}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex h-full"
        style={{
          width: "max-content",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "pan-y",
          userSelect: "none",
          transform: `translate3d(${translateX}px, 0, 0)`,
          transition: noTransition
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
