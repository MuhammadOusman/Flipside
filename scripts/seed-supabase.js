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

async function main() {
  const envFile = path.resolve(process.cwd(), ".env.local");
  const envData = parseEnvFile(envFile);
  const env = { ...envData, ...process.env };

  const SUPABASE_URL = getEnvValue("NEXT_PUBLIC_SUPABASE_URL", env);
  const SUPABASE_SERVICE_ROLE_KEY = getEnvValue("SUPABASE_SERVICE_ROLE_KEY", env);
  const DEFAULT_TENANT_ID = getEnvValue(
    "NEXT_PUBLIC_DEFAULT_TENANT_ID",
    env
  );
  const domainList = getEnvValue("SEED_TENANT_DOMAINS", env)
    ? getEnvValue("SEED_TENANT_DOMAINS", env).split(",").map((item) => item.trim())
    : ["localhost", "127.0.0.1"];

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !DEFAULT_TENANT_ID) {
    throw new Error(
      "Missing required env vars. Make sure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and NEXT_PUBLIC_DEFAULT_TENANT_ID are set."
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Seeding Supabase test data for tenant:", DEFAULT_TENANT_ID);

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

  const products = [
    {
      tenant_id: DEFAULT_TENANT_ID,
      slug: "jordan-4-military-black",
      brand: "Jordan",
      model: "4 Military Black",
      size_uk: 8,
      size_eur: 42,
      condition_grade: "9/10",
      flaws: ["minor creasing"],
      images: ["https://via.placeholder.com/500x400?text=Jordan+4+Military+Black"],
      video_url: null,
      price: 48000,
      sourcing_cost: 32000,
      status: "available",
      reserved_by: null,
      reserved_until: null,
      drop_time: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      tenant_id: DEFAULT_TENANT_ID,
      slug: "yeezy-350-bred",
      brand: "Yeezy",
      model: "350 Bred",
      size_uk: 9,
      size_eur: 43,
      condition_grade: "8.5/10",
      flaws: ["light scuff"],
      images: ["https://via.placeholder.com/500x400?text=Yeezy+350+Bred"],
      video_url: null,
      price: 52000,
      sourcing_cost: 35000,
      status: "available",
      reserved_by: null,
      reserved_until: null,
      drop_time: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      tenant_id: DEFAULT_TENANT_ID,
      slug: "dunk-low-panda",
      brand: "Nike",
      model: "Dunk Low Panda",
      size_uk: 8.5,
      size_eur: 42.5,
      condition_grade: "9.5/10",
      flaws: ["no box"],
      images: ["https://via.placeholder.com/500x400?text=Dunk+Low+Panda"],
      video_url: null,
      price: 38000,
      sourcing_cost: 26000,
      status: "available",
      reserved_by: null,
      reserved_until: null,
      drop_time: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const { data: insertedProducts, error: productError } = await supabase
    .from("products")
    .insert(products)
    .select("id,slug");
  if (productError) {
    throw new Error(`Failed to seed products: ${productError.message}`);
  }

  const customers = [
    {
      tenant_id: DEFAULT_TENANT_ID,
      phone: "03001234567",
      total_orders: 1,
      is_blacklisted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      tenant_id: DEFAULT_TENANT_ID,
      phone: "03007654321",
      total_orders: 0,
      is_blacklisted: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const { error: customerError } = await supabase.from("customers").insert(customers);
  if (customerError) {
    throw new Error(`Failed to seed customers: ${customerError.message}`);
  }

  const firstProduct = insertedProducts[0];
  if (!firstProduct || !firstProduct.id) {
    throw new Error("Expected seeded products to return an id.");
  }

  const orders = [
    {
      tenant_id: DEFAULT_TENANT_ID,
      customer_name: "Ali Khan",
      phone: "03001234567",
      address: "Shahrah-e-Faisal, Karachi",
      city: "Karachi",
      product_id: firstProduct.id,
      payment_method: "cod_with_advance",
      advance_paid: false,
      receipt_image_url: null,
      order_status: "pending_verification",
      tracking_number: null,
      created_at: new Date().toISOString(),
    },
  ];

  const { error: orderError } = await supabase.from("orders").insert(orders);
  if (orderError) {
    throw new Error(`Failed to seed orders: ${orderError.message}`);
  }

  console.log("✅ Supabase seed complete.");
  console.log(`Seeded ${insertedProducts.length} products, ${customers.length} customers, and ${orders.length} order(s).`);
  console.log("Tenant domains:", domainList.join(", "));
  console.log("Run the app and visit /admin/analytics or /admin/brands to verify the cleaned state.");
}

main().catch((error) => {
  console.error("Seeder failed:", error.message || error);
  process.exit(1);
});
