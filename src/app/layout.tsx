import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@/context/UserContext';

export const metadata: Metadata = {
  title: 'CRONOPORTE | UFC & Fight Center Oficial • Carteleras, Careos & Stats',
  description: 'Plataforma deportiva de alto impacto con carteleras de UFC en vivo, careos con efecto parallax, momios de apuestas, rankings mundiales y estadísticas de combate.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[#FAFAFA] text-[#1A1E24] antialiased min-h-screen flex flex-col selection:bg-[#EC4D25] selection:text-white">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}


