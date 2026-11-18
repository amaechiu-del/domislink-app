// One Link app registry. "verify" means the destination is known but has not
// passed a live health, sign-in, and authorization check. Never show it as live.
export const subdomains = [
  { id:"church", name:"Church Management", short:"Church", category:"Community", icon:"⛪", domain:"church.domislink.com", url:"https://church.domislink.com", description:"A multi-branch church operating system for members, attendance, ministry teams, events, giving, communications and reporting.", status:"verify", repo:"amaechiu-del/domislink-church" },
  { id:"meet", name:"DomisLink Meet", short:"Meet", category:"Community", icon:"♡", domain:"meet.domislink.com", url:"https://meet.domislink.com", description:"A verified-identity, privacy-led platform for meaningful connections and safer date planning.", status:"verify", repo:"amaechiu-del/domislink-international" },
  { id:"studio", name:"AI Studio", short:"AI Studio", category:"Productivity", icon:"✧", domain:"studio.domislink.com", url:"https://studio.domislink.com", description:"Plan, generate, edit and deploy full-stack applications with AI agents, GitHub and Cloudflare tools.", status:"verify", repo:"amaechiu-del/domislink-ai-studio" },
  { id:"summit", name:"Aviation Safety Summit", short:"Summit", category:"Business", icon:"✈", domain:"summit.domislink.com", url:"https://summit.domislink.com", description:"The aviation safety summit information and secretariat portal, including stakeholder and RSVP workflows.", status:"verify", repo:"amaechiu-del/summit" },
  { id:"tickets", name:"Air Ticketing", short:"Air Tickets", category:"Travel", icon:"◈", domain:"airticket.domislink.com", url:"https://airticket.domislink.com", description:"The DomisLink flight search and ticketing service. Booking and payment functions require separate production verification.", status:"verify", repo:"amaechiu-del/domislink-flights" },
  { id:"store", name:"DomisLink Store", short:"Store", category:"Business", icon:"▣", domain:"store.domislink.com", url:"https://store.domislink.com", description:"A digital storefront for products, services and business transactions.", status:"verify", repo:"amaechiu-del/domislink-store" },
  { id:"wa", name:"WhatsApp Business OS", short:"WhatsApp OS", category:"Business", icon:"◉", domain:"wa.domislinker.com", url:"https://wa.domislinker.com", description:"Customer conversations, business messaging, automation and communication workflows.", status:"verify", repo:null },
  { id:"property", name:"Property Marketplace", short:"Property", category:"Business", icon:"⌂", domain:"propertymarketplace.domislinker.com", url:"https://propertymarketplace.domislinker.com", description:"A property discovery and marketplace experience for listings, enquiries and property services.", status:"verify", repo:"amaechiu-del/domislink-realestate" },
  { id:"practice", name:"Practice & Learning", short:"Practice", category:"Learning", icon:"▤", domain:"practice.domislinker.com", url:"https://practice.domislinker.com", description:"A learning and practice destination for guided exercises, revision and assessments.", status:"verify", repo:null },
  { id:"business-os", name:"AI Business OS", short:"Business OS", category:"Productivity", icon:"⌘", domain:null, url:null, description:"A tenant-aware business operating system for customers, products, orders, invoices and payments. Public production URL is not yet confirmed.", status:"planned", repo:"amaechiu-del/ai-business" },
];

export const statusLabels = {
  verify: "Connection check pending",
  planned: "Preparing for launch",
  live: "Verified live",
};
