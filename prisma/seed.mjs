import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const courses = [
  { slug: "xero", title: "Xero Accounting Training", level: "Beginner to Intermediate", description: "Hands-on Xero training with practical exercises." },
  { slug: "quickbooks-online", title: "QuickBooks Online Training", level: "Beginner to Intermediate", description: "Learn QuickBooks Online through real-world examples." },
  { slug: "zoho-books", title: "Zoho Books Training", level: "Beginner to Intermediate", description: "Practical Zoho Books skills for small businesses." },
  { slug: "bookkeeping-fundamentals", title: "Practical Bookkeeping Fundamentals", level: "Beginner", description: "Core bookkeeping concepts, applied step by step." },
  { slug: "cloud-accounting-beginners", title: "Cloud Accounting for Beginners", level: "Beginner", description: "No experience needed. Start with cloud accounting basics." },
  { slug: "advanced-cloud-accounting", title: "Advanced Cloud Accounting Skills", level: "Advanced", description: "Deepen your skills with advanced workflows and reporting." },
];

const services = [
  { slug: "bookkeeping", icon: "BookOpen", title: "Bookkeeping & Monthly Accounts", description: "Organise transactions, keep accurate records and support monthly reporting." },
  { slug: "reconciliation", icon: "Landmark", title: "Bank & Card Reconciliation", description: "Reconcile bank and card transactions and spot discrepancies or missing entries." },
  { slug: "payables-receivables", icon: "ReceiptText", title: "Payables & Receivables", description: "Track supplier payments and customer collections with clear invoice support." },
  { slug: "financial-reporting", icon: "BarChart3", title: "Financial Statements", description: "Management-oriented reports and summaries based on your requirements." },
  { slug: "tax-support", icon: "FileText", title: "Tax Preparation Support", description: "Documentation and preparation support within applicable legal requirements." },
  { slug: "advisory", icon: "TrendingUp", title: "Business Advisory", description: "Budgeting, cash-flow monitoring and financial planning support." },
];

try {
  for (const course of courses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {},
      create: { ...course, isPublished: true },
    });
  }
  for (const service of services) {
    await prisma.accountingService.upsert({
      where: { slug: service.slug },
      update: {},
      create: { ...service, isPublished: true },
    });
  }
  await prisma.siteSettings.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } });
  console.log("Seeded initial courses, services, and site settings without overwriting existing content.");
} finally {
  await prisma.$disconnect();
}
