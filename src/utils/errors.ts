export function toText(input: unknown, fallback = "Đã xảy ra lỗi."): string {
  if (input == null) return fallback;

  // Nếu đã là string
  if (typeof input === "string") return input;

  // Nếu là Error chuẩn
  if (input instanceof Error) return input.message || fallback;

  // Nếu là object có field message (chuỗi hoặc lồng object)
  if (typeof input === "object" && "message" in (input as any)) {
    return toText((input as any).message, fallback);
  }

  // RTK Query: FetchBaseQueryError có thể là { data: { message } } hoặc { error: '...' }
  const err = input as any;
  if (err?.data?.message) return toText(err.data.message, fallback);
  if (err?.error) return toText(err.error, fallback);

  // Fallback cuối cùng
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}
