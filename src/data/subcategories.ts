export interface Subcategory {
  label: string;
  emoji: string;
  /** Used to pre-fill the search query when a subcategory tile is tapped —
   * just the subcategory's own label, not tied to any specific mock
   * product data. Genuinely matches whatever real products (vendor or
   * backend) contain this term in their title. */
  searchTerm: string;
}

/** Real taxonomy — genuine subcategory structure for each of the app's 13
 * product categories, independent of any specific product catalogue (mock
 * or real). Tapping a tile searches for its label. */
export const SUBCATEGORIES_BY_CATEGORY: Record<string, Subcategory[]> = {
  fashion: [
    { label: "Men's Clothing", emoji: "👔", searchTerm: "men's clothing" },
    { label: "Women's Clothing", emoji: "👗", searchTerm: "women's clothing" },
    { label: "Footwear", emoji: "👟", searchTerm: "footwear" },
    { label: "Watches", emoji: "⌚", searchTerm: "watches" },
    { label: "Bags & Wallets", emoji: "👜", searchTerm: "bags" },
    { label: "Jewellery", emoji: "💍", searchTerm: "jewellery" },
    { label: "Winter Wear", emoji: "🧥", searchTerm: "winter wear" },
    { label: "Ethnic Wear", emoji: "🥻", searchTerm: "ethnic wear" },
  ],
  mobiles: [
    { label: "Smartphones", emoji: "📱", searchTerm: "smartphones" },
    { label: "Feature Phones", emoji: "📞", searchTerm: "feature phones" },
    { label: "Mobile Accessories", emoji: "🔌", searchTerm: "mobile accessories" },
    { label: "Cases & Covers", emoji: "🛡️", searchTerm: "cases covers" },
    { label: "Power Banks", emoji: "🔋", searchTerm: "power banks" },
    { label: "Chargers & Cables", emoji: "🔋", searchTerm: "chargers cables" },
  ],
  electronics: [
    { label: "Laptops", emoji: "💻", searchTerm: "laptops" },
    { label: "Headphones", emoji: "🎧", searchTerm: "headphones" },
    { label: "Cameras", emoji: "📷", searchTerm: "cameras" },
    { label: "Smart Watches", emoji: "⌚", searchTerm: "smart watches" },
    { label: "Televisions", emoji: "📺", searchTerm: "televisions" },
    { label: "Speakers", emoji: "🔊", searchTerm: "speakers" },
    { label: "Gaming", emoji: "🎮", searchTerm: "gaming" },
    { label: "Computer Accessories", emoji: "🖱️", searchTerm: "computer accessories" },
  ],
  beauty: [
    { label: "Makeup", emoji: "💄", searchTerm: "makeup" },
    { label: "Skincare", emoji: "🧴", searchTerm: "skincare" },
    { label: "Haircare", emoji: "💇", searchTerm: "haircare" },
    { label: "Fragrances", emoji: "🌸", searchTerm: "fragrances" },
    { label: "Bath & Body", emoji: "🛁", searchTerm: "bath body" },
    { label: "Grooming", emoji: "🪒", searchTerm: "grooming" },
  ],
  home: [
    { label: "Furniture", emoji: "🛋️", searchTerm: "furniture" },
    { label: "Home Decor", emoji: "🖼️", searchTerm: "home decor" },
    { label: "Kitchen & Dining", emoji: "🍽️", searchTerm: "kitchen dining" },
    { label: "Bedding", emoji: "🛏️", searchTerm: "bedding" },
    { label: "Lighting", emoji: "💡", searchTerm: "lighting" },
    { label: "Storage & Organization", emoji: "🗄️", searchTerm: "storage" },
    { label: "Bath", emoji: "🚿", searchTerm: "bath" },
  ],
  appliances: [
    { label: "Refrigerators", emoji: "🧊", searchTerm: "refrigerators" },
    { label: "Washing Machines", emoji: "🧺", searchTerm: "washing machines" },
    { label: "Air Conditioners", emoji: "❄️", searchTerm: "air conditioners" },
    { label: "Microwaves", emoji: "📡", searchTerm: "microwaves" },
    { label: "Kitchen Appliances", emoji: "🍳", searchTerm: "kitchen appliances" },
    { label: "Fans & Coolers", emoji: "🌀", searchTerm: "fans coolers" },
  ],
  toys: [
    { label: "Action Figures", emoji: "🤖", searchTerm: "action figures" },
    { label: "Dolls & Playsets", emoji: "🪆", searchTerm: "dolls" },
    { label: "Board Games", emoji: "🎲", searchTerm: "board games" },
    { label: "Puzzles", emoji: "🧩", searchTerm: "puzzles" },
    { label: "Educational Toys", emoji: "🧠", searchTerm: "educational toys" },
    { label: "Outdoor Play", emoji: "🪀", searchTerm: "outdoor play" },
    { label: "Soft Toys", emoji: "🧸", searchTerm: "soft toys" },
  ],
  sports: [
    { label: "Fitness Equipment", emoji: "🏋️", searchTerm: "fitness equipment" },
    { label: "Cricket", emoji: "🏏", searchTerm: "cricket" },
    { label: "Football", emoji: "⚽", searchTerm: "football" },
    { label: "Cycling", emoji: "🚴", searchTerm: "cycling" },
    { label: "Yoga", emoji: "🧘", searchTerm: "yoga" },
    { label: "Sportswear", emoji: "👕", searchTerm: "sportswear" },
    { label: "Outdoor & Camping", emoji: "🏕️", searchTerm: "camping" },
  ],
  stationery: [
    { label: "Notebooks & Diaries", emoji: "📓", searchTerm: "notebooks" },
    { label: "Pens & Pencils", emoji: "✏️", searchTerm: "pens pencils" },
    { label: "Art Supplies", emoji: "🖍️", searchTerm: "art supplies" },
    { label: "Office Supplies", emoji: "📎", searchTerm: "office supplies" },
    { label: "School Supplies", emoji: "🎒", searchTerm: "school supplies" },
    { label: "Files & Folders", emoji: "🗂️", searchTerm: "files folders" },
  ],
  musicalinstruments: [
    { label: "Guitars", emoji: "🎸", searchTerm: "guitars" },
    { label: "Keyboards & Pianos", emoji: "🎹", searchTerm: "keyboards pianos" },
    { label: "Drums & Percussion", emoji: "🥁", searchTerm: "drums percussion" },
    { label: "Wind Instruments", emoji: "🎷", searchTerm: "wind instruments" },
    { label: "Violins", emoji: "🎻", searchTerm: "violins" },
    { label: "Accessories", emoji: "🎼", searchTerm: "instrument accessories" },
  ],
  healthcare: [
    { label: "Health Monitors", emoji: "🩺", searchTerm: "health monitors" },
    { label: "Vitamins & Supplements", emoji: "💊", searchTerm: "vitamins supplements" },
    { label: "First Aid", emoji: "🩹", searchTerm: "first aid" },
    { label: "Personal Care", emoji: "🧼", searchTerm: "personal care" },
    { label: "Medical Equipment", emoji: "🏥", searchTerm: "medical equipment" },
    { label: "Ayurveda & Herbal", emoji: "🌿", searchTerm: "ayurveda herbal" },
  ],
  groceries: [
    { label: "Fruits & Vegetables", emoji: "🥦", searchTerm: "fruits vegetables" },
    { label: "Dairy & Eggs", emoji: "🥛", searchTerm: "dairy eggs" },
    { label: "Snacks", emoji: "🍿", searchTerm: "snacks" },
    { label: "Beverages", emoji: "🧃", searchTerm: "beverages" },
    { label: "Staples & Grains", emoji: "🌾", searchTerm: "staples grains" },
    { label: "Bakery", emoji: "🍞", searchTerm: "bakery" },
    { label: "Spices & Condiments", emoji: "🧂", searchTerm: "spices condiments" },
  ],
  artscrafts: [
    { label: "Painting Supplies", emoji: "🎨", searchTerm: "painting supplies" },
    { label: "Craft Kits", emoji: "🧵", searchTerm: "craft kits" },
    { label: "Beads & Jewellery Making", emoji: "📿", searchTerm: "beads jewellery making" },
    { label: "Sketching & Drawing", emoji: "✏️", searchTerm: "sketching drawing" },
    { label: "Sculpting & Clay", emoji: "🏺", searchTerm: "sculpting clay" },
    { label: "Sewing & Knitting", emoji: "🧶", searchTerm: "sewing knitting" },
  ],
};
