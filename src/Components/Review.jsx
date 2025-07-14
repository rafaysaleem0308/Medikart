"use client";

import { useState, useEffect } from "react";
import "../styles/Review.css";
import { useNavigate } from "react-router-dom";
export default function Review() {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // At the top of Review.js component
  useEffect(() => {
    const checkAuth = () => {
      if (!localStorage.getItem("token")) {
        setShowAuthModal(true);
        return;
      }
    };

    checkAuth();
  }, [navigate]);
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/api/reviews");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setReviews(data);

        // Calculate average rating locally if needed
        const avg =
          data.reduce((sum, review) => sum + review.rating, 0) / data.length;
        setAverageRating(avg || 0);
      } catch (err) {
        console.error("Fetch error:", err);
        setErrors({ fetch: err.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!userName.trim()) {
      newErrors.userName = "Name is required";
    }

    if (!newReview.trim()) {
      newErrors.review = "Review text is required";
    } else if (newReview.trim().length < 10) {
      newErrors.review = "Review must be at least 10 characters long";
    }

    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Get user data from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        throw new Error("User data not found");
      }

      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newReview.trim(),
          rating,
          category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Submission failed");
      }

      const savedReview = await response.json();

      // Update UI
      setReviews((prev) => [savedReview, ...prev]);

      // Reset form
      setNewReview("");
      setRating(0);
      setCategory("general");
      setErrors({});
    } catch (err) {
      console.error("Submission error:", err);
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Calculate average rating
  // const calculateAverage = (reviews) => {
  //   if (reviews.length === 0) return 0;
  //   const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  //   return parseFloat((sum / reviews.length).toFixed(1));
  // };

  const handleStarClick = (starRating) => {
    setRating(starRating);
    setErrors((prev) => ({ ...prev, rating: "" }));
  };

  const handleStarHover = (starRating) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const renderStars = (currentRating, interactive = false) => {
    return [...Array(5)].map((_, index) => {
      const starRating = index + 1;
      const isActive = interactive
        ? starRating <= (hoverRating || rating)
        : starRating <= currentRating;

      return (
        <span
          key={index}
          className={`med-review-star ${isActive ? "med-review-active" : ""} ${
            interactive ? "med-review-interactive" : ""
          }`}
          onClick={interactive ? () => handleStarClick(starRating) : undefined}
          onMouseEnter={
            interactive ? () => handleStarHover(starRating) : undefined
          }
          onMouseLeave={interactive ? handleStarLeave : undefined}
        >
          ★
        </span>
      );
    });
  };

  const getCategoryLabel = (cat) => {
    const categories = {
      general: "General",
      products: "Products",
      doctors: "Doctors",
      pharmacy: "Pharmacy",
      service: "Customer Service",
    };
    return categories[cat] || cat;
  };

  if (isLoading) {
    return (
      <div className="med-review-container">
        <div className="med-review-loading">
          <div className="med-review-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="med-review-container">
      <div className="med-review-header-container">
        <h2>Share Your Review & Feedback</h2>
        {reviews.length > 0 ? (
          <div className="med-review-stats">
            <div className="med-review-average-rating">
              <span className="med-review-rating-number">
                {averageRating.toFixed(1)}
              </span>
              <div className="med-review-stars-display">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="med-review-count">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>
        ) : (
          !errors.fetch && (
            <p className="med-review-welcome">
              Be the first to share your experience!
            </p>
          )
        )}
        {errors.fetch && (
          <p className="med-review-error-message">{errors.fetch}</p>
        )}
      </div>
      {/* Review Input Form */}
      <form className="med-review-form" onSubmit={handleSubmit}>
        <div className="med-review-form-row">
          <div className="med-review-form-group">
            <label htmlFor="userName">Your Name</label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                setErrors((prev) => ({ ...prev, userName: "" }));
              }}
              placeholder="Enter your name"
              className={errors.userName ? "med-review-error" : ""}
            />
            {errors.userName && (
              <span className="med-review-error-message">
                {errors.userName}
              </span>
            )}
          </div>

          <div className="med-review-form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="general">General</option>
              <option value="products">Products</option>
              <option value="doctors">Doctors</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="service">Customer Service</option>
            </select>
          </div>
        </div>

        <div className="med-review-form-group">
          <label>Rating</label>
          <div className="med-review-rating-input">
            {renderStars(rating, true)}
            <span className="med-review-rating-text">
              {rating > 0 ? `${rating} out of 5 stars` : "Click to rate"}
            </span>
          </div>
          {errors.rating && (
            <span className="med-review-error-message">{errors.rating}</span>
          )}
        </div>

        <div className="med-review-form-group">
          <label htmlFor="review">Your Review</label>
          <textarea
            id="review"
            value={newReview}
            onChange={(e) => {
              setNewReview(e.target.value);
              setErrors((prev) => ({ ...prev, review: "" }));
            }}
            placeholder="Share your experience with our products, doctors, or pharmacy services..."
            className={errors.review ? "med-review-error" : ""}
            maxLength={500}
            rows={5}
          />
          <div className="med-review-textarea-footer">
            <span className="med-review-character-count">
              {newReview.length}/500 characters
            </span>
            {errors.review && (
              <span className="med-review-error-message">{errors.review}</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className={`med-review-submit-btn ${
            isSubmitting ? "med-review-loading" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="med-review-spinner"></span>
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
        {errors.submit && (
          <p className="med-review-error-message">{errors.submit}</p>
        )}
      </form>

      <div className="med-review-previous-reviews">
        <h3>Customer Reviews</h3>

        {errors.fetch ? (
          <div className="med-review-error-state">
            <p>{errors.fetch}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="med-review-no-reviews">
            <div className="med-review-no-reviews-icon">📝</div>
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="med-review-list-container">
            <div className="med-review-list">
              {" "}
              {reviews.map((review) => (
                <div className="med-review-item" key={review.id}>
                  {" "}
                  <div className="med-review-item-header">
                    {" "}
                    <div className="med-reviewer-info">
                      {" "}
                      <div className="med-reviewer-avatar">
                        {" "}
                        {review.userName.charAt(0).toUpperCase()}{" "}
                      </div>{" "}
                      <div className="med-reviewer-details">
                        {" "}
                        <h4>{review.userName}</h4> <span>{review.date}</span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="med-review-meta">
                      {" "}
                      <div className="med-review-item-rating">
                        {" "}
                        {renderStars(review.rating)}{" "}
                      </div>{" "}
                      <span className="med-review-category">
                        {" "}
                        {getCategoryLabel(review.category)}{" "}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="med-review-content">
                    {" "}
                    <p>{review.text}</p>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          </div>
        )}
      </div>
      {/*Modal*/}

      {showAuthModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal">
            <h3>Authentication Required</h3>
            <p>Please login to access this page</p>
            <button
              onClick={() => {
                setShowAuthModal(false);
                navigate("/Log");
              }}
              className="auth-modal-button"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
