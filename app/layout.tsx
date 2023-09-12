import "./globals.css";
import { Public_Sans } from "next/font/google";

const publicSans = Public_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>RentaDev</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
      </head>
      <body className={publicSans.className}>
        <div className="flex flex-col p-4 md:p-12 h-[100vh]">
          {children}
        </div>
      </body>
    </html>
  );
}
