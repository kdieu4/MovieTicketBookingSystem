package com.mtbs.booking_service.domain.dto.response;

public class ShowtimeResponse {

    private Long showtimeId;

    private Long roomId;

    public ShowtimeResponse() {
    }

    public Long getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Long showtimeId) {
        this.showtimeId = showtimeId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }
}