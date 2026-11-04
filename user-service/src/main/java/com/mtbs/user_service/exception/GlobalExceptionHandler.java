package com.mtbs.user_service.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Chuyen exception thanh HTTP response dang JSON.
 * Khong tach file ErrorResponse rieng vi pham vi tuan nay chi can cau truc
 * JSON don gian.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** User khong ton tai -> 404 Not Found. */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(UserNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    /**
     * Email / so dien thoai bi trung -> 409 Conflict.
     * <p>
     * Khac voi 400: du lieu dung dinh dang nhung xung dot voi du lieu dang
     * co. Client can biet "hay doi gia tri" chu khong phai "sua lai dinh dang".
     */
    @ExceptionHandler(DuplicateUserDataException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DuplicateUserDataException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    /**
     * Du lieu trong request body khong hop le -> 400 Bad Request.
     * <p>
     * Spring nem MethodArgumentNotValidException khi @Valid that bai (vi du
     * email sai dinh dang, ho ten de trong). Tra them danh sach loi theo tung
     * truong de client biet chinh xac sua gi, thay vi chi bao "400".
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> fieldErrors.putIfAbsent(e.getField(), e.getDefaultMessage()));

        Map<String, Object> body = baseBody(HttpStatus.BAD_REQUEST, "Du lieu gui len khong hop le");
        body.put("fieldErrors", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * Body khong phai JSON hop le -> 400 Bad Request.
     * <p>
     * Vi du client gui text thuong thay vi JSON, hoac thieu dau {@code }.
     * Khong bat rieng thi loi nay roi vao handler Exception.class va tra 500 -
     * sai, vi day la loi cua client chu khong phai loi server.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadable(HttpMessageNotReadableException ex) {
        return build(HttpStatus.BAD_REQUEST, "Body khong phai JSON hop le hoac thieu truong bat buoc");
    }

    /**
     * Duong dan khong ton tai -> 404 Not Found.
     * <p>
     * Spring Boot 3.2+ nem NoResourceFoundException cho duong dan khong co
     * (vi du go ngo /swagger-ui/index.html). Neu chi co handler Exception.class
     * o cuoi file, exception nay bi bat va tra 500 - sai, va lam service trong
     * khi so voi loi that.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFound(NoResourceFoundException ex) {
        return build(HttpStatus.NOT_FOUND, "Khong tim thay duong dan: /" + ex.getResourcePath());
    }

    /**
     * Sai HTTP method -> 405 Method Not Allowed.
     * <p>
     * Vi du POST /api/users/1 trong khi endpoint chi nhan GET.
     * Cung bi handler Exception.class bat mat neu khong khai bao rieng.
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return build(HttpStatus.METHOD_NOT_ALLOWED, "HTTP method khong duoc ho tro: " + ex.getMethod());
    }

    /**
     * ID khong phai so -> 400 Bad Request.
     * Spring nem MethodArgumentTypeMismatchException khi ep "abc" sang Long
     * (khong phai NumberFormatException nen bat class do se khong duoc).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleNumberFormat(MethodArgumentTypeMismatchException ex) {
        return build(HttpStatus.BAD_REQUEST, "ID khong hop le");
    }

    /**
     * Truong sap xep khong ton tai -> 400 Bad Request.
     * <p>
     * Vi du {@code GET /api/users?sort=khongCoTrenBang,asc}. Spring Data nem
     * PropertyReferenceException; neu khong bat rieng, no roi vao handler
     * Exception.class va tra 500 - sai, vi day la loi cua client.
     */
    @ExceptionHandler(PropertyReferenceException.class)
    public ResponseEntity<Map<String, Object>> handlePropertyReference(PropertyReferenceException ex) {
        return build(HttpStatus.BAD_REQUEST,
                "Truong sap xep khong ton tai: " + ex.getPropertyName());
    }

    /**
     * Loi rang buoc du lieu tu MySQL -> 409 Conflict.
     * <p>
     * Lưới an toan cho trường hợp kiem tra trung o service-layer bi bo qua:
     * hai request cap nhat chay song tat co the cung qua duoc {@code existsBy...}
     * roi moi ghi, khi do MySQL moi bao loi. Neu khong bat rieng, loi nay
     * thuoc ve client (gia tri trung) nhung lai tra 500.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Loi rang buoc du lieu: {}", ex.getMostSpecificCause().getMessage());
        return build(HttpStatus.CONFLICT, "Du lieu vi pham rang buoc duy nhat (email hoac so dien thoai)");
    }

    /**
     * Loi chung -> 500 Internal Server Error.
     * <p>
     * Handler nay phai nam CUOI file va luon log lai. Neu bo qua log, loi that
     * se bi che hoan toan va kho phat hien.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
        log.error("Loi khong xac dinh khi xu ly request", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Da co loi xay ra tren may chu");
    }

    /** Cau truc JSON loi tra ve. */
    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(baseBody(status, message));
    }

    /** Tao noi dung JSON loi, dung chung cho moi handler. */
    private Map<String, Object> baseBody(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now());
        return body;
    }
}