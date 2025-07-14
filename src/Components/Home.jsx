//This file is part of the MediKart project, a healthcare e-commerce platform.
//It contains the Home component which serves as the landing page of the application.
//The component features a carousel, service sections, testimonials, and more.
//Operations:
// - Displaying a carousel of slides with navigation and indicators
// - Handling auto-play functionality for the carousel
// - Implementing pause on hover for the carousel
// - Navigating to different sections of the application
// - Displaying various sections like About, Services, Testimonials, and Categories
// - Using React hooks for state management and side effects

"use client";

import { useState, useEffect, useCallback } from "react";
import "../styles/Home.css";
import p3Image from "../images/p3.png";
import p4Image from "../images/p4.jpg";
import p6Image from "../images/p6.jpg";
import p7Image from "../images/p7.jpg";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const navigate = useNavigate();

  const slides = [
    {
      id: 1,
      title: "Premium Healthcare Products",
      subtitle: "Your Health, Our Priority",
      description:
        "Discover our wide range of quality medicines and healthcare products delivered to your doorstep.",
      image: "/",
      buttonText: "Shop Now",
      buttonAction: () => navigate("/products"),
    },
    {
      id: 2,
      title: "Expert Consultation",
      subtitle: "Professional Medical Advice",
      description:
        "Get expert consultation from certified pharmacists and healthcare professionals online.",
      image: "/",
      buttonText: "Consult Now",
      buttonAction: () => navigate("/ChatWindow"),
    },
    {
      id: 3,
      title: "Fast & Secure Delivery",
      subtitle: "Medicines at Your Doorstep",
      description:
        "Quick and secure delivery of your medicines with temperature-controlled packaging.",
      image: "/",
      buttonText: "Track Order",
      buttonAction: () => {},
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 2000);

    return () => clearInterval(interval);
  }, [nextSlide, isAutoPlay]);

  const handleMouseEnter = () => setIsAutoPlay(false);
  const handleMouseLeave = () => setIsAutoPlay(true);

  return (
    <div className="medikart-home-container">
      {/* Hero Carousel Section */}
      <section className="medikart-hero-carousel">
        <div
          className="medikart-carousel-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="medikart-carousel-inner">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`medikart-carousel-slide ${
                  index === currentSlide ? "active" : ""
                }`}
                style={{
                  transform: `translateX(${(index - currentSlide) * 100}%)`,
                }}
              >
                <div className="medikart-slide-content">
                  <div className="medikart-slide-text">
                    <h1 className="medikart-slide-title">{slide.title}</h1>
                    <h2 className="medikart-slide-subtitle">
                      {slide.subtitle}
                    </h2>
                    <p className="medikart-slide-description">
                      {slide.description}
                    </p>
                    <button
                      className="medikart-slide-button"
                      onClick={slide.buttonAction}
                    >
                      {slide.buttonText}
                      <span className="medikart-button-arrow">→</span>
                    </button>
                  </div>
                  <div className="medikart-slide-image"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            className="medikart-carousel-btn medikart-prev-btn"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <i className="bi bi-arrow-bar-left"></i>
          </button>
          <button
            className="medikart-carousel-btn medikart-next-btn"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <i className="bi bi-arrow-bar-right"></i>
          </button>

          {/* Indicators */}
          <div className="medikart-carousel-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`medikart-indicator ${
                  index === currentSlide ? "active" : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
      <div className="medikart-spacing"></div>

      {/* About Section */}
      <section className="medikart-about-section">
        <div className="medikart-about-container">
          <div className="medikart-about-content">
            <img src={p3Image} alt="Healthcare Products" />
            <div className="medikart-about-text">
              <h2>Trusted Healthcare Partner</h2>
              <h3>25+ Years of Excellence in Pharmacy Services</h3>
              <p>
                MediKart has been serving communities with reliable healthcare
                solutions for over two decades. We are committed to providing
                authentic medicines, expert consultation, and exceptional
                customer service.
              </p>
              <div className="medikart-about-features">
                <div className="medikart-feature-item">
                  <span className="medikart-feature-icon">🛡️</span>
                  <span>100% Authentic Products</span>
                </div>
                <div className="medikart-feature-item">
                  <span className="medikart-feature-icon">👨‍⚕️</span>
                  <span>Expert Pharmacists</span>
                </div>
                <div className="medikart-feature-item">
                  <span className="medikart-feature-icon">🚚</span>
                  <span>Fast Delivery</span>
                </div>
              </div>
              <button
                className="medikart-learn-more-btn"
                onClick={() => navigate("/About")}
              >
                Learn More About us
                <span className="medikart-button-arrow">→</span>
              </button>
            </div>
            <div className="medikart-about-image">
              <div className="medikart-image-overlay">
                <div className="medikart-overlay-content">
                  <span className="medikart-overlay-icon">💗</span>
                  <span>Your Health Matters</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="medikart-spacing"></div>

      {/* Services Section */}
      <section className="medikart-services-section">
        <div className="medikart-services-container">
          <div className="medikart-section-header">
            <h2>Our Services</h2>
            <p>Comprehensive healthcare solutions tailored to your needs</p>
          </div>
          <div className="medikart-services-grid">
            <div className="medikart-service-card">
              <div className="medikart-service-icon">💊</div>
              <h3>Prescription Medicines</h3>
              <p>
                Wide range of prescription medications from trusted brands with
                proper verification.
              </p>
              <button
                onClick={() => navigate("/category/prescription")}
                className="medikart-service-btn"
              >
                Explore
              </button>
            </div>
            <div className="medikart-service-card">
              <div className="medikart-service-icon">🩹</div>
              <h3>OTC Products</h3>
              <p>
                Over-the-counter medicines, supplements, and healthcare products
                for daily needs.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="medikart-service-btn"
              >
                Browse
              </button>
            </div>
            <div className="medikart-service-card">
              <div className="medikart-service-icon">📹</div>
              <h3>Online Consultation</h3>
              <p>
                Connect with certified doctors and pharmacists for professional
                medical advice.
              </p>
              <button
                className="medikart-service-btn"
                onClick={() => navigate("/ChatWindow")}
              >
                Consult
              </button>
            </div>
            <div className="medikart-service-card">
              <div className="medikart-service-icon">🏠</div>
              <h3>Home Delivery</h3>
              <p>
                Safe and secure delivery of medicines to your doorstep with
                temperature control.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="medikart-service-btn"
              >
                Order
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="medikart-spacing"></div>

      {/* Testimonials Section */}
      <section className="medikart-testimonials-section">
        <div className="medikart-testimonials-container">
          <div className="medikart-section-header">
            <h2>What Our Customers Say</h2>
            <p>Real stories from our satisfied customers</p>
          </div>
          <div className="medikart-testimonials-grid">
            <div className="medikart-testimonial-card">
              <p>
                "MediKart has been my go-to pharmacy for years. Their service is
                exceptional and the delivery is always on time!"
              </p>
              <span className="medikart-customer-name">Talha</span>
            </div>
            <div className="medikart-testimonial-card">
              <p>
                "I love the convenience of online consultations. The pharmacists
                are very knowledgeable and helpful."
              </p>
              <span className="medikart-customer-name">Zain</span>
            </div>
            <div className="medikart-testimonial-card">
              <p>
                "Fast delivery and genuine products! I highly recommend MediKart
                to everyone."
              </p>
              <span className="medikart-customer-name">Rafey</span>
            </div>
          </div>
        </div>
      </section>
      <div className="medikart-spacing"></div>

      {/* Statistics Section */}
      <section className="medikart-stats-section">
        <div className="medikart-stats-container">
          <h2>Trusted by Thousands</h2>
          <div className="medikart-stats-grid">
            <div className="medikart-stat-card">
              <div className="medikart-stat-icon">👥</div>
              <span className="medikart-stat-number">50,000+</span>
              <span className="medikart-stat-label">Happy Customers</span>
            </div>
            <div className="medikart-stat-card">
              <div className="medikart-stat-icon">💊</div>
              <span className="medikart-stat-number">10,000+</span>
              <span className="medikart-stat-label">Products Available</span>
            </div>
            <div className="medikart-stat-card">
              <div className="medikart-stat-icon">🚚</div>
              <span className="medikart-stat-number">1M+</span>
              <span className="medikart-stat-label">Orders Delivered</span>
            </div>
            <div className="medikart-stat-card">
              <div className="medikart-stat-icon">🕐</div>
              <span className="medikart-stat-number">24/7</span>
              <span className="medikart-stat-label">Customer Support</span>
            </div>
          </div>
        </div>
      </section>
      <div className="medikart-spacing"></div>

      {/* Categories Section */}
      <section className="medikart-categories-section">
        <div className="medikart-categories-container">
          <div className="medikart-section-header">
            <h2>Shop by Category</h2>
            <p>Find the right products for your health needs</p>
          </div>
          <div className="medikart-categories-grid">
            <div className="medikart-category-card">
              <img src={p4Image} alt="Medicines" />
              <div className="medikart-category-overlay">
                <h3>Medicines</h3>
                <p>Prescription & OTC</p>
                <button
                  onClick={() => navigate("/products")}
                  className="medikart-category-btn"
                >
                  Shop Now
                </button>
              </div>
            </div>
            <div className="medikart-category-card">
              <img src={p6Image} alt="Wellness" />
              <div className="medikart-category-overlay">
                <h3>Wellness</h3>
                <p>Vitamins & Supplements</p>
                <button
                  onClick={() => navigate("/products")}
                  className="medikart-category-btn"
                >
                  Shop Now
                </button>
              </div>
            </div>

            <div className="medikart-category-card">
              <img src={p7Image} alt="Baby Care" />
              <div
                onClick={() => navigate("/products")}
                className="medikart-category-overlay"
              >
                <h3>Baby Care</h3>
                <p>Mother & Child</p>
                <button className="medikart-category-btn">Shop Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="medikart-spacing"></div>

      {/* CTA Section */}
      <section className="medikart-cta-section">
        <div className="medikart-cta-content">
          <h2>Ready to Start Your Health Journey?</h2>
          <p>
            Join thousands of satisfied customers who trust MediKart for their
            healthcare needs.
          </p>
          <div className="medikart-cta-buttons">
            <button
              className="medikart-cta-button primary"
              onClick={() => navigate("/Products")}
            >
              🛒 Start Shopping
            </button>
            <button
              className="medikart-cta-button secondary"
              onClick={() => navigate("/Contact")}
            >
              📞 Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
