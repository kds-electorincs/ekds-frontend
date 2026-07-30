"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LocalShipping as LocalShippingIcon,
  FileUpload as FileUploadIcon,
  Build as BuildIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import styles from '../../app/(storefront)/Homepage.module.css';

const CAROUSEL_SLIDES = [
  {
    title: "Free B2B Shipping on Orders over ₹10,000!",
    description: "Get your industrial tools, safety gear, and electrical parts delivered with extreme speed. Secure wholesale packaging and real-time tracking for bulk shipments.",
    buttonText: "Shop Catalog Now",
    link: "/products",
    bg: "linear-gradient(135deg, #EDF4FA 0%, #CFE3F1 100%)",
    visual: <LocalShippingIcon sx={{ fontSize: { xs: 80, md: 120 }, color: '#2563eb', opacity: 0.85 }} />
  },
  {
    title: "Submit a BOM List for Custom Quotations",
    description: "Ordering in bulk? Upload your bill of materials (BOM) file directly on our portal, and our dedicated sales agents will review and return custom tiered B2B pricing within 24 hours.",
    buttonText: "Request B2B Quote",
    link: "/user/quotations",
    bg: "linear-gradient(135deg, #CFE3F1 0%, #8FB6D8 100%)",
    visual: <FileUploadIcon sx={{ fontSize: { xs: 80, md: 120 }, color: '#2563eb', opacity: 0.85 }} />
  },
  {
    title: "Premium Tools from Trusted Global Brands",
    description: "High-performance power drills, certified head protection, and industrial-grade floodlights. Upgrade your workshop productivity and warehouse safety compliance today.",
    buttonText: "Browse New Arrivals",
    link: "/products",
    bg: "linear-gradient(135deg, #EDF4FA 0%, #ffffff 100%)",
    visual: <BuildIcon sx={{ fontSize: { xs: 80, md: 120 }, color: '#2563eb', opacity: 0.85 }} />
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  return (
    <div className={styles.carouselContainer}>
      {CAROUSEL_SLIDES.map((slide, index) => {
        const isActive = currentSlide === index;
        return (
          <div 
            key={index}
            className={`${styles.slide} ${isActive ? styles.active : ''}`}
            style={{ background: slide.bg }}
          >
            <div className={styles.slideContent}>
              <h2 className={styles.slideTitle}>{slide.title}</h2>
              <p className={styles.slideDesc}>{slide.description}</p>
              <Link href={slide.link} className={styles.btnPrimary}>
                {slide.buttonText}
              </Link>
            </div>
            
            <div className={styles.slideVisual}>
              {slide.visual}
            </div>
          </div>
        );
      })}

      <button onClick={handlePrevSlide} className={`${styles.navButton} ${styles.navButtonLeft}`} aria-label="Previous Slide">
        <ChevronLeftIcon />
      </button>
      
      <button onClick={handleNextSlide} className={`${styles.navButton} ${styles.navButtonRight}`} aria-label="Next Slide">
        <ChevronRightIcon />
      </button>

      <div className={styles.dotsContainer}>
        {CAROUSEL_SLIDES.map((_, i) => (
          <div 
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`${styles.dot} ${i === currentSlide ? styles.active : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
