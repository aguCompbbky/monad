import { Inter } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const inter = Inter({ subsets: ["latin"] });

export const metadata = getMetadata({
  title: "GARANTOR | Monad Escrow",
  description: "Decentralized second-hand escrow MVP on Monad testnet.",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className="dark" data-theme="dark">
      <body className={inter.className}>
        <ThemeProvider enableSystem={false} forcedTheme="dark" defaultTheme="dark">
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
