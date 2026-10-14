import styles from "./MenuItem.module.css";
import type { MenuItemType } from "../database/menuItemSchema";

// type MenuItemProps = {
//   name: string;
//   price: number;
//   description?: string;
// };

type MenuItemProps = MenuItemType;

export default function MenuItem({ name, price, description }: MenuItemProps) {
  return (
    <div className={styles.item}>
      <h3 className={styles.name}>{name}</h3>
      {description && <p className={styles.description}>{description}</p>}
      <p className={styles.price}>${price.toFixed(2)}</p>
    </div>
  );
}
