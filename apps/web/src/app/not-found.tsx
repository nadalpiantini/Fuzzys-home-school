'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-earth-100 to-earth-200">
      <h1 className="text-6xl font-bold text-earth-800">404</h1>
      <p className="mt-4 text-xl text-earth-600">Página no encontrada</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-earth-600 px-6 py-3 text-white hover:bg-earth-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}