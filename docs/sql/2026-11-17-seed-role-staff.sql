-- Bật RBAC cho movie-service trên Supabase của hệ thống.
--
-- Vì sao cần: auth-service sinh claim "roles" từ bảng mtbs_auth.roles + user_has_role,
-- không đọc enum user_role_enum. Trước script này bảng roles rỗng nên mọi token đều
-- không có ROLE_*, kéo theo movie-service chặn mọi thao tác ghi (403).
--
-- Idempotent: chạy lại nhiều lần không tạo dữ liệu trùng.

-- 1. Bổ sung STAFF cho enum của user-service (public.users.role).
--    Postgres không cho ADD VALUE trong transaction, chạy riêng câu này trước.
ALTER TYPE public.user_role_enum ADD VALUE IF NOT EXISTS 'STAFF';

-- 2. Ba vai trò mà auth-service dùng để sinh claim "roles" trong JWT.
INSERT INTO mtbs_auth.roles (name)
SELECT t.name
FROM (VALUES ('CUSTOMER'), ('ADMIN'), ('STAFF')) AS t(name)
WHERE NOT EXISTS (SELECT 1 FROM mtbs_auth.roles r WHERE r.name = t.name);

-- 3. Gán role cho tài khoản đã đăng ký. Đổi email cho đúng với tài khoản thật.
--    Mỗi tài khoản cần đăng nhập lại sau khi gán để token mới có claim "roles".
INSERT INTO mtbs_auth.user_has_role (user_id, role_id)
SELECT u.user_id, r.id
FROM mtbs_auth.users u
JOIN mtbs_auth.roles r ON r.name = 'STAFF'
WHERE u.email = 'staff@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM mtbs_auth.user_has_role x
    WHERE x.user_id = u.user_id AND x.role_id = r.id
  );

-- Đổi 'STAFF' thành 'ADMIN' hoặc 'CUSTOMER' cho tài khoản tương ứng.
