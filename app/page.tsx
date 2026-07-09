import Link from "next/link";

export default function Home() {
  return (
    <main className="display-shell demo-home">
      <section className="demo-home-panel">
        <p className="eyebrow">Smart Labour Room Reception Demo</p>
        <h1>Choose the display to open</h1>
        <p>
          Use two browser windows or two devices: one outside the ward for visitors, and one inside
          the ward for staff alerts.
        </p>
        <div className="demo-actions">
          <Link className="primary-link" href="/outside">
            Outside Ward Display
          </Link>
          <Link className="primary-link ward" href="/ward">
            Inside Ward Display
          </Link>
        </div>
      </section>
    </main>
  );
}
