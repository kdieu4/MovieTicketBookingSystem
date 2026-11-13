const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8085";

// async function postJson(path, body) {
//   let response;

//   try {
//     response = await fetch(`${AUTH_API_URL}${path}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });
//   } catch {
//     throw new Error("Không kết nối được máy chủ.");
//   }

//   const data = await response.json().catch(() => ({}));

//   if (!response.ok || data.status >= 400) {
//     throw new Error(data.message || data.error || "Có lỗi xảy ra.");
//   }

//   return data;
// }

// export function loginUser(data) {
//   return postJson("/auth/login", data);
// }

// export function registerUser(data) {
//   return postJson("/auth/register", data);
// }

export async function loginUser(credentials) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(credentials),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.status >= 400) {
    throw new Error(data.message || "Đăng nhập thất bại.");
  }

  return data;
}

export async function getSession() {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Không thể kiểm tra phiên đăng nhập.");
  }

  const data = await response.json();

  return Boolean(data.hasSession);
}

export async function logoutUser() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.status >= 400) {
    throw new Error(data.message || "Đăng xuất thất bại.");
  }

  return data;
}
