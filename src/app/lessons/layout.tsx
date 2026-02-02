import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'German Lessons - Learn with Stories',
  description: 'Explore our German reading lessons from A1 to C1. Learn vocabulary naturally through engaging stories and comprehensible input.',
  alternates: {
    canonical: 'https://www.klartext.tech/lessons',
  },
  openGraph: {
    title: 'German Lessons - Learn with Stories | KlarText',
    description: 'Explore our German reading lessons from A1 to C1. Learn vocabulary naturally through engaging stories.',
    url: 'https://www.klartext.tech/lessons',
    type: 'website',
  },
};

export default function LessonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
