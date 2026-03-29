import { client } from "./sanity";

export interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  images: any[];
  brand: string;
  size: string;
  price: number;
  condition: number;
  isSold: boolean;
  description?: string;
  category?: string;
}

// Fetch all products
export async function getAllProducts(): Promise<Product[]> {
  const query = `*[_type == "product"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    images,
    brand,
    size,
    price,
    condition,
    isSold,
    description,
    category
  }`;
  
  return await client.fetch(query);
}

// Fetch single product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const query = `*[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    images,
    brand,
    size,
    price,
    condition,
    isSold,
    description,
    category
  }`;
  
  return await client.fetch(query, { slug });
}

// Fetch products by brand
export async function getProductsByBrand(brand: string): Promise<Product[]> {
  const query = `*[_type == "product" && brand == $brand && !isSold] | order(_createdAt desc) {
    _id,
    title,
    slug,
    images,
    brand,
    size,
    price,
    condition,
    isSold,
    description,
    category
  }`;
  
  return await client.fetch(query, { brand });
}

// Fetch available products (not sold)
export async function getAvailableProducts(): Promise<Product[]> {
  const query = `*[_type == "product" && !isSold] | order(_createdAt desc) {
    _id,
    title,
    slug,
    images,
    brand,
    size,
    price,
    condition,
    isSold,
    description,
    category
  }`;
  
  return await client.fetch(query);
}

// Fetch featured products (top condition, not sold, limit 6)
export async function getFeaturedProducts(): Promise<Product[]> {
  const query = `*[_type == "product" && !isSold] | order(condition desc) [0...6] {
    _id,
    title,
    slug,
    images,
    brand,
    size,
    price,
    condition,
    isSold,
    description,
    category
  }`;
  
  return await client.fetch(query);
}
