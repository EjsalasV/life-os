import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/context/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = { title: "Life OS", description: "Studio Brikk" };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}