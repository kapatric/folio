import Link from "next/link";
import { AboutSection } from "@/components/AboutSection";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <div className="page-shell home-shell">
      <div className="atmosphere" aria-hidden="true">
        <div className="atmosphere-wash" />
        <div className="atmosphere-grid" />
        <div className="atmosphere-orb atmosphere-orb-a" />
        <div className="atmosphere-orb atmosphere-orb-b" />
      </div>

      <SiteHeader />

      <main className="hero">
        <div className="hero-copy">
          <p className="brand-hero">Folio</p>
          <h1>Prove authorship. Tokenize the rights.</h1>
          <p className="hero-lede">
            Sign in to upload certificates, store supporting documents, and mint
            unique IP as an ERC-721 on Base.
          </p>
          <div className="hero-cta">
            <Link href="/login" className="cta-primary">
              Sign in to continue
            </Link>
            <Link href="/about" className="cta-secondary">
              About Folio
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="certificate-plane">
            <div className="certificate-sheen" />
            <div className="certificate-rule" />
            <div className="certificate-rule short" />
            <div className="certificate-stamp" />
          </div>
        </div>
      </main>

      <AboutSection />

      <footer className="site-footer">
        <p>Folio · IP tokenization</p>
      </footer>
    </div>
  );
}
