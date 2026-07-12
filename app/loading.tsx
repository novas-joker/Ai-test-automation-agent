export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'hsl(var(--background))',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '9999px',
            border: '2px solid hsl(var(--border))',
            borderTopColor: 'hsl(var(--primary))',
            animation: 'spin 0.75s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          Loading…
        </p>
      </div>
    </div>
  );
}
