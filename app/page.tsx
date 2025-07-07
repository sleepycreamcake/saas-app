// This is the root page of the app; it immediately redirects to /login
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login'); // Redirect to login on first load
  }, []);

  return null; // Nothing is rendered on screen
}
