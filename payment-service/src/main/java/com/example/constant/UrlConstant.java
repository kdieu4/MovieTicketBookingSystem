package com.example.constant;

public final class UrlConstant {
    public static final class Payment {
        public static final String PREFIX = "/payments";

        public static final String BY_ID = PREFIX + "/{paymentId}";
    }

    public static final class Momo {
        public static final String PREFIX = "/momo";

        public static final String CREATE = PREFIX + "/create";
    }

    public static final String VIETQR_PAYMENT = "/vietqr";
}