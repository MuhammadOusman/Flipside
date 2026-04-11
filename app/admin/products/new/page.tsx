"use client";

import { useMemo, useState, useTransition } from "react";
import { createProductAction } from "@/app/actions/admin";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const productStatuses = ["draft", "dropping_soon", "available", "archived"] as const;

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function NewProductPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    slug: "",
    sizeUk: "9",
    sizeEur: "42",
    conditionGrade: "9/10",
    flaws: "",
    price: "45000",
    sourcingCost: "26000",
    status: "available",
    dropTime: "",
    videoFile: null as File | null,
    imageFiles: [] as File[],
  });

  const inferredSlug = useMemo(() => slugify(`${form.brand}-${form.model}`), [form.brand, form.model]);

  async function uploadProductAssets() {
    const supabase = getSupabaseBrowserClient();
    const imageUrls: string[] = [];

    for (const file of form.imageFiles) {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: uploadErr } = await supabase.storage
        .from("product-media")
        .upload(fileName, file, { upsert: false });

      if (uploadErr) {
        throw new Error(uploadErr.message);
      }

      const { data } = supabase.storage.from("product-media").getPublicUrl(fileName);
      imageUrls.push(data.publicUrl);
    }

    let videoUrl = "";
    if (form.videoFile) {
      const fileName = `${Date.now()}-${form.videoFile.name.replace(/\s+/g, "-")}`;
      const { error: uploadErr } = await supabase.storage
        .from("product-media")
        .upload(fileName, form.videoFile, { upsert: false });

      if (uploadErr) {
        throw new Error(uploadErr.message);
      }

      const { data } = supabase.storage.from("product-media").getPublicUrl(fileName);
      videoUrl = data.publicUrl;
    }

    return { imageUrls, videoUrl };
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const { imageUrls, videoUrl } = await uploadProductAssets();
        const result = await createProductAction({
          slug: form.slug || inferredSlug,
          brand: form.brand,
          model: form.model,
          sizeUk: Number(form.sizeUk),
          sizeEur: Number(form.sizeEur),
          conditionGrade: form.conditionGrade,
          flaws: form.flaws
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          images: imageUrls,
          videoUrl: videoUrl || undefined,
          price: Number(form.price),
          sourcingCost: Number(form.sourcingCost),
          status: form.status as "draft" | "dropping_soon" | "available" | "reserved" | "sold" | "archived",
          dropTime: form.dropTime || undefined,
        });

        if (!result.ok) {
          setError(result.message || "Failed to create product");
          return;
        }

        setSuccess("Product created successfully.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-4xl">ADD NEW PRODUCT</h1>
        <p className="font-bold text-gray-600">Create inventory with 1-of-1 anti-snipe support.</p>
      </div>

      {error && <div className="border-2 border-black bg-red-100 p-3 font-bold text-red-700">{error}</div>}
      {success && <div className="border-2 border-black bg-green-100 p-3 font-bold text-green-700">{success}</div>}

      <form onSubmit={onSubmit} className="space-y-4 border-4 border-black bg-white p-6 shadow-hard">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="border-2 border-black p-3"
            placeholder="Brand"
            value={form.brand}
            onChange={(e) => setForm((s) => ({ ...s, brand: e.target.value }))}
            required
          />
          <input
            className="border-2 border-black p-3"
            placeholder="Model"
            value={form.model}
            onChange={(e) => setForm((s) => ({ ...s, model: e.target.value }))}
            required
          />

          <input
            className="border-2 border-black p-3"
            placeholder={`Slug (auto: ${inferredSlug})`}
            value={form.slug}
            onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
          />
          <input
            className="border-2 border-black p-3"
            placeholder="Condition grade (e.g. 9/10)"
            value={form.conditionGrade}
            onChange={(e) => setForm((s) => ({ ...s, conditionGrade: e.target.value }))}
            required
          />

          <input
            type="number"
            step="0.5"
            className="border-2 border-black p-3"
            placeholder="Size UK"
            value={form.sizeUk}
            onChange={(e) => setForm((s) => ({ ...s, sizeUk: e.target.value }))}
            required
          />
          <input
            type="number"
            step="0.5"
            className="border-2 border-black p-3"
            placeholder="Size EUR"
            value={form.sizeEur}
            onChange={(e) => setForm((s) => ({ ...s, sizeEur: e.target.value }))}
            required
          />

          <input
            type="number"
            className="border-2 border-black p-3"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
            required
          />
          <input
            type="number"
            className="border-2 border-black p-3"
            placeholder="Sourcing Cost"
            value={form.sourcingCost}
            onChange={(e) => setForm((s) => ({ ...s, sourcingCost: e.target.value }))}
            required
          />

          <select
            className="border-2 border-black p-3"
            value={form.status}
            onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
          >
            {productStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            className="border-2 border-black p-3"
            value={form.dropTime}
            onChange={(e) => setForm((s) => ({ ...s, dropTime: e.target.value }))}
          />
        </div>

        <textarea
          className="w-full border-2 border-black p-3"
          placeholder="Flaws (comma-separated): No Box, Heel Drag"
          value={form.flaws}
          onChange={(e) => setForm((s) => ({ ...s, flaws: e.target.value }))}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <label className="border-2 border-dashed border-black p-3 font-bold">
            Product Images
            <input
              className="mt-2 w-full"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setForm((s) => ({ ...s, imageFiles: Array.from(e.target.files || []) }))}
              required
            />
          </label>

          <label className="border-2 border-dashed border-black p-3 font-bold">
            360 Video
            <input
              className="mt-2 w-full"
              type="file"
              accept="video/*"
              onChange={(e) => setForm((s) => ({ ...s, videoFile: e.target.files?.[0] || null }))}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full border-4 border-black bg-[var(--comic-green)] px-4 py-3 font-heading text-xl text-white shadow-hard disabled:opacity-60"
        >
          {isPending ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
