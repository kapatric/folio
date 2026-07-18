import Link from "next/link";

export function AboutSection() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-heading">
      <div className="section-copy">
        <h2 id="about-heading">About Folio</h2>
        <p>
          Folio turns copyright certificates into unique on-chain assets so
          creators can prove authorship and move rights with confidence.
        </p>
      </div>
      <p className="about-body">
        Upload a certificate, connect a wallet on Base, and mint an ERC-721 that
        binds the work to its content hash. Customer profiles stay encrypted at
        rest—identity and intellectual property travel together without exposing
        either in the clear.
      </p>
      <Link href="/about" className="cta-secondary about-link">
        Read the full story
      </Link>
    </section>
  );
}
