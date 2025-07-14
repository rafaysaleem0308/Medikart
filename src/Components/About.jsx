//This file is part of the MediKart project
//MediKart is a healthcare platform that provides innovative solutions for accessing medical services.
// This file contains the About component which showcases the company's story, mission, values, team, and statistics.
// The component uses React hooks for state management, data fetching, and animations.
//Operations:
// - Fetching team members, milestones, and values from the API
// - Animating counters for statistics
// - Handling scroll events for back-to-top functionality
// - Rendering different sections based on active tab
//// The component is designed to be responsive and visually appealing with CSS animations and transitions.
// The code is structured to be modular and maintainable, following best practices for React development.

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import "../styles/About.css";

export default function About() {
  // State management
  const [activeTab, setActiveTab] = useState("story");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [counters, setCounters] = useState({
    customers: 0,
    products: 0,
    pharmacists: 0,
    years: 0,
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [values, setValues] = useState([]);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Final counter values
  const finalCounters = useMemo(
    () => ({
      customers: 50000,
      products: 25000,
      pharmacists: 150,
      years: 14,
    }),
    []
  );

  const statsSectionRef = useRef(null);
  const animationStarted = useRef(false);

  // Fetch data

  // This effect fetches team members, milestones, and values from the API
  // and sets them in the respective state variables.
  // It also handles errors and sets a fallback state if needed.
  // The data is fetched only once when the component mounts.
  // It uses async/await for better readability and error handling.
  // The console logs help in debugging by showing the fetched data or any errors.
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data from API...");
        const [membersRes, milestonesRes, valuesRes] = await Promise.all([
          fetch("http://localhost:5000/api/about/team-members"),
          fetch("http://localhost:5000/api/about/milestones"),
          fetch("http://localhost:5000/api/about/values"),
        ]);

        if (!membersRes.ok) throw new Error("Failed to fetch team members");
        if (!milestonesRes.ok) throw new Error("Failed to fetch milestones");
        if (!valuesRes.ok) throw new Error("Failed to fetch values");

        const membersData = await membersRes.json();
        const milestonesData = await milestonesRes.json();
        const valuesData = await valuesRes.json();

        console.log("Fetched data:", {
          members: membersData,
          milestones: milestonesData,
          values: valuesData,
        });

        setTeamMembers(membersData);
        setMilestones(milestonesData);
        setValues(valuesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        // Set fallback data
      }
    };

    fetchData();
  }, []);

  // Scroll handler for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Counter animation function
  // This function animates the counters from 0 to their final values
  // using a smooth easing function (easeOutQuart).
  // It uses requestAnimationFrame for smooth animations and ensures
  // the counters are updated in a performant way.
  const animateCounters = useCallback(() => {
    if (animationStarted.current) return;
    animationStarted.current = true;

    console.log("Starting counter animation");
    const duration = 3000; // 3 seconds
    const startTime = performance.now();

    const updateCounters = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCounters({
        customers: Math.floor(finalCounters.customers * easeOutQuart),
        products: Math.floor(finalCounters.products * easeOutQuart),
        pharmacists: Math.floor(finalCounters.pharmacists * easeOutQuart),
        years: Math.floor(finalCounters.years * easeOutQuart),
      });

      if (progress < 1) {
        requestAnimationFrame(updateCounters);
      } else {
        // Ensure final values are exact
        setCounters(finalCounters);
      }
    };

    requestAnimationFrame(updateCounters);
  }, [finalCounters]);

  // Intersection Observer for stats section
  // This effect sets up an Intersection Observer to trigger the counter animation
  // when the stats section comes into view. It also handles cleanup
  // to avoid memory leaks. The observer checks if the section is at least 10%
  // visible before triggering the animation. It also has a fallback
  // to trigger the animation after a short delay if the section is not visible
  // within the viewport.
  // The console logs help in debugging by showing when the section is visible
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log("Stats section is visible - triggering animation");
            animateCounters();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    const currentRef = statsSectionRef.current;
    if (currentRef) {
      console.log("Observing stats section");
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [animateCounters]);

  // Fallback animation trigger
  // This effect sets a timeout to trigger the counter animation
  // if the stats section is not visible within 1.5 seconds.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!animationStarted.current) {
        console.log("Fallback animation trigger");
        animateCounters();
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [animateCounters]);

  // Helper functions
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (error) {
    return (
      <div className="error-display">
        <div className="error-box">
          <h2>Oops! Something went wrong</h2>
          <p>Error loading data: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main component rendering
  // This is the main component rendering the About page.
  // It includes the hero section, navigation tabs, and content sections
  // for story, mission, values, team, and statistics.
  // The component uses various hooks for state management, effects,
  // and animations. It also includes helper functions for scrolling
  return (
    <div
      className={`about-main-container ${isVisible ? "content-loaded" : ""}`}
    >
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="floating-shapes">
          <div className="geometric-shape shape-circle-1"></div>
          <div className="geometric-shape shape-circle-2"></div>
          <div className="geometric-shape shape-circle-3"></div>
          <div className="geometric-shape shape-circle-4"></div>
        </div>
        <div className="hero-content-wrapper">
          <h1 className="hero-main-title">
            <span className="title-segment">Revolutionizing</span>
            <span className="title-segment title-highlighted">MediKart</span>
            <span className="title-segment title-highlighted">Healthcare</span>
            <span className="title-segment">Experience</span>
          </h1>
          <p className="hero-text">
            We're transforming the way people access healthcare through
            innovative technology, compassionate care, and unwavering commitment
            to your wellbeing.
          </p>
          <div className="hero-action-buttons">
            <button
              className="primary-button"
              onClick={() => scrollToSection("story")}
            >
              <span>Discover Our Journey</span>
              <div className="button-arrow">→</div>
            </button>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="tab-navigation">
        <div className="nav-pill-container">
          <button
            className={`nav-pill ${activeTab === "story" ? "pill-active" : ""}`}
            onClick={() => setActiveTab("story")}
          >
            <div className="pill-icon">📖</div>
            <span>Story</span>
          </button>
          <button
            className={`nav-pill ${
              activeTab === "mission" ? "pill-active" : ""
            }`}
            onClick={() => setActiveTab("mission")}
          >
            <div className="pill-icon">🎯</div>
            <span>Mission</span>
          </button>
          <button
            className={`nav-pill ${
              activeTab === "values" ? "pill-active" : ""
            }`}
            onClick={() => setActiveTab("values")}
          >
            <div className="pill-icon">💎</div>
            <span>Values</span>
          </button>
          <button
            className={`nav-pill ${activeTab === "team" ? "pill-active" : ""}`}
            onClick={() => setActiveTab("team")}
          >
            <div className="pill-icon">👥</div>
            <span>Team</span>
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <main className="main-content-area">
        {/* Story Section */}
        {activeTab === "story" && (
          <section className="story-content-section" id="story">
            <div className="content-wrapper">
              <div className="section-header">
                <h2 className="section-main-title">Our Story</h2>
                <p className="section-description">
                  From humble beginnings to healthcare innovation
                </p>
              </div>

              <div className="story-cards-grid">
                <div className="story-info-card card-variant-1">
                  <div className="card-number-badge">01</div>
                  <h3>The Beginning</h3>
                  <p>
                    Founded in 2009 by healthcare visionaries who saw the need
                    for accessible, technology-driven healthcare solutions. What
                    started as a small pharmacy has grown into a comprehensive
                    healthcare platform.
                  </p>
                </div>
                <div className="story-info-card card-variant-2">
                  <div className="card-number-badge">02</div>
                  <h3>Digital Evolution</h3>
                  <p>
                    We embraced digital transformation early, integrating AI,
                    machine learning, and telemedicine to create seamless
                    healthcare experiences that put patients first.
                  </p>
                </div>
                <div className="story-info-card card-variant-3">
                  <div className="card-number-badge">03</div>
                  <h3>Today & Beyond</h3>
                  <p>
                    Now serving 50,000+ customers with 150+ healthcare
                    professionals, we continue pushing boundaries to make
                    healthcare more accessible, affordable, and effective for
                    everyone.
                  </p>
                </div>
              </div>

              <div className="timeline-container">
                <h3 className="timeline-heading">Key Milestones</h3>
                <div className="timeline-list">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="timeline-entry">
                      <div className="entry-year">{milestone.year}</div>
                      <div className="entry-details">
                        <h4>{milestone.title}</h4>
                        <p>{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Mission Section */}
        {activeTab === "mission" && (
          <section className="mission-content-section" id="mission">
            <div className="content-wrapper">
              <div className="section-header">
                <h2 className="section-main-title">Mission & Vision</h2>
                <p className="section-description">
                  Our driving force and future aspirations
                </p>
              </div>

              <div className="mission-vision-grid">
                <div className="mission-info-card">
                  <div className="info-card-header">
                    <div className="header-icon mission-icon-style">🎯</div>
                    <h3>Our Mission</h3>
                  </div>
                  <p className="info-card-text">
                    To democratize healthcare by providing accessible,
                    affordable, and high-quality medical services through
                    innovative technology and compassionate care.
                  </p>
                  <div className="mission-key-points">
                    <div className="key-point">
                      <span className="point-indicator"></span>
                      <span>Accessible healthcare for all</span>
                    </div>
                    <div className="key-point">
                      <span className="point-indicator"></span>
                      <span>Quality pharmaceutical services</span>
                    </div>
                    <div className="key-point">
                      <span className="point-indicator"></span>
                      <span>Innovative healthcare solutions</span>
                    </div>
                  </div>
                </div>

                <div className="vision-info-card">
                  <div className="info-card-header">
                    <div className="header-icon vision-icon-style">🌟</div>
                    <h3>Our Vision</h3>
                  </div>
                  <p className="info-card-text">
                    To become the world's most trusted healthcare platform,
                    transforming how people access, manage, and experience
                    healthcare in their daily lives.
                  </p>
                  <div className="vision-roadmap">
                    <div className="roadmap-item">
                      <div className="roadmap-year">2025</div>
                      <div className="roadmap-description">
                        100K+ customers served
                      </div>
                    </div>
                    <div className="roadmap-item">
                      <div className="roadmap-year">2026</div>
                      <div className="roadmap-description">
                        AI health assistant launch
                      </div>
                    </div>
                    <div className="roadmap-item">
                      <div className="roadmap-year">2027</div>
                      <div className="roadmap-description">
                        Global market expansion
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Values Section */}
        {activeTab === "values" && (
          <section className="values-content-section" id="values">
            <div className="content-wrapper">
              <div className="section-header">
                <h2 className="section-main-title">Our Core Values</h2>
                <p className="section-description">
                  The principles that guide everything we do
                </p>
              </div>

              <div className="values-cards-grid">
                {values.map((value, index) => (
                  <div key={index} className="value-display-card">
                    <div className="value-icon-container">
                      <span className="value-emoji-icon">{value.icon}</span>
                    </div>
                    <h3 className="value-card-title">{value.title}</h3>
                    <p className="value-card-text">{value.description}</p>
                    <div className="value-bottom-accent"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Team Section */}
        {activeTab === "team" && (
          <section className="team-content-section" id="team">
            <div className="content-wrapper">
              <div className="section-header">
                <h2 className="section-main-title">Leadership Team</h2>
                <p className="section-description">
                  Meet the experts driving healthcare innovation
                </p>
              </div>

              <div className="team-members-grid">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member, index) => (
                    <div key={index} className="team-member-card">
                      <div className="member-photo-container">
                        <div className="photo-overlay">
                          <div className="social-contact-links">
                            <a href="/" className="contact-link">
                              <span>💼</span>
                            </a>
                            <a href="/" className="contact-link">
                              <span>✉️</span>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="member-details">
                        <h3 className="member-full-name">{member.name}</h3>
                        <p className="member-position">{member.role}</p>
                        <p className="member-biography">{member.bio}</p>
                        <div className="member-skills">
                          {member.specialties?.map((specialty, idx) => (
                            <span key={idx} className="skill-tag">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-team-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>Team Information Coming Soon</h3>
                    <p>We're updating our team profiles. Check back soon!</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Stats Section */}
      <section className="statistics-showcase" ref={statsSectionRef}>
        <div className="stats-content-wrapper">
          <div className="stats-intro">
            <h2>Our Impact</h2>
            <p>Numbers that tell our story</p>
          </div>
          <div className="statistics-grid">
            <div className="stat-display-item">
              <div className="stat-number-display">
                {counters.customers.toLocaleString()}+
              </div>
              <div className="stat-label-text">Happy Customers</div>
              <div className="stat-emoji-icon">👥</div>
            </div>
            <div className="stat-display-item">
              <div className="stat-number-display">{counters.pharmacists}+</div>
              <div className="stat-label-text">Healthcare Professionals</div>
              <div className="stat-emoji-icon">👨‍⚕️</div>
            </div>
            <div className="stat-display-item">
              <div className="stat-number-display">{counters.years}+</div>
              <div className="stat-label-text">Years of Excellence</div>
              <div className="stat-emoji-icon">🏆</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="call-to-action-section">
        <div className="cta-layout-container">
          <div className="cta-text-content">
            <h2>Ready to Transform Your Healthcare Experience?</h2>
            <p>
              Join thousands of satisfied customers who trust us with their
              health and wellness needs.
            </p>
            <div className="cta-action-buttons">
              <button className="primary-button">
                <span>Get Started Now</span>
                <div className="button-arrow">→</div>
              </button>
              <button className="secondary-button">
                <span>Contact Us</span>
              </button>
            </div>
          </div>
          <div className="cta-visual-elements">
            <div className="visual-shape shape-element-1"></div>
            <div className="visual-shape shape-element-2"></div>
            <div className="visual-shape shape-element-3"></div>
          </div>
        </div>
      </section>

      {/* Back to Top */}
      {showBackToTop && (
        <button
          className="scroll-to-top-button"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <span>↑</span>
        </button>
      )}
    </div>
  );
}
