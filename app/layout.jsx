import "../styles/globals.css";

export const metadata = {
  title: "MovieMatch",
  description: "Discover movies you'll both love",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
