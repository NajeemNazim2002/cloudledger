export const site = {
  name: "CloudLedger",
  tagline: "Cloud Accounting Solutions",
  email: "cloudledger78@gmail.com",
  whatsappDisplay: "+94 705 042 600",
  whatsappNumber: "94705042600",
  whatsappMessage:
    "Hello CloudLedger, I would like to learn more about your accounting services and cloud accounting training.",
  hours: "Contact us for business hours",
};
export const whatsappLink = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(site.whatsappMessage)}`;

export const services = [
  { slug: "bookkeeping", icon: "BookOpen", title: "Bookkeeping & Monthly Accounts", desc: "Organise transactions, keep accurate records and support monthly reporting." },
  { slug: "reconciliation", icon: "Landmark", title: "Bank & Card Reconciliation", desc: "Reconcile bank and card transactions and spot discrepancies or missing entries." },
  { slug: "payables-receivables", icon: "ReceiptText", title: "Payables & Receivables", desc: "Track supplier payments and customer collections with clear invoice support." },
  { slug: "financial-reporting", icon: "BarChart3", title: "Financial Statements", desc: "Management-oriented reports and summaries based on your requirements." },
  { slug: "tax-support", icon: "FileText", title: "Tax Preparation Support", desc: "Documentation and preparation support within applicable legal requirements." },
  { slug: "advisory", icon: "TrendingUp", title: "Business Advisory", desc: "Budgeting, cash-flow monitoring and financial planning support." },
];

export const courses = [
  { slug: "xero", title: "Xero Accounting Training", level: "Beginner to Intermediate", desc: "Hands-on Xero training with practical exercises." },
  { slug: "quickbooks-online", title: "QuickBooks Online Training", level: "Beginner to Intermediate", desc: "Learn QuickBooks Online through real-world examples." },
  { slug: "zoho-books", title: "Zoho Books Training", level: "Beginner to Intermediate", desc: "Practical Zoho Books skills for small businesses." },
  { slug: "bookkeeping-fundamentals", title: "Practical Bookkeeping Fundamentals", level: "Beginner", desc: "Core bookkeeping concepts, applied step by step." },
  { slug: "cloud-accounting-beginners", title: "Cloud Accounting for Beginners", level: "Beginner", desc: "No experience needed. Start with cloud accounting basics." },
  { slug: "advanced-cloud-accounting", title: "Advanced Cloud Accounting Skills", level: "Advanced", desc: "Deepen your skills with advanced workflows and reporting." },
];
