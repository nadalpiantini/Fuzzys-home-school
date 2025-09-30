'use client';

export default function GlobalError() {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => window.location.href = '/'}>
          Try again
        </button>
      </body>
    </html>
  );
}