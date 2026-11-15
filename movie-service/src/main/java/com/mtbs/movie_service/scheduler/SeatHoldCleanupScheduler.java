package com.mtbs.movie_service.scheduler;

import com.mtbs.movie_service.domain.entity.enums.SeatStatus;
import com.mtbs.movie_service.repository.ShowtimeSeatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

/**
 * Dọn các ghế đang HOLDING nhưng đã quá hạn giữ.
 *
 * Khi đọc sơ đồ ghế, ghế quá hạn vẫn được coi là trống, nhưng trong DB nó còn
 * mang trạng thái HOLDING và holdBy cũ. Job này đưa chúng về AVAILABLE để dữ
 * liệu khớp với những gì người dùng thấy.
 */
@Component
public class SeatHoldCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(SeatHoldCleanupScheduler.class);

    private final ShowtimeSeatRepository showtimeSeatRepository;

    public SeatHoldCleanupScheduler(ShowtimeSeatRepository showtimeSeatRepository) {
        this.showtimeSeatRepository = showtimeSeatRepository;
    }

    @Scheduled(
            fixedDelayString = "${seat.cleanup.scan-interval-ms:60000}",
            initialDelayString = "${seat.cleanup.initial-delay-ms:30000}")
    @Transactional
    public void releaseExpiredHolds() {
        int released = showtimeSeatRepository.releaseExpiredHolds(
                OffsetDateTime.now(),
                SeatStatus.HOLDING,
                SeatStatus.AVAILABLE);

        if (released > 0) {
            log.info("Đã mở lại {} ghế quá hạn giữ", released);
        }
    }
}