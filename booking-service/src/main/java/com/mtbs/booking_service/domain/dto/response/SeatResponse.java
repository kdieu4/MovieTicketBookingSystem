package com.mtbs.booking_service.domain.dto.response;

public class SeatResponse {

    private Long id;
    private String seatRow;
    private Short seatNumber;
    private String seatType;

    public SeatResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSeatRow() {
        return seatRow;
    }

    public void setSeatRow(String seatRow) {
        this.seatRow = seatRow;
    }

    public Short getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(Short seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getSeatType() {
        return seatType;
    }

    public void setSeatType(String seatType) {
        this.seatType = seatType;
    }
}