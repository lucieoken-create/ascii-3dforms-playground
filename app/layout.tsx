import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASCII 3D forms playground",
  description:
    "A standalone portfolio artifact: interactive 3D models rendered as ASCII.",
  openGraph: {
    title: "ASCII 3D forms playground",
    description: "Interactive 3D models rendered as ASCII.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f7f2",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
