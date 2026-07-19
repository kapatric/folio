import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "About — Folio",
  description:
    "Learn how Folio tokenizes copyright certificates as unique ERC-721 assets on Base.",
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <div className="atmosphere" aria-hidden="true">
        <div className="atmosphere-wash" />
        <div className="atmosphere-grid" />
        <div className="atmosphere-orb atmosphere-orb-a" />
        <div className="atmosphere-orb atmosphere-orb-b" />
      </div>

      <SiteHeader />

      <main className="about-page">
        <p className="brand-hero about-brand">Folio</p>
        <h1>IP tokenization, built for proof.</h1>
        <p className="hero-lede about-lede">
          Folio helps creators and rights holders anchor authorship on Base—
          from certificate upload to a unique digital asset.
        </p>

        <div className="about-page-body">
          <p>
            Traditional copyright paperwork rarely travels with the work it
            protects. Folio bridges that gap: connect a wallet, upload an
            official certificate, and mint an ERC-721 keyed to the file’s
            content hash so the same certificate cannot be minted twice.
          </p>
          <p>
            Accounts keep customer details behind AES-256-GCM encryption, while
            passwords are scrypt-hashed. The result is a clear path from
            provenance to on-chain ownership—without turning the first viewport
            into a dashboard of noise.
          </p>
        </div>

        <div className="about-page-actions">
          <Link href="/login" className="cta-primary">
            Sign in to upload
          </Link>
          <Link href="/account#tokenize" className="cta-secondary">
            Open document workflow
          </Link>
        </div>
      </main>

      <footer className="site-footer">
        <p>Folio · IP tokenization</p>
      </footer>
    </div>
  );
}
