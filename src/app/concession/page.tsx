import MenuItem from "@/components/MenuItem";

const Menuitems = [
  { name: "Popcorn", price: 5.99, description: "Freshly popped popcorn" },
  { name: "Soda", price: 3.99, description: "Refreshing carbonated drink" },
  { name: "Chips", price: 1.99, description: "Crispy and savory chips" },
  { name: "Candy", price: 2.49, description: "Sweet and delicious candy" },
];

export default function ConcessionsPage() {
  return (
    <div>
      <h1>Concessions</h1>
      <div>
        {Menuitems.map((item) => (
          <MenuItem key={item.name} name={item.name} price={item.price} description={item.description} />
        ))}
      </div>
    </div>
  );
}
