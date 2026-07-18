import { AboutSection } from "@/components/AboutSection";
import { CertificateUpload } from "@/components/CertificateUpload";
import { SiteHeader } from "@/components/SiteHeader";
import { WalletConnect } from "@/components/WalletConnect";

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
            Connect a wallet, upload your copyright certificate, and mint it as
            a unique ERC-721 on Base.
          </p>
          <div className="hero-cta">
            <WalletConnect />
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

      <div id="tokenize">
        <CertificateUpload />
      </div>

      <AboutSection />

      <footer className="site-footer">
        <p>Folio · IP tokenization</p>
      </footer>
    </div>
  );
}
