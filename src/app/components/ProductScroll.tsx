import React, { useRef, useState } from "react";

export function ProductScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragged, setDragged] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) setDragged(true);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragged) { e.stopPropagation(); e.preventDefault(); }
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onClickCapture={handleClickCapture}
      className={`flex overflow-x-auto scrollbar-hide px-4 scroll-pl-4 pb-4 gap-3 select-none ${
        isDragging ? "snap-none cursor-grabbing" : "snap-x snap-mandatory cursor-grab"
      }`}
    >
      {children}
    </div>
  );
}
