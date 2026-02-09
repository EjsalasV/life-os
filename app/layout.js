import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/context/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Life OS",
  description: "Sistema Operativo de Vida",
  manifest: "/manifest.json", // <--- Conecta el archivo PWA
  themeColor: "#000000",
  // Truco específico para que iPhone oculte la barra de estado y se vea más nativo
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Life OS",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}