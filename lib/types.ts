export type ProductType = "DRINK" | "GUMMY" | "BUNDLE";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  type: ProductType;
  price: number; // paise
  compareAtPrice: number | null;
  images: string[];
  accentColor: string; // brand token, e.g. "brand-berry"
  flavor: string | null;
  mood: string | null;
  sizes: string[]; // e.g. bangle sizes ["2.2","2.4","2.6","2.8"]
  benefits: string[];
  ingredients: string | null;
  stock: number;
  featured: boolean;
};

export type ReviewView = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  images: string[];
  verified: boolean;
};

export type ReviewEligibility = {
  signedIn: boolean;
  purchased: boolean;
  alreadyReviewed: boolean;
};

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number; // unit price in paise
  image: string | null;
  accentColor: string;
  size: string | null;
  quantity: number;
};
