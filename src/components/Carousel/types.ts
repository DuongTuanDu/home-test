export interface CarouselSlide {
  id: number;
  title: string;
  image: string;
  landing_page: string;
}

export interface CarouselProps {
  slides: CarouselSlide[];
  /** Khoảng cách giữa các thẻ (px). Mặc định 16 */
  gap?: number;
  /** Tự động trượt mỗi N ms. Mặc định 3000. Đặt 0 để tắt */
  autoPlayInterval?: number;
  /** Khoảng kéo tối thiểu (px) để kích hoạt trượt. Mặc định 40 */
  minDragDistance?: number;
  /** Chiều rộng viewport (px). Mặc định 750 */
  viewportWidth?: number;
  /** Chiều cao viewport (px). Mặc định 300 */
  viewportHeight?: number;
  /** Kích thước thẻ: rộng x cao (px). Mặc định 300x300 */
  cardWidth?: number;
  cardHeight?: number;
  /** Có cho phép click mở landing_page không. Mặc định true */
  clickable?: boolean;
  /** className bổ sung cho container */
  className?: string;
}
