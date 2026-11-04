package com.mtbs.user_service.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/**
 * Response co phan trang.
 * <p>
 * Khong tra ve thang Page cua Spring Data vi JSON cua no thay doi theo phien ban
 * va co nhieu truong thong tin khong can dung. DTO rieng giup API on dinh.
 *
 * @param <T> kieu du lieu trong mot trang
 */
@Getter
@AllArgsConstructor
public class PageResponse<T> {

    /** Du lieu trong trang hien tai. */
    private final List<T> content;

    /** So trang, bat dau tu 0. */
    private final int page;

    /** So ban ghi moi trang. */
    private final int size;

    /** Tong so ban ghi trong toan bo bang. */
    private final long totalElements;

    /** Tong so trang. */
    private final int totalPages;

    /** Trang hien tai co phai trang dau tien khong. */
    private final boolean first;

    /** Trang hien tai co phai trang cuoi cung khong. */
    private final boolean last;

    /** Trang hien tai co rong khong. */
    private final boolean empty;

    /** Chuyen tu Page cua Spring sang DTO nay. */
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<T>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.isEmpty());
    }

    /** Chuyen Page sang PageResponse bang ham chuyen doi tung phan tu. */
    public static <E, T> PageResponse<T> from(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<T>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.isEmpty());
    }
}