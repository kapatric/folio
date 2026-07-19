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
        After you sign in, upload a certificate in your private workspace,
        connect a wallet on Base, and mint an ERC-721 bound to the file’s
        content hash. Customer profiles and documents stay encrypted at rest.
      </p>
      <Link href="/login" className="cta-secondary about-link">
        Sign in to get started
      </Link>
    </section>
  );
}
