import * as React from 'react';

const card: React.CSSProperties = {
  width: 280,
  padding: '28px 24px 22px',
  borderRadius: 24,
  background: 'linear-gradient(165deg, #1a1f35 0%, #0f1320 100%)',
  boxShadow: '0 20px 40px rgba(15, 19, 32, 0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
  fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
  color: '#f4f6fb',
  textAlign: 'center',
};

const label: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#8b93b0',
};

const value: React.CSSProperties = {
  margin: '10px 0 22px',
  fontSize: 56,
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: '-0.04em',
  background: 'linear-gradient(180deg, #ffffff 0%, #a8b4ff 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const row: React.CSSProperties = {
  display: 'flex',
  gap: 10,
};

const buttonBase: React.CSSProperties = {
  flex: 1,
  border: 'none',
  borderRadius: 14,
  padding: '12px 0',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  color: '#fff',
};

export function Counter() {
  const [count, setCount] = React.useState<number>(0);

  function handleDecrement() {
    if(count <= 0) setCount(0);
    else setCount(count => count - 1);
  }

  function handleIncrement() {
    setCount(count => count + 1);
  }

  return (
    <div style={card}>
      <p style={label}>Count</p>
      <p style={value}>{count}</p>
      <div style={row}>
        <button
          type="button"
          style={{ ...buttonBase, background: '#3d4663' }}
          onClick={handleDecrement}
        >
          − Decrement
        </button>
        <button
          type="button"
          style={{
            ...buttonBase,
            background: 'linear-gradient(180deg, #7c8cff 0%, #5b6cff 100%)',
            boxShadow: '0 8px 18px rgba(91, 108, 255, 0.35)',
          }}
          onClick={handleIncrement}
        >
          + Increment
        </button>
      </div>
    </div>
  );
}