import { Inter } from "next/font/google";
import "./globals.css";
// REGLA: El nombre debe ir entre llaves porque es una exportación nombrada
import { AuthContextProvider } from "@/context/auth"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Life OS",
  description: "Tu centro de mando personal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}