"use client";

import { usePathname } from 'next/navigation';
import IntroCurtain from '@/components/layout/IntroCurtain';

// Chuyển trang mềm: mỗi route mới trượt nhẹ lên thay vì đổi trắng trang.
// Intro nằm ngoài .page-enter: transform của animation sẽ biến position:fixed thành
// absolute theo chiều cao cả trang, đẩy nội dung intro xuống dưới màn hình.
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {pathname === '/' && <IntroCurtain />}
      <div className="page-enter">{children}</div>
    </>
  );
}
