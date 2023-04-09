import React, { useEffect, useRef, useState } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  images: string[];
  children?: React.ReactNode;
}
const Carousel = (props: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const isHoverImage = useRef(false);
  const ZindexRef = useRef('z-[3]');
  const [startX, setStartX] = useState(0);
  const [endX, setEndX] = useState(0);
  const onNext = (e?) => {
    if (e) e.preventDefault();
    const nextIndex = currentIndexRef.current === props.images.length - 1 ? 0 : currentIndexRef.current + 1;
    currentIndexRef.current = nextIndex;
    setCurrentIndex(currentIndexRef.current);
    ZindexRef.current = 'z-[3]';
  };
  const onPrev = (e?) => {
    if (e) e.preventDefault();
    const nextIndex = currentIndexRef.current === 0 ? props.images.length - 1 : currentIndexRef.current - 1;
    currentIndexRef.current = nextIndex;
    setCurrentIndex(currentIndexRef.current);
    ZindexRef.current = 'z-[0]';
  };
  const onAimatedCondition = (index: number) => {
    if (index === currentIndexRef.current) return 'transform  translate-x-0 z-[2]';
    if (index === currentIndexRef.current + 1 || (props.images.length - 1 === currentIndexRef.current && index === 0))
      return 'transform  translate-x-full z-[1] ';
    return `transform  -translate-x-full ${ZindexRef.current}`;
  };

  const handleTouchStart = (e) => {
    isHoverImage.current = true;
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    isHoverImage.current = false;
    const translateX = endX - startX;
    if (endX === 0) return;
    if (translateX > 0) {
      onPrev(e);
    } else {
      onNext(e);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      !isHoverImage.current && onNext();
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const BottomItems = () => {
    return (
      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 space-x-3">
        {props.images.map((image, index) => (
          <button
            onClick={() => {
              currentIndexRef.current < index ? (ZindexRef.current = 'z-[3]') : (ZindexRef.current = 'z-[0]');
              currentIndexRef.current = index;
              setCurrentIndex(currentIndexRef.current);
            }}
            key={`${index}-slider`}
            type="button"
            className={`h-3 w-3 rounded-full  ${index !== currentIndexRef.current ? 'bg-white/30' : 'bg-white'} `}
            aria-current="true"
            aria-label="Slide 1"
            data-carousel-slide-to="0"
          ></button>
        ))}
      </div>
    );
  };

  return (
    <div
      className="relative min-h-[30vh] min-w-[30vw] text-white "
      onMouseEnter={() => (isHoverImage.current = true)}
      onMouseLeave={() => (isHoverImage.current = false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-56 overflow-hidden rounded-lg  md:h-96">
        {props.images.map((image, index) => (
          <div
            key={`${index + image}-img`}
            className={`${onAimatedCondition(index)} absolute  top-0 h-full w-full transition duration-700 ease-in-out`}
          >
            <img
              className=" absolute top-1/2 left-1/2 block w-full -translate-x-1/2 -translate-y-1/2 "
              alt="..."
              src={image}
            />
          </div>
        ))}
      </div>
      <BottomItems />

      <button
        onClick={onPrev}
        type="button"
        className="group absolute top-0 left-0 z-20  flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
        data-carousel-prev
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-orange-500 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-4 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70">
          <svg
            aria-hidden="true"
            className="h-6 w-6 "
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>
      <button
        onClick={onNext}
        type="button"
        className="group absolute top-0 right-0 z-20  flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
        data-carousel-next
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-orange-500  group-hover:bg-white/50 group-focus:outline-none group-focus:ring-4 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70">
          <svg
            aria-hidden="true"
            className="h-6 w-6 "
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>
    </div>
  );
};
export default Carousel;
