import { AccountNav } from "@/components/AccountNav";

type AccountPageHeaderProps = {
  title: string;
  description: string;
};

export function AccountPageHeader({
  title,
  description,
}: AccountPageHeaderProps) {
  return (
    <header className="account-page-header">
      <p className="brand-hero account-brand account-brand-compact">Folio</p>
      <h1>{title}</h1>
      <p className="hero-lede">{description}</p>
      <AccountNav />
    </header>
  );
}
