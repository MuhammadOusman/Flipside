"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Save, Store, Bell, Shield, Database, Tag } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "Flipside",
    storeEmail: "contact@flipside.pk",
    storePhone: "+92 300 1234567",
    storeAddress: "Lahore, Pakistan",
    whatsappNumber: "+923001234567",
    currency: "PKR",
    lowStockThreshold: "5",
    enableNotifications: true,
    enableEmailAlerts: true,
    autoArchiveSold: false,
    enableAnalytics: true,
    trackPageViews: true,
    trackProductViews: true,
  });

  const [sanitySettings, setSanitySettings] = useState({
    projectId: "",
    dataset: "production",
    token: "",
  });

  const handleSave = () => {
    console.log("Settings saved:", settings);
    alert("Settings saved successfully!");
  };

  const handleSanitySave = () => {
    console.log("Sanity settings saved:", sanitySettings);
    alert("Sanity settings saved! Update your .env.local file with these values.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl mb-2">SETTINGS</h1>
        <p className="text-gray-600 font-bold">
          Configure your store and admin panel
        </p>
      </div>

      {/* Store Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-4 border-black shadow-hard p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Store size={24} className="text-[--comic-purple]" />
          <h2 className="font-heading text-2xl">STORE INFORMATION</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold mb-2">Store Name</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) =>
                setSettings({ ...settings, storeName: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Store Email</label>
            <input
              type="email"
              value={settings.storeEmail}
              onChange={(e) =>
                setSettings({ ...settings, storeEmail: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Store Phone</label>
            <input
              type="tel"
              value={settings.storePhone}
              onChange={(e) =>
                setSettings({ ...settings, storePhone: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">WhatsApp Number</label>
            <input
              type="tel"
              value={settings.whatsappNumber}
              onChange={(e) =>
                setSettings({ ...settings, whatsappNumber: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold mb-2">Store Address</label>
            <input
              type="text"
              value={settings.storeAddress}
              onChange={(e) =>
                setSettings({ ...settings, storeAddress: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
            />
          </div>
        </div>
      </motion.div>

      {/* Inventory Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-4 border-black shadow-hard p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Database size={24} className="text-[--comic-red]" />
          <h2 className="font-heading text-2xl">INVENTORY SETTINGS</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) =>
                setSettings({ ...settings, currency: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
            >
              <option value="PKR">PKR - Pakistani Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>

          <div>
            <label className="block font-bold mb-2">
              Low Stock Alert Threshold
            </label>
            <input
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) =>
                setSettings({ ...settings, lowStockThreshold: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[--comic-purple] font-bold"
            />
          </div>

          <div className="md:col-span-2 space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.autoArchiveSold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoArchiveSold: e.target.checked,
                  })
                }
                className="w-5 h-5 border-2 border-black"
              />
              <span className="font-bold">
                Automatically archive sold products
              </span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Brand Management Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white border-4 border-black shadow-hard p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Tag size={24} className="text-[--comic-purple]" />
          <h2 className="font-heading text-2xl">BRAND MANAGEMENT</h2>
        </div>
        <p className="text-gray-600 font-bold mb-4">
          Add, edit, or remove shoe brands available in your store. Manage brand
          information and track products per brand.
        </p>
        <Link href="/admin/brands">
          <button className="w-full bg-[--comic-purple] text-white px-6 py-3 border-2 border-black font-bold hover:bg-purple-700 transition">
            MANAGE BRANDS
          </button>
        </Link>
      </motion.div>

      {/* Analytics Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border-4 border-black shadow-hard p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Database size={24} className="text-blue-500" />
          <h2 className="font-heading text-2xl">ANALYTICS TRACKING</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableAnalytics}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  enableAnalytics: e.target.checked,
                })
              }
              className="w-5 h-5 border-2 border-black"
            />
            <span className="font-bold">Enable analytics tracking</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.trackPageViews}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  trackPageViews: e.target.checked,
                })
              }
              className="w-5 h-5 border-2 border-black"
            />
            <span className="font-bold">Track page views and visitors</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.trackProductViews}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  trackProductViews: e.target.checked,
                })
              }
              className="w-5 h-5 border-2 border-black"
            />
            <span className="font-bold">Track product views and clicks</span>
          </label>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white border-4 border-black shadow-hard p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Bell size={24} className="text-[--comic-green]" />
          <h2 className="font-heading text-2xl">NOTIFICATIONS</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  enableNotifications: e.target.checked,
                })
              }
              className="w-5 h-5 border-2 border-black"
            />
            <span className="font-bold">Enable browser notifications</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableEmailAlerts}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  enableEmailAlerts: e.target.checked,
                })
              }
              className="w-5 h-5 border-2 border-black"
            />
            <span className="font-bold">
              Send email alerts for new orders
            </span>
          </label>
        </div>
      </motion.div>

      {/* Sanity CMS Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-gradient-to-r from-[--comic-red] to-[--comic-purple] border-4 border-black shadow-hard p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} className="text-white" />
          <h2 className="font-heading text-2xl text-white">
            SANITY CMS INTEGRATION
          </h2>
        </div>

        <div className="bg-white border-2 border-black p-4 mb-4">
          <p className="font-bold text-sm mb-2">
            ⚠️ Keep these credentials secure! Add them to your .env.local file.
          </p>
          <code className="text-xs bg-gray-100 p-2 block border border-gray-300">
            NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
            <br />
            NEXT_PUBLIC_SANITY_DATASET=production
            <br />
            SANITY_API_TOKEN=your_token
          </code>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block font-bold mb-2 text-white">
              Sanity Project ID
            </label>
            <input
              type="text"
              value={sanitySettings.projectId}
              onChange={(e) =>
                setSanitySettings({
                  ...sanitySettings,
                  projectId: e.target.value,
                })
              }
              placeholder="e.g., abc123xyz"
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-white font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-white">Dataset</label>
            <select
              value={sanitySettings.dataset}
              onChange={(e) =>
                setSanitySettings({
                  ...sanitySettings,
                  dataset: e.target.value,
                })
              }
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-white font-bold"
            >
              <option value="production">production</option>
              <option value="development">development</option>
            </select>
          </div>

          <div>
            <label className="block font-bold mb-2 text-white">
              API Token (Write Access)
            </label>
            <input
              type="password"
              value={sanitySettings.token}
              onChange={(e) =>
                setSanitySettings({ ...sanitySettings, token: e.target.value })
              }
              placeholder="sk..."
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-white font-bold"
            />
          </div>
        </div>

        <button
          onClick={handleSanitySave}
          className="mt-4 w-full bg-white text-black px-6 py-3 border-2 border-black font-heading text-xl hover:scale-105 transition"
        >
          SAVE SANITY CONFIG
        </button>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <button
          onClick={handleSave}
          className="w-full bg-[--comic-green] text-white px-6 py-4 border-4 border-black shadow-hard font-heading text-2xl hover:scale-105 transition flex items-center justify-center gap-3"
        >
          <Save size={24} />
          SAVE ALL SETTINGS
        </button>
      </motion.div>
    </div>
  );
}
