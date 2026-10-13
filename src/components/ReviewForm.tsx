"use client";
import { useState, useEffect, useCallback } from "react";
import SubmitReviewForm from "./SubmitReviewForm";
import styles from "../styles/review.module.css";

interface Review {
  _id: string;
  username: string;
  description: string;
  rating: number;
}

export default function ReviewForm() {
  const [buttonState, setButtonState] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/reviews");
    const data = await response.json();
    setReviews(data.reviews);
  }, []);

  useEffect(() => {
    loadReviews();
    setLoading(false);
  }, [loadReviews]);

  const handleOnClick = () => {
    buttonState ? setButtonState(false) : setButtonState(true);
    console.log(buttonState);
  };

  return (
    <div className={styles.ratingsWrapper}>
      <div className={styles.formButton}>
        <button onClick={handleOnClick}>{buttonState ? "Close Form" : "Add a review"}</button>
      </div>
      {buttonState ? <SubmitReviewForm onSubmitted={loadReviews} /> : <div></div>}
      {loading ? (
        <h1>Loading Reviews...</h1>
      ) : (
        <ul className={styles.unorderedList}>
          {reviews.map((review) => (
            <li className={styles.review} key={review._id}>
              <strong>
                {review.username}
                {"  "}
                {Array.from({ length: review.rating }, (_, index) => (
                  <span key={index} className={styles.stars}>
                    {"★"}
                  </span>
                ))}
              </strong>
              <p>{review.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
