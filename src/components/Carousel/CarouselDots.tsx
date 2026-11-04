interface CarouselDotsProps {
  count: number;
  /** Index hiện tại trong track mở rộng (đã gồm clone) */
  index: number;
  /** Số thẻ clone ở mỗi đầu */
  clones: number;
  onSelect: (trackIndex: number) => void;
}

export function CarouselDots({
  count,
  index,
  clones,
  onSelect,
}: CarouselDotsProps) {
  // Ở vùng clone index nằm ngoài [clones, clones + count) nên phải quy về chỉ số thật
  const active = (((index - clones) % count) + count) % count;

  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Đến slide ${i + 1}`}
          aria-current={i === active}
          onClick={() => onSelect(clones + i)}
          className={`h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            i === active
              ? "w-5 bg-foreground"
              : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/70"
          }`}
        />
      ))}
    </div>
  );
}
