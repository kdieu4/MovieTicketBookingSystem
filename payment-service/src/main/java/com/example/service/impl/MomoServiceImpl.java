package com.example.service.impl;

import com.example.client.MomoApi;
import com.example.domain.dto.request.MomoPaymentRequest;
import com.example.domain.dto.response.MomoPaymentResponse;
import com.example.service.MomoService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MomoServiceImpl implements MomoService {
    @Value(value = "${momo.partner-code}")
    String PARTNER_CODE;
    @Value(value = "${momo.access-key}")
    String ACCESS_KEY;
    @Value(value = "${momo.secret-key}")
    String SECRET_KEY;
    @Value(value = "${momo.return-url}")
    String REDIRECT_URL;
    @Value(value = "${momo.ipn-url}")
    String IPN_URL;
    @Value(value = "${momo.request-type}")
    String REQUEST_TYPE;

    @Value(value = "${momo.endpoint}")
    String END_POINT;

    final MomoApi momoApi;

    final RestClient.Builder restClientBuilder;

    @Override
    public MomoPaymentResponse createQr() {
        String orderId = UUID.randomUUID().toString();
        String orderInfo = "Thanh toan don hang: " + orderId;
        String requestId = UUID.randomUUID().toString();
        String extraData = "";
        long amount = 10000;
        String rawSignature = String.format(
                "accessKey=%s" +
                        "&amount=%s" +
                        "&extraData=%s" +
                        "&ipnUrl=%s" +
                        "&orderId=%s" +
                        "&orderInfo=%s" +
                        "&partnerCode=%s" +
                        "&redirectUrl=%s" +
                        "&requestId=%s" +
                        "&requestType=%s",
                ACCESS_KEY, amount, extraData, IPN_URL, orderId, orderInfo, PARTNER_CODE, REDIRECT_URL, requestId, REQUEST_TYPE
        );

        String prettySignature = "";
        try {
            prettySignature = signHmacSHA256(rawSignature, SECRET_KEY);
        } catch (Exception e) {
            log.error(">>>>Co loi khi hash code: {}", e.getMessage());
            throw new IllegalStateException(
                    "Cannot generate MoMo payment signature", e
            );
        }

        if (prettySignature.isBlank()) {
            log.error(">>>> Signature is blank");
            return null;
        }

        MomoPaymentRequest request = MomoPaymentRequest.builder()
                .partnerCode(PARTNER_CODE)
                .requestType(REQUEST_TYPE)
                .ipnUrl(IPN_URL)
                .redirectUrl(REDIRECT_URL)
                .orderId(orderId)
                .orderInfo(orderInfo)
                .requestId(requestId)
                .extraData(extraData)
                .amount(amount)
                .signature(prettySignature)
                .lang("vi")
                .build();
//        return momoApi.createMomoQr(request);
        return restClientBuilder.build()
                .post()
                .uri(END_POINT + "/create")
                .body(request)
                .retrieve()
                .body(MomoPaymentResponse.class);
    }

    private String signHmacSHA256(String data, String key) throws Exception {
        Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSHA256.init(secretKey);

        byte[] hash = hmacSHA256.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
