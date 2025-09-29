'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-earth-100 to-earth-200">
      <h1 className="text-6xl font-bold text-earth-800">500</h1>
      <p className="mt-4 text-xl text-earth-600">Ha ocurrido un error</p>
      <button
        onClick={() => reset()}
        className="mt-8 rounded-lg bg-earth-600 px-6 py-3 text-white hover:bg-earth-700"
      >
        Intentar de nuevo
      </button>
      <Link
        href="/"
        className="mt-4 text-earth-600 underline hover:text-earth-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}