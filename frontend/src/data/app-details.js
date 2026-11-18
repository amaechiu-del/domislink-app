export const appDetails = {
  church: {
    tagline: "Run your church operations from one connected workspace.",
    audience: "Church leaders, administrators, pastors and ministry teams",
    features: ["Member records and household relationships", "Attendance, departments, cell groups and ministers", "Events, announcements and prayer requests", "Tithes, offerings, donations and financial reports", "Multi-branch operations and communications"],
    next: "Production health, tenant permissions, billing and giving workflows must be verified before this destination is marked live.",
  },
  meet: {
    tagline: "A privacy-led space for meaningful connections and safer planning.",
    audience: "Adults seeking verified profiles and safer social connections",
    features: ["Location-aware discovery with privacy controls", "Profile and identity verification", "Personality and compatibility experiences", "Safe Date Planner and trusted-contact check-ins", "Paystack monetisation and moderation controls"],
    next: "Trusted-contact notifications, venue recommendations and safety workflows remain release gates.",
  },
  studio: {
    tagline: "Turn a product idea into a specification, application and deployment plan.",
    audience: "Founders, developers and teams building digital products",
    features: ["Prompt-to-specification planning", "Visual application editing", "Full-stack code generation", "GitHub repository and version-control integration", "Cloudflare Workers, D1, R2 and Pages deployment workflows"],
    next: "The inspected project was a planning prototype; real generation, deployment and metering need full implementation and validation.",
  },
  summit: {
    tagline: "A digital home for aviation safety event information and stakeholder engagement.",
    audience: "Aviation professionals, institutions, sponsors and event participants",
    features: ["Event information and programme", "Stakeholder records and verification", "Invitation and outreach workflows", "Sponsorship pipeline", "RSVP and event communications"],
    next: "The 17 November 2026 event has passed; confirm whether this becomes an event archive or an ongoing secretariat.",
  },
  tickets: {
    tagline: "A future flight-search and ticketing service from DomisLink.",
    audience: "Travellers, agents and corporate travel coordinators",
    features: ["Flight discovery and itinerary selection", "Fare and availability comparison", "Passenger and booking management", "Payment and ticket fulfilment", "Booking support and itinerary records"],
    next: "The located repository contains only minimal documentation; core booking capabilities are not represented as ready.",
  },
  store: {
    tagline: "A digital storefront for products, services and online transactions.",
    audience: "Shoppers, merchants and DomisLink business customers",
    features: ["Product and service catalogues", "Search, categories and product details", "Cart, checkout and order tracking", "Merchant and inventory workflows", "Payment, settlement and customer notifications"],
    next: "Repository contents and checkout implementation require inspection before launch.",
  },
  wa: {
    tagline: "Bring customer conversations and business messaging into one operating view.",
    audience: "Small businesses, service teams and customer-care operators",
    features: ["WhatsApp Cloud API message workflows", "Customer inbox and conversation history", "Templates, delivery status and automation", "Campaigns, labels and assignment", "Usage, subscription and quota management"],
    next: "WhatsApp provider configuration, template approval, message delivery and billing must be verified.",
  },
  property: {
    tagline: "A planned marketplace for property discovery and enquiries.",
    audience: "Property seekers, owners, agents and property managers",
    features: ["Property listings and search filters", "Photos, specifications and location details", "Owner and agent enquiries", "Saved listings and viewing requests", "Listing moderation and paid promotion"],
    next: "The located repository is explicitly labelled to be built; there is no verified production destination.",
  },
  practice: {
    tagline: "A learning destination for structured practice and revision.",
    audience: "Students, trainees, instructors and professional learners",
    features: ["Guided practice sessions", "Topic and question-bank organisation", "Progress tracking and revision history", "Assessment and feedback experiences", "Learning resources and study plans"],
    next: "Verify the live learning modules, content ownership and learner progress persistence.",
  },
  "business-os": {
    tagline: "Manage customers, products, orders and business operations in one tenant-aware system.",
    audience: "Entrepreneurs, SMEs and growing organisations",
    features: ["Business workspace and team access", "Customer and product management", "Orders, invoices and payment tracking", "Business reports and activity history", "Subscription and usage controls"],
    next: "Reconcile the repository's PocketBase documentation with the approved Cloudflare D1/R2 architecture before production.",
  },
};

export function getAppDetails(appId) {
  return appDetails[appId] ?? {
    tagline: "A DomisLink service in the wider digital ecosystem.",
    audience: "DomisLink customers and partners",
    features: [],
    next: "Product information is being prepared.",
  };
}
