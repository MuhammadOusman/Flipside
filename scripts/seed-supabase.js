const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function parseEnvFile(filePath) {
  const result = {};
  if (!fs.existsSync(filePath)) {
    return result;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (value.startsWith("\"") && value.endsWith("\"")) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function getEnvValue(key, env) {
  return env[key] || process.env[key] || null;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function pick(items, index) {
  return items[index % items.length];
}

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function ensurePublicBucket(supabase, bucketName) {
  return supabase.storage.createBucket(bucketName, { public: true });
}

async function uploadProductImages(supabase, imageDir, limit = 24) {
  if (!fs.existsSync(imageDir)) {
    throw new Error(`Image directory does not exist: ${imageDir}`);
  }

  const files = fs
    .readdirSync(imageDir)
    .filter((name) => /\.(png|jpg|jpeg|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .slice(0, limit);

  if (files.length === 0) {
    throw new Error(`No supported image files found in ${imageDir}`);
  }

  return Promise.all(
    files.map(async (fileName) => {
      const filePath = path.join(imageDir, fileName);
      const buffer = fs.readFileSync(filePath);
      const objectPath = `seed/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("product-media")
        .upload(objectPath, buffer, { upsert: true });

      if (uploadError) {
        throw new Error(`Failed to upload image ${fileName}: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from("product-media")
        .getPublicUrl(objectPath);

      if (!data || !data.publicUrl) {
        throw new Error(`Public URL missing for ${fileName}`);
      }

      return {
        fileName,
        url: data.publicUrl,
      };
    })
  );
}

async function createAdminUser(supabase, email, password) {
  const adminClient = supabase.auth.admin;
  if (!adminClient || typeof adminClient.createUser !== "function") {
    console.log("Supabase admin auth is not available in this client. Skipping admin user creation.");
    return;
  }

  try {
    const { error } = await adminClient.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "admin" },
    });

    if (error && error.message.includes("already exists")) {
      console.log("Admin user already exists.");
      return;
    }

    if (error) {
      throw error;
    }

    console.log(`Created admin user: ${email}`);
  } catch (err) {
    if (err && err.message && err.message.includes("already exists")) {
      console.log("Admin user already exists.");
      return;
    }
    throw err;
  }
}

async function main() {
  const envFile = path.resolve(process.cwd(), ".env.local");
  const envData = parseEnvFile(envFile);
  const env = { ...envData, ...process.env };

  const SUPABASE_URL = getEnvValue("NEXT_PUBLIC_SUPABASE_URL", env);
  const SUPABASE_SERVICE_ROLE_KEY = getEnvValue("SUPABASE_SERVICE_ROLE_KEY", env);
  const DEFAULT_TENANT_ID = getEnvValue("NEXT_PUBLIC_DEFAULT_TENANT_ID", env);
  const domainList = getEnvValue("SEED_TENANT_DOMAINS", env)
    ? getEnvValue("SEED_TENANT_DOMAINS", env).split(",").map((item) => item.trim())
    : ["localhost", "127.0.0.1"];
  const imageDir = getEnvValue("SEED_IMAGE_DIR", env) || "C:\\Users\\OUSMAN\\Pictures\\flipside_ig_nobg";
  const adminEmail = getEnvValue("SEED_ADMIN_EMAIL", env) || "admin@flipside.local";
  const adminPassword = getEnvValue("SEED_ADMIN_PASSWORD", env) || "Flipside123!";
  const maxProducts = Number(getEnvValue("SEED_MAX_PRODUCTS", env) || 24);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !DEFAULT_TENANT_ID) {
    throw new Error(
      "Missing required env vars. Make sure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and NEXT_PUBLIC_DEFAULT_TENANT_ID are set."
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Seeding Supabase test data for tenant:", DEFAULT_TENANT_ID);
  console.log("Using image directory:", imageDir);

  const tablesToClear = ["orders", "customers", "products", "tenant_domains"];
  for (const table of tablesToClear) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("tenant_id", DEFAULT_TENANT_ID);
    if (error) {
      throw new Error(`Failed to clear ${table}: ${error.message}`);
    }
  }

  const { data: existingTenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id")
    .eq("id", DEFAULT_TENANT_ID)
    .maybeSingle();

  if (tenantError) {
    throw new Error(`Failed to query tenant: ${tenantError.message}`);
  }

  if (!existingTenant) {
    const { error: insertTenantError } = await supabase.from("tenants").insert({
      id: DEFAULT_TENANT_ID,
      name: "Flipside Test Store",
      slug: "flipside-test-store",
      theme: {},
      logo_url: null,
      created_at: new Date().toISOString(),
    });
    if (insertTenantError) {
      throw new Error(`Failed to create tenant: ${insertTenantError.message}`);
    }
    console.log("Created tenant record.");
  } else {
    console.log("Tenant already exists.");
  }

  await Promise.all([
    ensurePublicBucket(supabase, "product-media"),
    ensurePublicBucket(supabase, "payment-receipts"),
  ]).catch((error) => {
    if (error && error.message && !error.message.toLowerCase().includes("already exists")) {
      throw new Error(`Failed to ensure storage buckets: ${error.message}`);
    }
  });

  const domains = domainList.map((domain) => ({
    tenant_id: DEFAULT_TENANT_ID,
    domain,
  }));

  const { error: domainError } = await supabase
    .from("tenant_domains")
    .upsert(domains, { onConflict: "domain" });
  if (domainError) {
    throw new Error(`Failed to seed tenant domains: ${domainError.message}`);
  }

  const uploadResults = await uploadProductImages(supabase, imageDir, maxProducts);
  const imageUrls = uploadResults.map((item) => item.url);

  const brandOptions = [
    "Jordan",
    "Yeezy",
    "Nike",
    "Adidas",
    "New Balance",
    "Converse",
    "Puma",
    "Reebok",
    "ASICS",
    "Vans",
  ];

  const modelDescriptors = [
    "Retro",
    "OG",
    "Low",
    "Mid",
    "Edition",
    "Vintage",
    "Prime",
    "Classic",
    "Signature",
    "Court",
  ];

  const flawOptions = [
    "minor creasing",
    "light scuff",
    "no box",
    "slight sole yellowing",
    "heel drag",
    "surface marks",
    "minor dent",
    "new with tags",
    "near perfect",
  ];

  const conditionOptions = ["10/10", "9.5/10", "9/10", "8.5/10", "8/10"];
  const paymentMethods = ["cod_with_advance", "full_bank_transfer"];

  const products = imageUrls.map((url, index) => {
    const brand = pick(brandOptions, index);
    const model = `${pick(modelDescriptors, index)} ${index + 1}`;
    const sizeUkValues = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];
    const sizeUk = pick(sizeUkValues, index);
    const sizeEur = sizeUk + 33;
    const price = 25000 + (index % 10) * 5000 + Math.round(Math.random() * 3000);
    const sourcingCost = Math.round(price * (0.55 + Math.random() * 0.15));

    const status = index % 7 === 0 ? "dropping_soon" : index % 9 === 0 ? "reserved" : index % 13 === 0 ? "sold" : "available";
    const reservedUntil = status === "reserved" ? new Date(Date.now() + 20 * 60 * 1000).toISOString() : null;
    const dropTime = status === "dropping_soon" ? new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() : null;
    const flaws = [randomChoice(flawOptions)];

    return {
      tenant_id: DEFAULT_TENANT_ID,
      slug: slugify(`${brand}-${model}-${index + 1}`),
      brand,
      model,
      size_uk: sizeUk,
      size_eur: sizeEur,
      condition_grade: randomChoice(conditionOptions),
      flaws,
      images: [url],
      video_url: null,
      price,
      sourcing_cost: sourcingCost,
      status,
      reserved_by: status === "reserved" ? `session-${index + 100}` : null,
      reserved_until: reservedUntil,
      drop_time: dropTime,
      created_at: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const { data: insertedProducts, error: productError } = await supabase
    .from("products")
    .insert(products)
    .select("id,slug,status,brand,model,price");

  if (productError) {
    throw new Error(`Failed to seed products: ${productError.message}`);
  }

  const customers = [
    {
      tenant_id: DEFAULT_TENANT_ID,
      phone: "03001234567",
      total_orders: 3,
      is_blacklisted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      tenant_id: DEFAULT_TENANT_ID,
      phone: "03007654321",
      total_orders: 1,
      is_blacklisted: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      tenant_id: DEFAULT_TENANT_ID,
      phone: "03001230000",
      total_orders: 2,
      is_blacklisted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const { error: customerError } = await supabase.from("customers").insert(customers);
  if (customerError) {
    throw new Error(`Failed to seed customers: ${customerError.message}`);
  }

  const orderSamples = insertedProducts.slice(0, 5).map((product, index) => {
    const phone = index === 1 ? "03007654321" : index === 2 ? "03001230000" : "03001234567";
    const payment_method = paymentMethods[index % paymentMethods.length];
    const status = index === 0 ? "pending_verification" : index === 1 ? "processing" : index === 2 ? "dispatched" : "delivered";
    const trackingNumber = status === "dispatched" ? `TRK-${Date.now()}-${index}` : null;
    const advance_paid = payment_method === "cod_with_advance";

    return {
      tenant_id: DEFAULT_TENANT_ID,
      customer_name: index === 1 ? "Zara Noor" : index === 2 ? "Asad Raza" : "Ali Khan",
      phone,
      address: index === 1 ? "Gulberg, Lahore" : index === 2 ? "DHA, Karachi" : "Shahrah-e-Faisal, Karachi",
      city: index === 1 ? "Lahore" : index === 2 ? "Karachi" : "Karachi",
      product_id: product.id,
      payment_method,
      advance_paid,
      receipt_image_url: null,
      order_status: status,
      tracking_number: trackingNumber,
      created_at: new Date(Date.now() - index * 2 * 60 * 60 * 1000).toISOString(),
    };
  });

  const { error: orderError } = await supabase.from("orders").insert(orderSamples);
  if (orderError) {
    throw new Error(`Failed to seed orders: ${orderError.message}`);
  }

  await createAdminUser(supabase, adminEmail, adminPassword);

  console.log("✅ Supabase seed complete.");
  console.log(`Seeded ${insertedProducts.length} products, ${customers.length} customers, and ${orderSamples.length} order(s).`);
  console.log("Tenant domains:", domainList.join(", "));
  console.log(`Admin user: ${adminEmail} / ${adminPassword}`);
  console.log("Use the shipped product images from local demo assets in the store.");
}

main().catch((error) => {
  console.error("Seeder failed:", error.message || error);
  process.exit(1);
});
