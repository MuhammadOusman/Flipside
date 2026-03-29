import { client } from "./sanity";

// Product CRUD Operations

export async function createProduct(productData: {
  name: string;
  slug: string;
  brand: string;
  size: string;
  price: number;
  condition: number;
  description?: string;
  images: Array<{ asset: { _ref: string }; alt?: string }>;
  stock: number;
  isSold?: boolean;
}) {
  try {
    const result = await client.create({
      _type: "product",
      ...productData,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error };
  }
}

export async function updateProduct(
  productId: string,
  updates: Partial<{
    name: string;
    slug: string;
    brand: string;
    size: string;
    price: number;
    condition: number;
    description: string;
    images: Array<{ asset: { _ref: string }; alt?: string }>;
    stock: number;
    isSold: boolean;
  }>
) {
  try {
    const result = await client.patch(productId).set(updates).commit();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const result = await client.delete(productId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error };
  }
}

// Image Upload

export async function uploadImage(file: File) {
  try {
    const result = await client.assets.upload("image", file, {
      filename: file.name,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { success: false, error };
  }
}

export async function uploadMultipleImages(files: File[]) {
  try {
    const uploads = await Promise.all(
      files.map((file) => client.assets.upload("image", file, {
        filename: file.name,
      }))
    );
    return { success: true, data: uploads };
  } catch (error) {
    console.error("Error uploading images:", error);
    return { success: false, error };
  }
}

// Order Management (if using Sanity for orders)

export async function createOrder(orderData: {
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  items: Array<{
    product: { _type: "reference"; _ref: string };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  paymentMethod: string;
}) {
  try {
    const result = await client.create({
      _type: "order",
      ...orderData,
      createdAt: new Date().toISOString(),
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const result = await client.patch(orderId).set({ status }).commit();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error };
  }
}

// Utility Functions

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function checkSlugUnique(slug: string): Promise<boolean> {
  try {
    const existing = await client.fetch(
      `*[_type == "product" && slug.current == $slug][0]`,
      { slug }
    );
    return !existing;
  } catch (error) {
    console.error("Error checking slug:", error);
    return false;
  }
}

// Brand CRUD Operations

export async function createBrand(brandData: {
  name: string;
  slug: string;
  description?: string;
  logo?: { asset: { _ref: string } };
  isActive?: boolean;
  order?: number;
}) {
  try {
    const result = await client.create({
      _type: "brand",
      isActive: true,
      order: 0,
      ...brandData,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating brand:", error);
    return { success: false, error };
  }
}

export async function updateBrand(
  brandId: string,
  updates: Partial<{
    name: string;
    slug: string;
    description: string;
    logo: { asset: { _ref: string } };
    isActive: boolean;
    order: number;
  }>
) {
  try {
    const result = await client.patch(brandId).set(updates).commit();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating brand:", error);
    return { success: false, error };
  }
}

export async function deleteBrand(brandId: string) {
  try {
    const result = await client.delete(brandId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting brand:", error);
    return { success: false, error };
  }
}

export async function getAllBrands() {
  try {
    const brands = await client.fetch(`*[_type == "brand"] | order(order asc, name asc)`);
    return { success: true, data: brands };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return { success: false, error };
  }
}
