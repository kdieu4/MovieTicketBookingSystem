-- ===========================================================
--  MTBS - User Service : du lieu mau phuc vu kiem thu
--  INSERT IGNORE de chay lai nhieu lan khong bi trung du lieu
--  Pham vi tuan nay khong co Authentication / JWT / Role
--  nen khong co cot password, role, status.
-- ===========================================================

INSERT IGNORE INTO users (id, full_name, email, phone_number, created_at, updated_at)
VALUES (1, 'Nguyen Van An', 'an.nguyen@mtbs.vn', '0901000001', NOW(), NOW()),
       (2, 'Tran Thi Bich', 'bich.tran@mtbs.vn', '0901000002', NOW(), NOW()),
       (3, 'Le Hoang Chung', 'chung.le@mtbs.vn', '0901000003', NOW(), NOW()),
       (4, 'Pham Thu Dung', 'dung.pham@mtbs.vn', '0901000004', NOW(), NOW()),
       (5, 'Vo Van Em', 'em.vo@mtbs.vn', '0901000005', NOW(), NOW());