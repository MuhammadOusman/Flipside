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

function ensurePublicBucket(supabase, bucketName) {
  return supabase.storage.createBucket(bucketName, { public: true });
}

function normalizeText(text) {
  return (text || "").replace(/\*/g, "").trim();
}

function parseBrandModel(title) {
  const knownBrands = [
    "Le coq sportif",
    "Adidas",
    "Nike",
    "Reebok",
    "Lacoste",
    "Champion",
    "Mizuno",
    "Quechua",
    "Anna Field",
    "Jordan",
    "Vans",
    "Converse",
    "New Balance",
    "Flip Side",
  ];

  const normalizedTitle = normalizeText(title);
  const lower = normalizedTitle.toLowerCase();

  for (const brand of knownBrands) {
    const lowBrand = brand.toLowerCase();
    if (lower.startsWith(lowBrand)) {
      const model = normalizedTitle.slice(brand.length).trim();
      return { brand, model: model || brand };
    }
  }

  const words = normalizedTitle.split(/\s+/);
  if (words.length > 1) {
    return { brand: words[0], model: words.slice(1).join(" ") };
  }

  return { brand: normalizedTitle || "Flip Side", model: normalizedTitle || "Sneakers" };
}

function parsePrice(lines) {
  for (const line of lines) {
    const match = line.match(/Rs\.??\s*([0-9,]+)/i);
    if (match) {
      return Number(match[1].replace(/,/g, ""));
    }
  }
  return null;
}

function parseSize(lines) {
  let sizeEur = null;
  let sizeUk = null;
  for (const line of lines) {
    const eurMatch = line.match(/Size[:]?\s*([0-9]+(?:\.[0-9]+)?)\s*(EUR)?/i);
    if (eurMatch) {
      sizeEur = Number(eurMatch[1]);
      continue;
    }
    const ukMatch = line.match(/Size\s*UK[:]?\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (ukMatch) {
      sizeUk = Number(ukMatch[1]);
      continue;
    }
  }

  if (sizeUk == null && sizeEur != null) {
    sizeUk = Math.round((sizeEur - 33) * 2) / 2;
  }
  if (sizeEur == null && sizeUk != null) {
    sizeEur = Math.round((sizeUk + 33) * 2) / 2;
  }

  return {
    size_uk: sizeUk || 8,
    size_eur: sizeEur || Math.round((sizeUk || 8) + 33),
  };
}

function parseCondition(lines) {
  for (const line of lines) {
    const match = line.match(/Condition[:]?\s*([0-9]+(?:\.[05])?\/[0-9]+)/i);
    if (match) {
      return match[1];
    }
  }
  return "9/10";
}

function parseFlaws(lines) {
  const low = lines.join(" ").toLowerCase();
  if (low.includes("no box")) return ["no box"];
  if (low.includes("scuff")) return ["light scuff"];
  if (low.includes("crease")) return ["minor creasing"];
  if (low.includes("yellow")) return ["slight sole yellowing"];
  return ["preloved"];
}

function parseProductMeta(post) {
  const lines = post.alt
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const title = lines[0] || "Flip Side Shoe";
  const { brand, model } = parseBrandModel(title);
  const { size_uk, size_eur } = parseSize(lines);
  const condition_grade = parseCondition(lines);
  const price = parsePrice(lines) || 15000;
  const sourcing_cost = Math.round(price * 0.6);
  const flaws = parseFlaws(lines);

  return {
    brand,
    model,
    size_uk,
    size_eur,
    condition_grade,
    price,
    sourcing_cost,
    flaws,
  };
}

async function uploadProductImages(supabase, imageDir, limit = 24) {
  if (!fs.existsSync(imageDir)) {
    throw new Error(`Image directory does not exist: ${imageDir}`);
  }

  const folders = fs
    .readdirSync(imageDir)
    .map((name) => path.join(imageDir, name))
    .filter((entry) => fs.statSync(entry).isDirectory())
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b), undefined, { numeric: true }))
    .slice(0, limit);

  const uploadTasks = folders.map(async (folderPath) => {
    const folderName = path.basename(folderPath);
    const imageFile = fs
      .readdirSync(folderPath)
      .find((name) => /\.(png|jpe?g|webp)$/i.test(name));

    if (!imageFile) {
      return null;
    }

    const filePath = path.join(folderPath, imageFile);
    const buffer = fs.readFileSync(filePath);
    const slugMatch = folderName.match(/([A-Za-z0-9_-]{11})$/);
    const slugId = slugMatch ? slugMatch[1] : null;
    if (!slugId) {
      return null;
    }
    const objectPath = `seed/${slugId}/${imageFile}`;

    const { error: uploadError } = await supabase.storage
      .from("product-media")
      .upload(objectPath, buffer, { upsert: true });

    if (uploadError) {
      throw new Error(`Failed to upload image ${filePath}: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("product-media").getPublicUrl(objectPath);
    if (!data || !data.publicUrl) {
      throw new Error(`Public URL missing for ${filePath}`);
    }

    return {
      folderName,
      slugId,
      url: data.publicUrl,
    };
  });

  const results = (await Promise.all(uploadTasks)).filter(Boolean);
  if (results.length === 0) {
    throw new Error(`No supported images found in subfolders of ${imageDir}`);
  }
  return results;
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

    const duplicateEmailRegex = /already.*(exists|registered)|A user with this email address has already been registered/i;
    if (error && duplicateEmailRegex.test(error.message)) {
      console.log("Admin user already exists.");
      return;
    }

    if (error) {
      throw error;
    }

    console.log(`Created admin user: ${email}`);
  } catch (err) {
    const duplicateEmailRegex = /already.*(exists|registered)|A user with this email address has already been registered/i;
    if (err && err.message && duplicateEmailRegex.test(err.message)) {
      console.log("Admin user already exists.");
      return;
    }
    throw err;
  }
}

const IG_POSTS = [
  {
    slugId: "DSSum__jYwg",
    alt: "Photo by Flip Side on December 15, 2025.",
  },
  {
    slugId: "DU50HhejWpj",
    alt: "Photo by Flip Side on February 18, 2026. May be an image of poster, trainers and text that says \"FLIPSIDE Ramazan MUBARAK C c NBA-\".",
  },
  {
    slugId: "DTNubKIjXqo",
    alt: "Le coq sportif Agate Lo femme\n\n👟 Size: 40 EUR\n✨ Condition: 10/10 \n💰 Price: Rs. 2,000/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftstorepakistan #thriftpakistan #prelovedpakistan #lecoqsportif #landabazar",
  },
  {
    slugId: "DTLq1E0Dfca",
    alt: "Adidas Caflair\n\n👟 Size: 41.5 EUR\n✨ Condition: 9/10 \n💰 Price: Rs. 1,500/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftstorepakistan #thriftpakistan #adidaspakistan #prelovedpakistan #landabazar",
  },
  {
    slugId: "DTLNYEkDXf0",
    alt: "Anna Field Trainers\n\n👟 Size: 40 EUR\n✨ Condition: 9/10 \n💰 Price: Rs. 1,200/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#flipside #annafield #trainers #thrifty #thriftshoespk",
  },
  {
    slugId: "DTI-ag4jaOG",
    alt: "Champion Rebound Platform Low\n\n👟 Size: 39 EUR\n✨ Condition: 10/10 \n💰 Price: Rs. 4,000/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftpakistan #thriftstorepakistan #prelovedpakistan #championshoes #thriftfinds",
  },
  {
    slugId: "DTIjeYojdVK",
    alt: "Le coq sportif Classic soft tricolore\n\n👟 Size: 42 EUR\n✨ Condition: 9.5/10 \n💰 Price: Rs. 2,000/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftpakistan #thriftstorepakistan #lecoqsportif #prelovedpakistan #landabazar",
  },
  {
    slugId: "DTGX7AxDbVb",
    alt: "Nike Air Jordan 1 Mid\n\n👟 Size: 41 EUR\n✨ Condition: 9/10 \n💰 Price: Rs. 1,500/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftstorepakistan #thriftpakistan #prelovedpakistan #jordanpk #nikepakistan",
  },
  {
    slugId: "DTF8-4jjTVD",
    alt: "Lacoste Carnaby Graduate et stm\n\n👟 Size: 45 EUR\n✨ Condition: 9.5/10 \n💰 Price: Rs. 1,800/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftpakistan #thriftstorepakistan #prelovedpakistan #lacoste #landabazar",
  },
  {
    slugId: "DTDzETTDRwz",
    alt: "N*ke Air Max 200\n\n👟 Size: 45 EUR\n✨ Condition: 9.5/10 \n💰 Price: Rs. 2,000/-\n\n📩 DM me to grab this deal!",
  },
  {
    slugId: "DTDgil_jXX8",
    alt: "L*coste Carnaby Evo Rose Gold\n\n👟 Size: 41 EUR\n✨ Condition: 9/10 \n💰 Price: Rs. 1,300/-\n\n📩 DM me to grab this deal!\n\n#lacoste #carnaby #thriftshoespk #thriftedfashion #shoespk",
  },
  {
    slugId: "DS-pfOGDeYZ",
    alt: "Adidas VS Pace\n\n👟 Size: 43.5 EUR\n✨ Condition: 9.5/10 \n💰 Price: Rs. 2,000/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftstorepakistan #thriftpakistan #prelovedpakistan #adidaspakistan #adidasvspace",
  },
  {
    slugId: "DS-OqASDcOK",
    alt: "Adidas Ozweegos\n\n👟 Size: 40.5 EUR\n✨ Condition: 8/10 \n💰 Price: Rs. 1,000/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftpakistan #thriftstorefind #prelovedpakistan #adidaspakistan #thriftstorepakistan",
  },
  {
    slugId: "DS8EvnJDZjJ",
    alt: "Reebok Fabulista Midnight-out\n\n👟 Size: 40 EUR\n✨ Condition: 10/10 \n💰 Price: Rs. 2,000/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftpakistan #thriftstorepakistan #prelovedshoes #reebokpakistan #usedshoes",
  },
  {
    slugId: "DS7p0rBjb98",
    alt: "Arabic Triple White Sneakers\n\n👟 Size: 42 EUR\n✨ Condition: 8.5/10 \n💰 Price: Rs. 1,100/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftshoespakistan #thriftstorepakistan #thriftpakistan #prelovedshoes #usedshoes",
  },
  {
    slugId: "DS5f74KDX9_",
    alt: "Adidas Superstar\n\n👟 Size: 38.5 EUR\n✨ Condition: 8.5/10 \n💰 Price: Rs. 1,000/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#adidaspakistan #prelovedshoes #thriftstorepakistan #thriftpakistan #adidassuperstar",
  },
  {
    slugId: "DS5FBtVDaBh",
    alt: "Quechua NH 150\n\n👟 Size: 41 EUR\n✨ Condition: 9.5/10 \n💰 Price: Rs. 1,500/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftstorepakistan #prelovedshoes #usedshoes #quechuashoes #thriftpakistan",
  },
  {
    slugId: "DS2gRREjUZj",
    alt: "Mizuno Wave Rider 25\n\n👟 Size: 44.5 EUR\n✨ Condition: 10/10 \n💰 Price: Rs. 2,000/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftpakistan #prelovedpakistan #mizunopakistan #sneakerpakistan #shoespakistan",
  },
  {
    slugId: "DS27G9MjaGU",
    alt: "Adidas Stan Smith white silver metallic\n\n👟 Size: 40 EUR\n✨ Condition: 9/10 \n💰 Price: Rs. 1,200/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#adidaspakistan #stansmithpk #prelovedpakistan #thriftshoes #thriftpakistan",
  },
  {
    slugId: "DS0WXZ2DWWi",
    alt: "Adidas Grand Courte\n\n👟 Size: 40 EUR\n✨ Condition: 9/10 \n💰 Price: Rs. 1,500/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#prelovedpakistan #adidaspakistan #thríftstorefinds #thriftpakistan #sneakerspakistan",
  },
  {
    slugId: "DSz7evMjRtj",
    alt: "Nike Jordan Max Aura 4\n\n👟 Size: 40 EUR\n✨ Condition: 8.5/10 \n💰 Price: Rs. 1,000/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftsneakers #thriftpakistan #nikepakistan #airjordanpakistan #prelovedpakistan",
  },
  {
    slugId: "DSxxkLBiGDw",
    alt: "Adidas Gazelle\n\n👟 Size: 40 EUR\n✨ Condition: 9/10 \n💰 Price: Rs. 1,700/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftshoes #thriftpakistan #thriftstorepakistan #adidaspk #prelovedpakistan",
  },
  {
    slugId: "DSxW6hmCP0k",
    alt: "Adidas Hoops 3.0 low classic vintage\n\n👟 Size: 38 EUR\n✨ Condition: 9.5/10 \n💰 Price: Rs. 2,000/-\n\n📩 DM me to grab this deal!\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n#thriftshoes #thriftpakistan #adidashoops #adidaspk #prelovedpakistan",
  },
];

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
  const imageDir = getEnvValue("SEED_IMAGE_DIR", env) || "C:\\Users\\OUSMAN\\Pictures\\flipside_ig_nobg\\categorized_ig_posts";
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

  const products = IG_POSTS.map((post, index) => {
    const upload = uploadResults.find((result) => result.slugId === post.slugId);
    if (!upload) {
      console.log(`Skipping product ${post.slugId} because no uploaded image was found.`);
      return null;
    }

    const meta = parseProductMeta(post);
    const status = "available";
    const createdAt = new Date(Date.now() - index * 60 * 60 * 1000).toISOString();

    return {
      tenant_id: DEFAULT_TENANT_ID,
      slug: slugify(`${meta.brand}-${meta.model}-${post.slugId}`),
      brand: meta.brand,
      model: meta.model,
      size_uk: meta.size_uk,
      size_eur: meta.size_eur,
      condition_grade: meta.condition_grade,
      flaws: meta.flaws,
      images: [upload.url],
      video_url: null,
      price: meta.price,
      sourcing_cost: meta.sourcing_cost,
      status,
      reserved_by: null,
      reserved_until: null,
      drop_time: null,
      created_at: createdAt,
      updated_at: new Date().toISOString(),
    };
  }).filter(Boolean);

  if (products.length === 0) {
    throw new Error("No products were generated from Instagram captions and images.");
  }

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
      returned_parcels: 0,
      is_blacklisted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      tenant_id: DEFAULT_TENANT_ID,
      phone: "03007654321",
      total_orders: 1,
      returned_parcels: 0,
      is_blacklisted: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      tenant_id: DEFAULT_TENANT_ID,
      phone: "03001230000",
      total_orders: 2,
      returned_parcels: 0,
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
    const payment_method = index % 2 === 0 ? "cod_with_advance" : "full_bank_transfer";
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
}

main().catch((error) => {
  console.error("Seeder failed:", error.message || error);
  process.exit(1);
});
