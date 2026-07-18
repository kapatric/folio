/**
 * Verifies Tailwind's lightningcss native binding is present for this platform.
 * Root optionalDependencies should install it; this catches broken/cross-OS node_modules.
 */
const fs = require("node:fs");

function platformPackage() {
  const { platform, arch } = process;
  if (platform === "darwin" && arch === "arm64") return "lightningcss-darwin-arm64";
  if (platform === "darwin" && arch === "x64") return "lightningcss-darwin-x64";
  if (platform === "linux" && arch === "arm64") {
    return fs.existsSync("/etc/alpine-release")
      ? "lightningcss-linux-arm64-musl"
      : "lightningcss-linux-arm64-gnu";
  }
  if (platform === "linux" && arch === "x64") {
    return fs.existsSync("/etc/alpine-release")
      ? "lightningcss-linux-x64-musl"
      : "lightningcss-linux-x64-gnu";
  }
  if (platform === "win32" && arch === "arm64") return "lightningcss-win32-arm64-msvc";
  if (platform === "win32" && arch === "x64") return "lightningcss-win32-x64-msvc";
  return null;
}

const pkg = platformPackage();
if (!pkg) {
  process.exit(0);
}

try {
  require.resolve(pkg);
  process.exit(0);
} catch {
  console.error(`
[folio] Missing native CSS binding: ${pkg}

Tailwind v4 needs this optional dependency on your machine.
Fix by reinstalling dependencies on this OS (do not copy node_modules across machines):

  rm -rf node_modules .next
  npm install

Or:

  npm run reinstall
`);
  process.exit(1);
}
