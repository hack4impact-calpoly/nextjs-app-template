export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "coffee" | "tea" | "milktea" | "pastry" | "cake";
  available: boolean;
  imageUrl?: string;
}

export const mockMenuItems: MenuItem[] = [
  //coffee 100s
  {
    id: "100",
    name: "Espresso",
    description: "Classic shot of Espresso",
    price: 3.0,
    category: "coffee",
    available: true,
  },
  {
    id: "101",
    name: "Americano",
    description: "Single-shot Espresso with water",
    price: 3.5,
    category: "coffee",
    available: true,
  },
  {
    id: "102",
    name: "Cappuccino",
    description: "Single-shot Espresso with steamed milk and milk foam",
    price: 5.6,
    category: "coffee",
    available: true,
  },
  {
    id: "103",
    name: "Flat White",
    description: "Double-shot of Espresso with microfoam",
    price: 5.6,
    category: "coffee",
    available: true,
  },
  {
    id: "104",
    name: "Mocha",
    description: "Chocolate-flavoured caffe latte",
    price: 6.0,
    category: "coffee",
    available: true,
  },
  {
    id: "105",
    name: "Latte",
    description: "A shot of Espresso with milk and milk foam",
    price: 5.6,
    category: "coffee",
    available: true,
  },

  //teas 200s
  {
    id: "200",
    name: "Mango Tea",
    description: "Iced sweet tea drink with mango flavoured and mango bits",
    price: 5.5,
    category: "tea",
    available: true,
  },
  {
    id: "201",
    name: "Thai Tea",
    description: "Sweat creamy tea from Thailand. Made from Ceylon black tea mixed with milk",
    price: 5.5,
    category: "tea",
    available: true,
  },
  {
    id: "202",
    name: "Matcha",
    description: "Made from high-grade Japanese green tea leaf",
    price: 6.0,
    category: "tea",
    available: true,
  },
  {
    id: "203",
    name: "Green Tea",
    description: "Classic cup of green tea. Can be served iced or hot",
    price: 5.0,
    category: "tea",
    available: true,
  },
  {
    id: "204",
    name: "Black Tea",
    description: "Classic cup of black tea. Can be served iced or hot",
    price: 5.0,
    category: "tea",
    available: true,
  },

  //milktea 300s
  {
    id: "300",
    name: "House Milktea",
    description: "An iced sweet creamy drink made of tea and milk",
    price: 5.5,
    category: "milktea",
    available: true,
  },
  {
    id: "301",
    name: "Milk tea with creme brulee",
    description: "Milk tea topped with torched custard cream",
    price: 6.0,
    category: "milktea",
    available: true,
  },
  {
    id: "302",
    name: "Cookie and Cream Milktea",
    description: "Milk tea with Oreo bits and flavoured",
    price: 5.5,
    category: "milktea",
    available: true,
  },

  //pastry 400s
  {
    id: "400",
    name: "Cream Puff",
    description: "Fluffy round bread with cream fillings",
    price: 3.0,
    category: "pastry",
    available: true,
  },
  {
    id: "401",
    name: "Croissant",
    description: "Your classic freshly made croissant",
    price: 3.0,
    category: "pastry",
    available: true,
  },
  {
    id: "402",
    name: "Donut",
    description: "Small sweet with sugar glazed",
    price: 3.2,
    category: "pastry",
    available: true,
  },
  {
    id: "403",
    name: "Danish Cheese",
    description: "Sweet buttery pastry topped with cream cheese mixture",
    price: 4.0,
    category: "pastry",
    available: true,
  },
  {
    id: "404",
    name: "Garlic Bread",
    description: "Freshly made bread with garlic",
    price: 4.5,
    category: "pastry",
    available: true,
  },
  {
    id: "405",
    name: "Spicy Sausage",
    description: "Freshly made bread with sausage filling",
    price: 5.0,
    category: "pastry",
    available: true,
  },

  //cake 500s
  {
    id: "500",
    name: "Tiramisu",
    description: "A dessert made with espresso, lady fingers and mascarpone",
    price: 8.2,
    category: "cake",
    available: true,
  },
  {
    id: "501",
    name: "Cupcake",
    description: "A classic cupcake with different flavoured cream and sprinkles",
    price: 5.0,
    category: "cake",
    available: true,
  },
  {
    id: "502",
    name: "Cheese cake",
    description: "Creamy rich dessert made with graham cracker crust and a cheese filling",
    price: 7.5,
    category: "cake",
    available: true,
  },
  {
    id: "503",
    name: "Chocolate Lava cake",
    description: "A dessert with gooey chocolate center and crispy chocolate exterior",
    price: 8.0,
    category: "cake",
    available: true,
  },
  {
    id: "504",
    name: "Strawberry cake",
    description: "A dessert with strawberry cream layers. Topped with Strawberry cream and fresh strawberries",
    price: 8.0,
    category: "cake",
    available: true,
  },
  {
    id: "505",
    name: "Lemon Berry Cake",
    description: "A dessert with citrus flavour topped with berries",
    price: 8.2,
    category: "cake",
    available: true,
  },
];
