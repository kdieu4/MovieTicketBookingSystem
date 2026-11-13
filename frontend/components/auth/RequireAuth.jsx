"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/services/authApi";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const hasSession = await getSession();
        if (!mounted) return;
        if (!hasSession) {
          setStatus("unauthenticated");
          router.replace("/dang-nhap");
          return;
        }
        setStatus("authenticated");
      } catch (error) {
        console.error("Session check failed:", error);
        if (mounted) {
          setStatus("error");
        }
      }
    }

    checkAuth();
    window.addEventListener("mtbs-auth-changed", checkAuth);

    return () => {
      mounted = false;
      window.removeEventListener("mtbs-auth-changed", checkAuth);
    };
  }, [router]);

  if (status === "authenticated") {
    return children;
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Không thể kiểm tra phiên đăng nhập.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Đang kiểm tra đăng nhập...</p>
    </div>
  );
}
