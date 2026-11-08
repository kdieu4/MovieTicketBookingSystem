
package com.example.messaging;

import com.example.domain.entity.Payment;

public class PaymentCompletedEvent {

    private Long bookingId;
    private Long paymentId;
    private String status;

    public PaymentCompletedEvent() {
    }

    public PaymentCompletedEvent(Long bookingId, Long paymentId, String status) {
        this.bookingId = bookingId;
        this.paymentId = paymentId;
        this.status = status;
    }

    // Chuyển dữ liệu từ Payment thành PaymentCompletedEvent
    public static PaymentCompletedEvent from(Payment payment) {
        return new PaymentCompletedEvent(
                payment.getBookingId(),
                payment.getId(),
                payment.getStatus().name()
        );
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
