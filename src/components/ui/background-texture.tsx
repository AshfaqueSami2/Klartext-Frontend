export function BackgroundTexture() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none opacity-20 z-0" 
      style={{ 
        backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', 
        backgroundSize: '24px 24px' 
      }}
      aria-hidden="true"
    />
  );
}
