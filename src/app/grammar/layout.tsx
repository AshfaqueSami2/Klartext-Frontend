import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'German Grammar | KlarText',
  description: 'Master German grammar with interactive lessons and exercises. From A1 to C1 level, learn German cases, verbs, articles, and more.',
  keywords: ['German grammar', 'learn German', 'German cases', 'German verbs', 'CEFR', 'language learning'],
  openGraph: {
    title: 'German Grammar | KlarText',
    description: 'Master German grammar with interactive lessons and exercises.',
    type: 'website',
  },
};

export default function GrammarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
