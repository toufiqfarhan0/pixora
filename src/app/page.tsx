'use client';

import dynamic from 'next/dynamic';

const PixoraApp = dynamic(() => import('../App').then((mod) => mod.App), {
  ssr: false,
});

export default function Home() {
  return <PixoraApp />;
}
