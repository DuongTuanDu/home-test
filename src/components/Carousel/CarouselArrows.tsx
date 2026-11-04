interface CarouselArrowsProps {
  onPrev: () => void;
  onNext: () => void;
}

const buttonClass =
  "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function CarouselArrows({ onPrev, onNext }: CarouselArrowsProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Slide trước"
        className={`${buttonClass} left-2`}
        onClick={onPrev}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Slide sau"
        className={`${buttonClass} right-2`}
        onClick={onNext}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </>
  );
}
