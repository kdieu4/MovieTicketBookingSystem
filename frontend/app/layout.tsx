import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

// Một typeface cho cả site: hỗ trợ đầy đủ dấu tiếng Việt và giữ được độ đậm ở cỡ nhỏ.
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "Seenema | Đặt vé xem phim trực tuyến",
  description: "Đặt vé xem phim trực tuyến tại Seenema",
};

// Chạy trước khi trình duyệt vẽ trang để không bị nháy nền sáng khi người dùng chọn theme tối.
const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem('seenema-theme');
    var theme = saved === 'light' || saved === 'dark'
      ? saved
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    if (sessionStorage.getItem('seenema-intro-seen') === '1') {
      document.documentElement.setAttribute('data-intro-seen', '');
    }
  } catch (error) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${beVietnam.variable} h-full antialiased overflow-x-clip`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col overflow-x-clip">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}