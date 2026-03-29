// Analytics Store for tracking user behavior
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AnalyticsEvent = {
  id: string;
  type: "page_view" | "product_view" | "cart_add" | "checkout_start" | "purchase";
  timestamp: number;
  data?: any;
};

type AnalyticsStore = {
  events: AnalyticsEvent[];
  pageViews: { [key: string]: number };
  productViews: { [key: string]: number };
  totalVisitors: number;
  returningVisitors: string[]; // Changed from Set to array for persistence
  
  // Actions
  trackPageView: (page: string) => void;
  trackProductView: (productId: string) => void;
  trackCartAdd: (productId: string) => void;
  trackCheckoutStart: () => void;
  trackPurchase: (amount: number) => void;
  getAnalytics: () => any;
  clearAnalytics: () => void;
};

const generateVisitorId = () => {
  let visitorId = localStorage.getItem("flipside_visitor_id");
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("flipside_visitor_id", visitorId);
  }
  return visitorId;
};

export const useAnalytics = create<AnalyticsStore>()(
  persist(
    (set, get) => ({
      events: [],
      pageViews: {},
      productViews: {},
      totalVisitors: 0,
      returningVisitors: [],

      trackPageView: (page: string) => {
        const visitorId = generateVisitorId();
        const event: AnalyticsEvent = {
          id: `${Date.now()}_${Math.random()}`,
          type: "page_view",
          timestamp: Date.now(),
          data: { page, visitorId },
        };

        set((state) => {
          // Ensure returningVisitors is an array
          const visitors = Array.isArray(state.returningVisitors) 
            ? state.returningVisitors 
            : [];
          
          const isReturning = visitors.includes(visitorId);
          const newReturningVisitors = isReturning 
            ? visitors 
            : [...visitors, visitorId];
          
          return {
            events: [...state.events.slice(-999), event],
            pageViews: {
              ...state.pageViews,
              [page]: (state.pageViews[page] || 0) + 1,
            },
            totalVisitors: isReturning ? state.totalVisitors : state.totalVisitors + 1,
            returningVisitors: newReturningVisitors,
          };
        });
      },

      trackProductView: (productId: string) => {
        const event: AnalyticsEvent = {
          id: `${Date.now()}_${Math.random()}`,
          type: "product_view",
          timestamp: Date.now(),
          data: { productId },
        };

        set((state) => ({
          events: [...state.events.slice(-999), event],
          productViews: {
            ...state.productViews,
            [productId]: (state.productViews[productId] || 0) + 1,
          },
        }));
      },

      trackCartAdd: (productId: string) => {
        const event: AnalyticsEvent = {
          id: `${Date.now()}_${Math.random()}`,
          type: "cart_add",
          timestamp: Date.now(),
          data: { productId },
        };

        set((state) => ({
          events: [...state.events.slice(-999), event],
        }));
      },

      trackCheckoutStart: () => {
        const event: AnalyticsEvent = {
          id: `${Date.now()}_${Math.random()}`,
          type: "checkout_start",
          timestamp: Date.now(),
        };

        set((state) => ({
          events: [...state.events.slice(-999), event],
        }));
      },

      trackPurchase: (amount: number) => {
        const event: AnalyticsEvent = {
          id: `${Date.now()}_${Math.random()}`,
          type: "purchase",
          timestamp: Date.now(),
          data: { amount },
        };

        set((state) => ({
          events: [...state.events.slice(-999), event],
        }));
      },

      getAnalytics: () => {
        const state = get();
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;

        // Calculate metrics
        const todayEvents = state.events.filter((e) => now - e.timestamp < dayMs);
        const weekEvents = state.events.filter((e) => now - e.timestamp < 7 * dayMs);
        const monthEvents = state.events.filter((e) => now - e.timestamp < 30 * dayMs);

        return {
          totalEvents: state.events.length,
          totalPageViews: Object.values(state.pageViews).reduce((a, b) => a + b, 0),
          totalProductViews: Object.values(state.productViews).reduce((a, b) => a + b, 0),
          totalVisitors: state.totalVisitors,
          returningVisitors: state.returningVisitors.length,
          todayViews: todayEvents.filter((e) => e.type === "page_view").length,
          weekViews: weekEvents.filter((e) => e.type === "page_view").length,
          monthViews: monthEvents.filter((e) => e.type === "page_view").length,
          pageViews: state.pageViews,
          productViews: state.productViews,
          topPages: Object.entries(state.pageViews)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5),
          topProducts: Object.entries(state.productViews)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5),
        };
      },

      clearAnalytics: () => {
        set({
          events: [],
          pageViews: {},
          productViews: {},
          totalVisitors: 0,
          returningVisitors: [],
        });
      },
    }),
    {
      name: "flipside-analytics",
      version: 1, // Add version for migration
      migrate: (persistedState: any, version: number) => {
        // Handle migration from Set to Array
        if (persistedState && persistedState.returningVisitors) {
          // If it's an object (serialized Set), convert to array
          if (typeof persistedState.returningVisitors === 'object' && 
              !Array.isArray(persistedState.returningVisitors)) {
            persistedState.returningVisitors = [];
          }
        }
        return persistedState as AnalyticsStore;
      },
    }
  )
);
