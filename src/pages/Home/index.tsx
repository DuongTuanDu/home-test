import { Carousel } from "@/components/Carousel";
import type { CarouselSlide } from "@/components/Carousel";

const HOME_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    title: "Trang chiếu 1",
    image: "https://picsum.photos/id/1015/600/300",
    landing_page: "https://example.com/landing1",
  },
  {
    id: 2,
    title: "Trang chiếu 2",
    image: "https://picsum.photos/id/1016/600/300",
    landing_page: "https://example.com/landing2",
  },
  {
    id: 3,
    title: "Trang chiếu 3",
    image: "https://picsum.photos/id/1018/600/300",
    landing_page: "https://example.com/landing3",
  },
  {
    id: 4,
    title: "Trang chiếu 4",
    image: "https://picsum.photos/id/1020/600/300",
    landing_page: "https://example.com/landing4",
  },
  {
    id: 5,
    title: "Trang chiếu 5",
    image: "https://picsum.photos/id/1022/600/300",
    landing_page: "https://example.com/landing5",
  },
  {
    id: 6,
    title: "Trang chiếu 6",
    image: "https://picsum.photos/id/1024/600/300",
    landing_page: "https://example.com/landing6",
  },
];

const HomePage = () => {
  return (
    <div className="w-full min-h-screen p-4 md:p-6 flex flex-col items-center">
      <h1 className="text-2xl font-semibold mb-6">Carousel mẫu</h1>
      <Carousel
        slides={HOME_CAROUSEL_SLIDES}
        viewportWidth={750}
        viewportHeight={300}
        cardWidth={300}
        cardHeight={300}
        autoPlayInterval={3000}
        minDragDistance={40}
        clickable
        className="rounded-xl border border-border shadow-sm"
      />
    </div>
  );
};

export default HomePage;
