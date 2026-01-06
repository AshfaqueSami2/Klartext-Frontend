/**
 * SEO Configuration for KlarText
 * Centralized SEO metadata for better search engine optimization
 */

export const siteConfig = {
  name: "KlarText",
  url: "https://klartext.com",
  description: "Master German through comprehensible input with KlarText. Interactive German lessons, vocabulary building, live voice rooms, and personalized learning. Perfect for A1-C1 learners.",
  ogImage: "/logo/main logo.png",
  links: {
    twitter: "https://twitter.com/klartext",
    facebook: "https://facebook.com/klartext",
    instagram: "https://instagram.com/klartext",
  },
};

export const seoKeywords = {
  primary: [
    "KlarText",
    "klartext",
    "learn German",
    "German language learning",
    "German learning platform",
    "language learning website",
  ],
  secondary: [
    "comprehensible input",
    "German reading practice",
    "German vocabulary",
    "German lessons",
    "learn German online",
    "German for beginners",
    "interactive German learning",
    "German conversation practice",
    "German study app",
    "German language app",
  ],
  levels: [
    "A1 German",
    "A2 German",
    "B1 German",
    "B2 German",
    "C1 German",
    "German beginner course",
    "intermediate German",
    "advanced German",
  ],
  features: [
    "German reading comprehension",
    "German grammar",
    "German pronunciation",
    "German speaking practice",
    "German writing practice",
    "German voice chat",
    "German vocabulary builder",
    "German flashcards",
    "German stories",
    "German articles",
  ],
};

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "KlarText",
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo/main logo.png`,
  sameAs: [
    siteConfig.links.twitter,
    siteConfig.links.facebook,
    siteConfig.links.instagram,
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    availableLanguage: ["English", "German"],
  },
  offers: {
    "@type": "Offer",
    category: "Education",
    description: "Premium German Language Learning Subscription",
  },
};

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "KlarText",
  url: siteConfig.url,
  description: siteConfig.description,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/lessons?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  inLanguage: ["en", "de"],
};

export const courseStructuredData = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "German Language Learning with KlarText",
  description: "Comprehensive German language course from A1 to C1 levels using comprehensible input methodology.",
  provider: {
    "@type": "EducationalOrganization",
    name: "KlarText",
    url: siteConfig.url,
  },
  educationalLevel: "Beginner to Advanced",
  availableLanguage: ["en", "de"],
  inLanguage: "de",
  coursePrerequisites: "None - suitable for complete beginners",
  teaches: "German Language",
  hasCourseInstance: [
    {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT2H",
    },
  ],
  offers: {
    "@type": "Offer",
    category: "Paid",
    availability: "https://schema.org/InStock",
  },
};

export const breadcrumbStructuredData = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${siteConfig.url}${item.url}`,
  })),
});

export const articleStructuredData = (article: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  author?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.description,
  image: article.image ? `${siteConfig.url}${article.image}` : siteConfig.ogImage,
  datePublished: article.datePublished,
  dateModified: article.dateModified,
  author: {
    "@type": "Person",
    name: article.author || "KlarText Team",
  },
  publisher: {
    "@type": "Organization",
    name: "KlarText",
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/logo/main logo.png`,
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": siteConfig.url,
  },
});

// FAQ Structured Data for common questions
export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is KlarText?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KlarText is a German language learning platform that uses comprehensible input methodology. We offer interactive lessons, vocabulary building, live voice rooms, and personalized learning paths for learners from A1 to C1 levels.",
      },
    },
    {
      "@type": "Question",
      name: "How does comprehensible input help learn German?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Comprehensible input is a proven method where you learn German by reading and listening to content that's slightly above your current level. This natural approach helps you acquire the language intuitively, similar to how children learn their first language.",
      },
    },
    {
      "@type": "Question",
      name: "What German levels does KlarText support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KlarText supports all major CEFR levels from A1 (absolute beginner) to C1 (advanced). Our content is carefully graded to match your proficiency level and grows with you as you progress.",
      },
    },
    {
      "@type": "Question",
      name: "Is KlarText free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KlarText offers both free and premium plans. Free users can access A1 and A2 level content. Premium subscribers get unlimited access to all levels (A1-C1), voice rooms, advanced features, and priority support.",
      },
    },
    {
      "@type": "Question",
      name: "Can I practice speaking German on KlarText?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! KlarText features live voice rooms where you can practice speaking German with other learners and native speakers in real-time. This helps improve your pronunciation, fluency, and confidence.",
      },
    },
  ],
};

// Software Application structured data
export const appStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "KlarText",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web, iOS, Android",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1250",
  },
  description: siteConfig.description,
};
