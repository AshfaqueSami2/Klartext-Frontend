import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Premium German Lessons',
  description: 'Choose your KlarText plan. Start free with A1-A2 lessons or upgrade for full B1-C1 access. Affordable German learning.',
  alternates: {
    canonical: 'https://www.klartext.tech/pricing',
  },
  openGraph: {
    title: 'Pricing - Premium German Lessons | KlarText',
    description: 'Choose your KlarText plan. Start free or upgrade for full access to all German lessons.',
    url: 'https://www.klartext.tech/pricing',
    type: 'website',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
