"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Database, Save, Shield, Store } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "Flipside",
    storeEmail: "contact@flipside.pk",
    storePhone: "+92 300 1234567",
    storeAddress: "Lahore, Pakistan",
    whatsappNumber: "+923001234567",
    lowStockThreshold: "5",
    enableNotifications: true,
    enableEmailAlerts: true,
  });

  const [envHints, setEnvHints] = useState({
    supabaseUrl: "",
    supabaseAnon: "",
    supabaseServiceRole: "",
    defaultTenantId: "",
  });

  const handleSave = () => {
    alert("Settings saved in UI. Persist to DB or env management tool next.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 font-heading text-4xl">SETTINGS</h1>
        <p className="font-bold text-gray-600">Configure your Supabase-powered store</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-4 border-black bg-white p-6 shadow-hard"
      >
        <div className="mb-6 flex items-center gap-3">
          <Store size={24} className="text-[var(--comic-purple)]" />
          <h2 className="font-heading text-2xl">STORE INFORMATION</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <input className="border-2 border-black px-4 py-3 font-bold" value={settings.storeName} onChange={(e) => setSettings((s) => ({ ...s, storeName: e.target.value }))} placeholder="Store name" />
          <input className="border-2 border-black px-4 py-3 font-bold" value={settings.storeEmail} onChange={(e) => setSettings((s) => ({ ...s, storeEmail: e.target.value }))} placeholder="Store email" />
          <input className="border-2 border-black px-4 py-3 font-bold" value={settings.storePhone} onChange={(e) => setSettings((s) => ({ ...s, storePhone: e.target.value }))} placeholder="Store phone" />
          <input className="border-2 border-black px-4 py-3 font-bold" value={settings.whatsappNumber} onChange={(e) => setSettings((s) => ({ ...s, whatsappNumber: e.target.value }))} placeholder="WhatsApp number" />
          <input className="border-2 border-black px-4 py-3 font-bold md:col-span-2" value={settings.storeAddress} onChange={(e) => setSettings((s) => ({ ...s, storeAddress: e.target.value }))} placeholder="Store address" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-4 border-black bg-white p-6 shadow-hard"
      >
        <div className="mb-6 flex items-center gap-3">
          <Database size={24} className="text-[var(--comic-red)]" />
          <h2 className="font-heading text-2xl">SUPABASE ENV CHECKLIST</h2>
        </div>

        <div className="space-y-4">
          <input className="w-full border-2 border-black px-4 py-3 font-bold" value={envHints.supabaseUrl} onChange={(e) => setEnvHints((s) => ({ ...s, supabaseUrl: e.target.value }))} placeholder="NEXT_PUBLIC_SUPABASE_URL" />
          <input className="w-full border-2 border-black px-4 py-3 font-bold" value={envHints.supabaseAnon} onChange={(e) => setEnvHints((s) => ({ ...s, supabaseAnon: e.target.value }))} placeholder="NEXT_PUBLIC_SUPABASE_ANON_KEY" />
          <input className="w-full border-2 border-black px-4 py-3 font-bold" value={envHints.supabaseServiceRole} onChange={(e) => setEnvHints((s) => ({ ...s, supabaseServiceRole: e.target.value }))} placeholder="SUPABASE_SERVICE_ROLE_KEY" />
          <input className="w-full border-2 border-black px-4 py-3 font-bold" value={envHints.defaultTenantId} onChange={(e) => setEnvHints((s) => ({ ...s, defaultTenantId: e.target.value }))} placeholder="NEXT_PUBLIC_DEFAULT_TENANT_ID" />
        </div>

        <div className="mt-4 border-2 border-black bg-gray-100 p-3 text-xs font-bold">
          Create Storage buckets: `product-media`, `payment-receipts`.
          Apply SQL migration: `supabase/migrations/20260330_init_multi_tenant_flipside.sql`.
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-4 border-black bg-white p-6 shadow-hard"
      >
        <div className="mb-6 flex items-center gap-3">
          <Bell size={24} className="text-[var(--comic-green)]" />
          <h2 className="font-heading text-2xl">NOTIFICATIONS</h2>
        </div>

        <label className="mb-3 flex items-center gap-3 font-bold">
          <input type="checkbox" checked={settings.enableNotifications} onChange={(e) => setSettings((s) => ({ ...s, enableNotifications: e.target.checked }))} />
          Enable browser notifications
        </label>
        <label className="mb-3 flex items-center gap-3 font-bold">
          <input type="checkbox" checked={settings.enableEmailAlerts} onChange={(e) => setSettings((s) => ({ ...s, enableEmailAlerts: e.target.checked }))} />
          Send email alerts for new orders
        </label>
        <label className="mb-2 block font-bold">Low stock threshold</label>
        <input className="border-2 border-black px-4 py-3 font-bold" value={settings.lowStockThreshold} onChange={(e) => setSettings((s) => ({ ...s, lowStockThreshold: e.target.value }))} />
      </motion.div>

      <button onClick={handleSave} className="flex w-full items-center justify-center gap-2 border-4 border-black bg-[var(--comic-red)] py-4 font-heading text-xl text-white shadow-hard transition hover:bg-red-600">
        <Save size={22} /> SAVE SETTINGS
      </button>

      <div className="border-4 border-black bg-black p-4 text-white">
        <p className="flex items-center gap-2 font-bold">
          <Shield size={18} /> Admin auth uses Supabase Email/Password. Keep keys secure.
        </p>
      </div>
    </div>
  );
}
