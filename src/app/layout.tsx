import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#06080e",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://rahulsehrawat.dev"),
  title: {
    default: "Rahul Sehrawat | Computer Science Student | Cybersecurity | AI/ML",
    template: "%s | Rahul Sehrawat",
  },
  description:
    "Rahul Sehrawat is a B.Tech Computer Science (AI & ML) student at SGT University building practical software projects, exploring cybersecurity, networking, and intelligent applications using Python.",
  applicationName: "Rahul Sehrawat Portfolio",
  authors: [{ name: "Rahul Sehrawat", url: "https://github.com/rsherawat2007-create" }],
  creator: "Rahul Sehrawat",
  publisher: "Rahul Sehrawat",
  keywords: [
    "Rahul Sehrawat",
    "Cybersecurity Portfolio",
    "AI/ML Developer",
    "Python Developer",
    "SGT University",
    "Computer Science Student",
    "Network Security",
    "WAPT",
    "Web Security",
    "Machine Learning",
    "Azure Certified",
    "NEXCLASS",
    "Socket Programming",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rahulsehrawat.dev",
    siteName: "Rahul Sehrawat Portfolio",
    title: "Rahul Sehrawat | Computer Science Student | Cybersecurity | AI/ML",
    description:
      "Building intelligent systems and exploring cybersecurity through practical engineering. B.Tech CSE (AI & ML) at SGT University.",
    images: [
      {
        url: "/profile.png",
        width: 1024,
        height: 1024,
        alt: "Rahul Sehrawat — Computer Science Student, Cybersecurity & AI/ML",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rahul Sehrawat | Computer Science Student | Cybersecurity | AI/ML",
    description:
      "Building intelligent systems and exploring cybersecurity through practical engineering. SGT University B.Tech CSE (AI & ML).",
    images: ["/profile.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="antialiased min-h-screen bg-[#06080e] text-[#f1f5f9] font-sans selection:bg-cyan-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
