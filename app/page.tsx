export default function Home() {
  return (
    <main className="combined-demo-shell">
      <header className="combined-demo-header">
        <div>
          <p className="eyebrow">Smart Labour Room Reception Demo</p>
          <h1>Labour Room Reception Console</h1>
        </div>
      </header>

      <section className="combined-panel-grid" aria-label="Smart reception dual display demo">
        <article className="combined-panel-card">
          <div className="combined-panel-title">
            <span>Outside Ward Display</span>
            <a href="/outside" target="_blank" rel="noreferrer">
              Open
            </a>
          </div>
          <iframe src="/outside" title="Outside Ward Display" />
        </article>

        <article className="combined-panel-card">
          <div className="combined-panel-title">
            <span>Inside Ward Display</span>
            <a href="/ward" target="_blank" rel="noreferrer">
              Open
            </a>
          </div>
          <iframe src="/ward" title="Inside Ward Display" />
        </article>
      </section>
    </main>
  );
}
