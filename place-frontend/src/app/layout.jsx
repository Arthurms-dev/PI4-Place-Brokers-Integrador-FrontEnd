import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata = {
  title: { default: "Place Brokers", template: "%s | Place Brokers" },
  description: "Plataforma imobiliária Place Brokers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={roboto.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
