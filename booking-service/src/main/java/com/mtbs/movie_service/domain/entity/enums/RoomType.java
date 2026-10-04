/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Enum.java to edit this template
 */
package com.mtbs.movie_service.domain.entity.enums;

import lombok.Getter;
/**
 *
 * @author quanghieu
 */
@Getter
public enum RoomType {
    TWO_D("2D"),
    THREE_D("3D"),
    IMAX("IMAX"),
    FOUR_DX("4DX");

    private final String value;

    RoomType(String value) {
        this.value = value;
    }
}