package com.mtbs.user_service.exception;

/**
 * Email hoac so dien thoai da duoc user khac su dung.
 * <p>
 * Bang users co rang buoc unique cho email va phone_number. Neu khong kiem
 * tra truoc, MySQL nem DataIntegrityViolationException khi INSERT/UPDATE -
 * thong bao loi do kho doc va co the lo mat so du lieu that.
 * <p>
 * GlobalExceptionHandler chuyen exception nay thanh HTTP 409 Conflict.
 */
public class DuplicateUserDataException extends RuntimeException {

    public DuplicateUserDataException(String field, String value) {
        super(field + " '" + value + "' da duoc su dung boi nguoi dung khac");
    }
}