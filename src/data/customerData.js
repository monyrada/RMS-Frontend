export const customerCategories = [
  { id: "all", label: "All", emoji: "🍽️" },
  { id: "starters", label: "Starters", emoji: "🥗" },
  { id: "main", label: "Main Course", emoji: "🥩" },
  { id: "desserts", label: "Desserts", emoji: "🍮" },
  { id: "drinks", label: "Drinks", emoji: "🍹" },
  { id: "specials", label: "Specials", emoji: "⭐" },
];

export const customerMenuItems = [
  {
    id: 1, name: "Grilled Salmon", category: "main", price: 18.5,
    description: "Atlantic salmon fillet, lemon herb butter, seasonal vegetables.",
    emoji: "🐟", popular: true, spicy: false, time: "18 min",
  },
  {
    id: 2, name: "Caesar Salad", category: "starters", price: 9.0,
    description: "Crisp romaine, shaved parmesan, housemade croutons, classic dressing.",
    emoji: "🥗", popular: false, spicy: false, time: "8 min",
  },
  {
    id: 3, name: "Beef Burger", category: "main", price: 14.0,
    description: "200g prime beef, aged cheddar, caramelised onion, brioche bun.",
    emoji: "🍔", popular: true, spicy: false, time: "15 min",
  },
  {
    id: 4, name: "Tiramisu", category: "desserts", price: 7.5,
    description: "Classic Italian mascarpone cream, espresso-soaked ladyfingers.",
    emoji: "🍮", popular: false, spicy: false, time: "5 min",
  },
  {
    id: 5, name: "Mojito", category: "drinks", price: 6.0,
    description: "White rum, fresh lime, mint, sugar syrup, soda water.",
    emoji: "🍹", popular: true, spicy: false, time: "5 min",
  },
  {
    id: 6, name: "Tom Yum Soup", category: "starters", price: 10.0,
    description: "Thai lemongrass broth, tiger prawns, mushrooms, galangal.",
    emoji: "🍲", popular: false, spicy: true, time: "12 min",
  },
  {
    id: 7, name: "Chocolate Lava Cake", category: "desserts", price: 8.5,
    description: "Warm dark chocolate centre, vanilla ice cream, raspberry coulis.",
    emoji: "🍫", popular: true, spicy: false, time: "14 min",
  },
  {
    id: 8, name: "Mushroom Risotto", category: "main", price: 16.0,
    description: "Arborio rice, mixed wild mushrooms, white wine, aged parmesan.",
    emoji: "🍄", popular: false, spicy: false, time: "22 min",
  },
  {
    id: 9, name: "Mango Lassi", category: "drinks", price: 5.0,
    description: "Fresh Alphonso mango, yoghurt, cardamom, rose water.",
    emoji: "🥭", popular: false, spicy: false, time: "5 min",
  },
  {
    id: 10, name: "Chef's Special Platter", category: "specials", price: 32.0,
    description: "Today's selection — ask your server for details. Changes daily.",
    emoji: "⭐", popular: false, spicy: false, time: "25 min",
  },
  {
    id: 11, name: "Spring Rolls", category: "starters", price: 7.0,
    description: "Crispy vegetable rolls, sweet chilli sauce, fresh herbs.",
    emoji: "🥟", popular: false, spicy: false, time: "10 min",
  },
  {
    id: 12, name: "Pad Thai", category: "main", price: 13.5,
    description: "Rice noodles, tofu or chicken, bean sprouts, peanuts, tamarind.",
    emoji: "🍜", popular: true, spicy: true, time: "18 min",
  },
];
