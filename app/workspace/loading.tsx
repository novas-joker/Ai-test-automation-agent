export default function WorkspaceLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '1.75rem',
            height: '1.75rem',
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
            fontSize: '0.8125rem',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          Loading workspace…
        </p>
      </div>
    </div>
  );
}
