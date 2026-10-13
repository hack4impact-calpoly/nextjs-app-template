export interface MenuItem {
  id: string;
  name: string;
  price: number; // dollars
  description: string;
}

export const mockMenuItems: MenuItem[] = [
  { id: "1", name: "Margherita Pizza", price: 12.5, description: "Tomato, mozzarella, fresh basil." },
  { id: "2", name: "Caesar Salad", price: 9.0, description: "Romaine, parmesan, croutons, house dressing." },
  { id: "3", name: "Spaghetti Carbonara", price: 14.75, description: "Egg, pecorino, guanciale, black pepper." },
  { id: "4", name: "Tiramisu", price: 7.5, description: "Espresso-soaked ladyfingers, mascarpone cream." },
];
