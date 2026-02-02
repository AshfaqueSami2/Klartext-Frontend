import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your free KlarText account and start learning German today.',
  alternates: {
    canonical: 'https://www.klartext.tech/register',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
