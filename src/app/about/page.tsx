import Image from "next/image";
import ReviewForm from "@/components/ReviewForm";
import imageCafe from "../../assets/cafeimg.jpg";

export default function About() {
  return (
    <main className="page">
      <section>
        <Image src={imageCafe} alt="coffee" className="about-img" />
        <h1>About Us!</h1>
        <p>
          KRISPI was founded in 2026 by a group of chefs wanting to bring a unique taste from their backgrounds in the
          form of cafe goods to San Luis Obispo!
        </p>
        <p>Our head chef is Ashley Navos</p>
        <p>Our chefs include: Raymond Bautista, Myanh Nguyen, Edison Tan, Tyler Charvat, and Corey Moore.</p>
      </section>
      <ReviewForm />
    </main>
  );
}
