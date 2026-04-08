export const subdomains = [
  {
    id: 1,
    name: "Digital Empire",
    subdomain: "digital-empire",
    url: import.meta.env.VITE_DIGITAL_EMPIRE_URL || "https://digital-empire.domislink.com",
    icon: "🛒",
    category: "Ecommerce & Payments",
    description:
      "A full-featured ecommerce platform with integrated Paystack and Stripe payment processing, inventory management, and order tracking for modern online businesses.",
    color: "#6366f1",
  },
  {
    id: 2,
    name: "AI Automation",
    subdomain: "ai-automation",
    url: import.meta.env.VITE_AI_AUTOMATION_URL || "https://ai-automation.domislink.com",
    icon: "🤖",
    category: "University Automation",
    description:
      "Intelligent automation tools built for universities — streamline admissions, student records, scheduling, financial processing, and staff management with AI-powered workflows.",
    color: "#8b5cf6",
  },
  {
    id: 3,
    name: "CMS",
    subdomain: "cms",
    url: import.meta.env.VITE_CMS_URL || "https://cms.domislink.com",
    icon: "📝",
    category: "Content Management",
    description:
      "A powerful headless content management system for creating, organising, and publishing content across all your DomisLink applications from a single dashboard.",
    color: "#ec4899",
  },
  {
    id: 4,
    name: "Analytics",
    subdomain: "analytics",
    url: import.meta.env.VITE_ANALYTICS_URL || "https://analytics.domislink.com",
    icon: "📊",
    category: "Data & Insights",
    description:
      "Real-time data analytics and reporting across all your subdomains. Track usage metrics, revenue, user behaviour, and system performance in one centralised view.",
    color: "#f59e0b",
  },
  {
    id: 5,
    name: "API Portal",
    subdomain: "api",
    url: import.meta.env.VITE_API_URL || "https://api.domislink.com",
    icon: "⚡",
    category: "Developer Portal",
    description:
      "The central API gateway for the DomisLink ecosystem. Explore interactive documentation, manage API keys, monitor rate limits, and integrate with any service.",
    color: "#10b981",
  },
  {
    id: 6,
    name: "Docs",
    subdomain: "docs",
    url: import.meta.env.VITE_DOCS_URL || "https://docs.domislink.com",
    icon: "📚",
    category: "Documentation Hub",
    description:
      "Comprehensive guides, tutorials, and API references for every DomisLink service. Get up and running quickly with step-by-step instructions and code examples.",
    color: "#3b82f6",
  },
  {
    id: 7,
    name: "Dashboard",
    subdomain: "dashboard",
    url: import.meta.env.VITE_DASHBOARD_URL || "https://dashboard.domislink.com",
    icon: "🎛️",
    category: "Admin Control Panel",
    description:
      "The master administration panel for managing users, permissions, configurations, and system health across the entire DomisLink platform.",
    color: "#14b8a6",
  },
  {
    id: 8,
    name: "Support",
    subdomain: "support",
    url: import.meta.env.VITE_SUPPORT_URL || "https://support.domislink.com",
    icon: "🎧",
    category: "Customer Support",
    description:
      "Integrated helpdesk and ticketing system. Submit support requests, browse the knowledge base, and get real-time assistance from the DomisLink support team.",
    color: "#f97316",
  },
  {
    id: 9,
    name: "Blog",
    subdomain: "blog",
    url: import.meta.env.VITE_BLOG_URL || "https://blog.domislink.com",
    icon: "✍️",
    category: "News & Updates",
    description:
      "Stay up to date with the latest DomisLink product announcements, engineering deep-dives, industry insights, and tips for getting the most out of our platform.",
    color: "#ef4444",
  },
  {
    id: 10,
    name: "Marketplace",
    subdomain: "marketplace",
    url: import.meta.env.VITE_MARKETPLACE_URL || "https://marketplace.domislink.com",
    icon: "🏪",
    category: "Services & Products",
    description:
      "Browse and purchase automation templates, integrations, and premium add-ons built by the DomisLink community. Extend your platform without writing a line of code.",
    color: "#a855f7",
  },
];
