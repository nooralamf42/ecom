import { z } from "zod";

export const addressSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email"),
  line1: z.string().min(3, "Enter your address"),
  line2: z.string().optional().default(""),
  city: z.string().min(2, "Enter your city"),
  state: z.string().min(2, "Enter your state"),
  pincode: z
    .string()
    .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit Indian pincode"),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        size: z.string().nullable().optional(),
      }),
    )
    .min(1, "Your cart is empty"),
  address: addressSchema,
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  tagline: z.string().optional().default(""),
  description: z.string().min(5),
  type: z.enum(["DRINK", "GUMMY", "BUNDLE"]),
  price: z.number().int().nonnegative(), // paise
  compareAtPrice: z.number().int().nonnegative().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  accentColor: z.string().default("brand-berry"),
  flavor: z.string().optional().default(""),
  mood: z.string().optional().default(""),
  sizes: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  ingredients: z.string().optional().default(""),
  stock: z.number().int().nonnegative().default(0),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  categoryId: z.string().optional().nullable(),
  newCategory: z.string().optional().default(""),
});

export type ProductInput = z.infer<typeof productSchema>;

export const reviewSchema = z.object({
  productId: z.string().min(1),
  author: z.string().min(2, "Please enter your name").max(60),
  rating: z.number().int().min(1, "Please pick a rating").max(5),
  comment: z.string().min(3, "Please write a short review").max(1000),
  images: z.array(z.string().url()).max(6, "Up to 6 photos").default([]),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
