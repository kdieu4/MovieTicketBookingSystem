package com.example.service.impl;

import com.example.config.VNPayProperties;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VNPayService {
    VNPayProperties properties;
    static ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    public String createPaymentUrl() {
        String transactionRef = UUID.randomUUID().toString();
        BigDecimal amount = BigDecimal.valueOf(10000);
        String ipAddress = "127.0.0.1";
        LocalDateTime now = LocalDateTime.now(VIETNAM);
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", properties.version());
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", properties.tmnCode());

        params.put("vnp_Amount", amount.multiply(BigDecimal.valueOf(100)).toBigIntegerExact().toString());
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_OrderInfo", "Thanh toan ve phim " + transactionRef);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", properties.returnUrl());
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_CreateDate", now.format(FORMATTER));
        params.put("vnp_ExpireDate", now.plusMinutes(15).format(FORMATTER));
        params.put("vnp_TxnRef", transactionRef);

        String queryString = buildQueryString(params);

        String secureHash = hmacSHA512(properties.hashSecret(), queryString);

        return properties.payUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    private String buildQueryString(Map<String, String> params) {
        return params.entrySet()
                .stream()
                .map(entry -> encode(entry.getKey())
                        + "=" + encode(entry.getValue())).collect(Collectors.joining("&"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String hmacSHA512(String secret, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");

            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));

            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Cannot generate VNPay signature", e);
        }
    }

    // Kiểm tra chữ ký dữ liệu VNPay trả về.
    public boolean verifySignature(Map<String, String> callback) {
        String receivedHash = callback.get("vnp_SecureHash");

        if (receivedHash == null || receivedHash.isBlank()) {
            return false;
        }

        Map<String, String> params = new TreeMap<>(callback);
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String calculatedHash = hmacSHA512(properties.hashSecret(), buildQueryString(params));

        return java.security.MessageDigest.isEqual(
                calculatedHash.getBytes(StandardCharsets.US_ASCII),
                receivedHash.toLowerCase(java.util.Locale.ROOT)
                        .getBytes(StandardCharsets.US_ASCII)
        );
    }

    public Map<String, String> handleReturn(Map<String, String> params) {
        if (!verifySignature(params)) {
            return Map.of(
                    "status", "INVALID_SIGNATURE",
                    "message", "Chu ky khong hop le"
            );
        }
        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            return Map.of(
                    "status", "SUCCESS",
                    "message", "Thanh toan thanh cong"
            );
        }

        return Map.of(
                "status", "FAILED",
                "message", "Thanh toan that bai"
        );
    }

    public Map<String, String> handleIpn(Map<String, String> params) {
        if (!verifySignature(params)) {
            return Map.of(
                    "RspCode", "97",
                    "Message", "Invalid signature"
            );
        }

        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            return Map.of(
                    "RspCode", "00",
                    "Message", "Confirm Success"
            );
        }
        return Map.of(
                "RspCode", "00",
                "Message", "Confirm Success"
        );
    }
}