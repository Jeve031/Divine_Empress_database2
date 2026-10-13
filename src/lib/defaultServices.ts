export interface ServiceItem {
  id?: number;
  name: string;
  price: string;
  category: string;
  categoryOrder?: number;
  sortOrder?: number;
  isAvailable?: boolean;
}

export interface CategoryGroup {
  title: string;
  items: {
    id?: number;
    name: string;
    price: string;
    isAvailable?: boolean;
  }[];
}

export const defaultPriceCategories = [
  {
    title: "Colour",
    items: [
      { name: "Full colour (short)", price: "R300" },
      { name: "Full colour (medium)", price: "R400" },
      { name: "Full colour (long)", price: "R480" },
      { name: "Half head highlights (short)", price: "R450" },
      { name: "Half head highlights (medium)", price: "R550" },
      { name: "Half head highlights (long)", price: "R650" },
      { name: "Full head highlights (short)", price: "R600" },
      { name: "Full head highlights (medium)", price: "R680" },
      { name: "Full head highlights (long)", price: "R750" },
    ],
  },
  {
    title: "Wash & Set",
    items: [
      { name: "Short", price: "R150" },
      { name: "Shoulder length", price: "R180" },
      { name: "Long", price: "R200" },
      { name: "Extra long", price: "R250" },
    ],
  },
  {
    title: "Wash & Treat",
    items: [
      { name: "Short", price: "R200" },
      { name: "Shoulder length", price: "R250" },
      { name: "Long", price: "R300" },
      { name: "Extra long", price: "R380" },
    ],
  },
  {
    title: "Trims",
    items: [
      { name: "Straight trim", price: "R50" },
      { name: "Straight cut", price: "R100" },
    ],
  },
  {
    title: "Cornrows",
    items: [
      { name: "Straight back", price: "R250" },
      { name: "Styles", price: "R300" },
      { name: "Goddess", price: "R350" },
    ],
  },
  {
    title: "Fulani Braids",
    items: [
      { name: "Small", price: "R780" },
      { name: "Medium", price: "R750" },
      { name: "Large", price: "R650" },
    ],
  },
  {
    title: "Knotless Braids",
    items: [
      { name: "Small", price: "R680" },
      { name: "Medium", price: "R600" },
      { name: "Large", price: "R550" },
      { name: "Jumbo", price: "R450" },
    ],
  },
  {
    title: "Box Braids",
    items: [
      { name: "Small", price: "R600" },
      { name: "Medium", price: "R550" },
      { name: "Large", price: "R480" },
      { name: "Jumbo", price: "R380" },
    ],
  },
  {
    title: "Goddess Braids",
    items: [
      { name: "Small", price: "R750" },
      { name: "Medium", price: "R680" },
      { name: "Large", price: "R580" },
      { name: "Jumbo", price: "R500" },
    ],
  },
  {
    title: "Passion Twists",
    items: [
      { name: "Small", price: "R850" },
      { name: "Medium", price: "R780" },
      { name: "Large", price: "R680" },
      { name: "Jumbo", price: "R550" },
    ],
  },
];
