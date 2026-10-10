export type Category = "Rice" | "Gravy" | "Snacks";

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  slide?: string;
  inStock: boolean;
  createdAt: string;
  rank: number;
  blurb: string;
};

export const products: Product[] = [
  {
    slug: "paneer-butter-masala",
    name: "Paneer Butter Masala",
    price: 299,
    category: "Gravy",
    image: "/images/products/paneer_buteer_masala_01_bg_removed.png.png",
    slide: "/images/products/paneer_buteer_masala_02_bg_removed.png.png",
    inStock: true,
    createdAt: "2026-01-12",
    rank: 1,
    blurb:
      "Rich tomato and butter gravy with paneer, cooked in Valsad and freeze-dried so you get restaurant-style flavour in five minutes.",
  },
  {
    slug: "palak-paneer",
    name: "Palak Paneer",
    price: 450,
    category: "Gravy",
    image: "/images/products/palak_paneer_01_bg_removed.png.png",
    slide: "/images/products/palak_paneer_02_bg_removed.png.png",
    inStock: true,
    createdAt: "2026-02-02",
    rank: 2,
    blurb:
      "Creamed spinach and paneer, cooked in Valsad and freeze-dried so the gravy comes back with hot water.",
  },
  {
    slug: "pav-bhaji",
    name: "Pav Bhaji",
    price: 450,
    category: "Snacks",
    image: "/images/products/pav_bhaji_01_bg_removed.png.png",
    slide: "/images/products/pav_bhaji_02_bg_removed.png.png",
    inStock: true,
    createdAt: "2026-08-01",
    rank: 3,
    blurb:
      "Our newest launch. Buttery bhaji, freeze-dried, ready with hot water in about five minutes.",
  },
  {
    slug: "jeera-rice",
    name: "Jeera Rice",
    price: 399,
    category: "Rice",
    image: "/images/products/jeera_rice_01_bg_removed.png.png",
    slide: "/images/products/jeera_rice_02_bg_removed.png.png",
    inStock: true,
    createdAt: "2026-03-18",
    rank: 4,
    blurb: "Fragrant cumin rice, cooked fresh and freeze-dried for the shelf.",
  },
  {
    slug: "veg-dum-biryani",
    name: "Veg Dum Biryani",
    price: 499,
    category: "Rice",
    image: "/images/products/veg_dum_biryani__01_bg_removed.png.png",
    slide: "/images/products/veg_dum_biryani__02__bg_removed.png.png",
    inStock: true,
    createdAt: "2026-04-04",
    rank: 5,
    blurb: "Layered vegetable biryani from the Valsad kitchen, sealed without preservatives.",
  },
  {
    slug: "dal-khichdi",
    name: "Dal Khichdi",
    price: 420,
    category: "Rice",
    image: "/images/products/dal_khichdi_01_bg_removed.png.png",
    slide: "/images/products/dal_khichdi_02__bg_removed.png.png",
    inStock: true,
    createdAt: "2026-01-28",
    rank: 6,
    blurb: "Comforting dal khichdi, cooked fresh and freeze-dried to rehydrate into a warm, filling meal.",
  },
  {
    slug: "rajma-masala",
    name: "Rajma Masala",
    price: 399,
    category: "Gravy",
    image: "/images/products/rajma_masala_01__bg_removed.png.png",
    slide: "/images/products/rajma_masala_02__bg_removed.png.png",
    inStock: true,
    createdAt: "2026-05-11",
    rank: 7,
    blurb: "Kidney beans in a tomato masala, freeze-dried to keep for over a year.",
  },
  {
    slug: "chole-masala",
    name: "Chole Masala",
    price: 399,
    category: "Gravy",
    image: "/images/products/chole_masala_01_bg_removed.png.png",
    slide: "/images/products/chole_masala_02_bg_removed.png.png",
    inStock: true,
    createdAt: "2026-05-20",
    rank: 8,
    blurb: "Punjabi-style chickpeas, cooked once and never boiled a second time.",
  },
  {
    slug: "dal-tadka",
    name: "Dal Tadka",
    price: 379,
    category: "Gravy",
    image: "/images/products/dal_tadka_01_bg_removed.png.png",
    slide: "/images/products/dal_tadka_02_bg_removed.png.png",
    inStock: true,
    createdAt: "2026-06-02",
    rank: 9,
    blurb: "Classic home-style dal tadka with tempered spices, ready in minutes with hot water.",
  },
  {
    slug: "shahi-paneer",
    name: "Shahi Paneer",
    price: 349,
    category: "Gravy",
    image: "/images/products/shahi_paneer_01_bg_removed.png.png",
    slide: "/images/products/shahi_paneer_02_bg_removed.png.png",
    inStock: true,
    createdAt: "2026-06-12",
    rank: 10,
    blurb: "Creamy paneer gravy with aromatic spices, freeze-dried for convenient travel-friendly meals.",
  },
];

export const categories = ["All", "Rice", "Gravy", "Snacks"] as const;

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export const featuredSlides = products.filter((product) => product.slide);

export const processHeading = "How we make food that lasts a year without a single preservative";

export const processSteps = [
  {
    title: "No Party Planning Headaches",
    body: "Most food goes off because of water. Take the water out, and there's nothing left for bacteria or mould to grow in. So that's what we do.",
    className: "bg-[#e7c49a]",
  },
  {
    title: "Activity + Return Gift in One",
    body: "We cook it fresh in our own kitchen — real paneer, real ghee, real spices. Then we flash-freeze it at -45°C, cold enough that ice forms in tiny crystals instead of large ones, which is what keeps the texture right when you rehydrate it later.",
    className: "bg-[#f0d3ae]",
  },
  {
    title: "Something for Everyone",
    body: "Then, under vacuum, that ice turns straight to vapour without ever melting — so the food is never boiled a second time. What's left has less than 4% moisture, keeps for over a year on a shelf, and comes back to life with hot water.",
    className: "bg-[#e8c9a2]",
  },
  {
    title: "Kids actually stay engaged",
    body: "It's the same method used to feed astronauts. We just thought it should also work for dal makhani.",
    className: "bg-[#f3dcc0]",
  },
];

export const comparisonRows = [
  {
    label: "Nutrient retention",
    freeze: "High. Heat sensitive nutrients largely preserved.",
    retort: "Lower. Extended heat degrades some vitamins.",
  },
  {
    label: "Texture",
    freeze: "Pieces hold their shape and rebuild on rehydration.",
    retort: "Softened by extended heat - panneer & veggies break down",
  },
  {
    label: "Heat exposure",
    freeze: "No second cook. The food is never boiled twice.",
    retort: "Prolonged high heat after cooking.",
  },
  { label: "Weight/ meal", freeze: "50-80g", retort: "250-300g" },
  {
    label: "Travel & trekking",
    freeze: "Practical - light enough to carry days of meals.",
    retort: "Impractical at that weight.",
  },
  {
    label: "Preparation",
    freeze: "Add hot water and wait for 5 minutes",
    retort: "Heat the pouch and wait 3-5 minutes.",
  },
];

export const faqs = [
  {
    q: "How long does shipping take?",
    a: "Orders within India typically leave Valsad within two working days and arrive in 3–7 days, depending on your PIN code.",
  },
  {
    q: "Does the pouch stay good in my bag?",
    a: "Yes. With less than 4% moisture there is nothing for mould to grow in, so the sealed pouch does not need a fridge.",
  },
  {
    q: "Do you ship internationally?",
    a: "This checkout is set up for addresses in India. International shipping is not available yet.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, credit and debit cards, netbanking, and other methods supported by Razorpay at checkout.",
  },
  {
    q: "How does Buy 2 get 1 free work?",
    a: "For every three items in your cart, the lowest-priced item among those units is free. It applies automatically at checkout and can be combined with the INSTA10 code.",
  },
];
