export const dynamic = 'force-dynamic';

export default function ServerError() {
  return (
    <div
      style={{
        margin: 0,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fed7aa 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '28rem',
          margin: '0 auto',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            fontSize: '6rem',
            fontWeight: 'bold',
            color: '#dc2626',
            marginBottom: '1rem',
          }}
        >
          500
        </div>
        <h1
          style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem',
          }}
        >
          Error del Servidor
        </h1>
        <p
          style={{
            color: '#6b7280',
            marginBottom: '2rem',
          }}
        >
          Algo salió mal en nuestro servidor. Estamos trabajando para
          solucionarlo.
        </p>

        <div>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              margin: '0.5rem',
              background: '#dc2626',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '500',
            }}
          >
            🏠 Ir al Inicio
          </a>
          <a
            href="javascript:location.reload()"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              margin: '0.5rem',
              background: 'transparent',
              color: '#6b7280',
              textDecoration: 'none',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontWeight: '500',
            }}
          >
            🔄 Intentar de Nuevo
          </a>
          <a
            href="javascript:history.back()"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              margin: '0.5rem',
              background: 'transparent',
              color: '#6b7280',
              textDecoration: 'none',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontWeight: '500',
            }}
          >
            ← Volver Atrás
          </a>
        </div>
      </div>
    </div>
  );
}
