const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8083/api";

export async function apiRequest(
  path,
  { method = "GET", body, token, signal } = {},
) {
  if (!API_BASE_URL) {
    throw new Error("Chưa cấu hình NEXT_PUBLIC_API_BASE_URL");
  }

//   const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}${path}`, {
  const response = await fetch(`${path}`, {
    method,
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    cache: "no-cache",
  });

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object"
        ? data.message || data.error
        : typeof data === "string"
          ? data
          : null;

    const error = new Error(message || `HTTP ${response.status}`);

    error.status = response.status;
    throw error;
  }
  return data;
}
