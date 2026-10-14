import Image from "next/image";
import Link from "next/link";
import { Drink } from "@/types/drink";
import styles from "./DrinkCard.module.css";

interface DrinkCardProps {
  drink: Drink;
}

export default function DrinkCard({ drink }: DrinkCardProps) {
  const lowestPrice = Math.min(...drink.sizes.map((s) => s.price));

  return (
    <Link className={styles.card} href={`/menu/${drink._id}`}>
      <Image
        className={styles.image}
        src={drink.imageUrl}
        alt={drink.name}
        width={400}
        height={300}
        sizes="(max-width: 540px) 100vw, (max-width: 900px) 50vw, 33vw"
      />
      <div className={styles.content}>
        <h3>{drink.name}</h3>
        <p className={styles.category}>{drink.category}</p>
        <p className={styles.price}>From ${lowestPrice.toFixed(2)}</p>
      </div>
    </Link>
  );
}
