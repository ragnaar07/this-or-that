// Brand logo component
export function Brand() {
  return (
    <div className="brand" role="banner">
      <h1 className="brand__title">
        <span className="brand__this">THIS</span>
        <span className="brand__bolt" aria-hidden="true">⚡</span>
        <span className="brand__that">THAT</span>
      </h1>
      <p className="brand__sub">Sync up. Match minds.</p>
    </div>
  );
}
