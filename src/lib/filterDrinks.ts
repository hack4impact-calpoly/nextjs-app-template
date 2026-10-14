import { Drink } from "@/types/drink";

export function filterDrinks(drinks: Drink[], searchQuery: string, selectedCategory: string) {
  return drinks.filter((drink) => {
    const matchesSearch = drink.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || drink.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });
}
