"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const banners = [
  {
    src: "/images/cloudledger-banner.jpg",
    alt: "CloudLedger professional accounting services and expert-led courses",
    width: 1774,
    height: 887,
  },
  {
    src: "/images/cloudledger-banner-2.png",
    alt: "CloudLedger accounting services, practical courses, flexible learning, and career support",
    width: 1365,
    height: 768,
  },
];

export default function HomeBannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + banners.length) % banners.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % banners.length);
  }

  const activeBanner = banners[activeIndex];

  return (
    <div
      className="overflow-hidden rounded-2xl shadow-lg sm:rounded-3xl"
      role="region"
      aria-label="CloudLedger featured banners"
      aria-roledescription="carousel"
    >
      <div className="relative bg-navy">
        <Image
          key={activeBanner.src}
          src={activeBanner.src}
          alt={activeBanner.alt}
          width={activeBanner.width}
          height={activeBanner.height}
          priority={activeIndex === 0}
          className="h-auto w-full"
          sizes="(min-width: 1472px) 1376px, (min-width: 1280px) calc(100vw - 64px), (min-width: 1024px) calc(100vw - 48px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
        />
        <button
          type="button"
          onClick={showPrevious}
          aria-label="Show previous banner"
          className="absolute left-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-navy/75 p-2 text-white shadow transition hover:bg-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={showNext}
          aria-label="Show next banner"
          className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-navy/75 p-2 text-white shadow transition hover:bg-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 bg-white py-2" role="group" aria-label="Choose a banner">
        {banners.map((banner, index) => (
          <button
            key={banner.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show banner ${index + 1}`}
            aria-pressed={activeIndex === index}
            className={`h-2.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              activeIndex === index ? "w-7 bg-brand" : "w-2.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Banner {activeIndex + 1} of {banners.length}: {activeBanner.alt}
      </p>
    </div>
  );
}
