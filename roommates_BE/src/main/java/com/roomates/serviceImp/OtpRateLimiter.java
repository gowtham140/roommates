package com.roomates.serviceImp;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Component;

import com.roomates.exception.BadRequestException;

@Component
public class OtpRateLimiter {

    public static final int MAX_REQUESTS = 3;
    static final Duration WINDOW = Duration.ofMinutes(10);

    private final Clock clock;
    private final ConcurrentMap<String, Deque<Instant>> requests = new ConcurrentHashMap<>();

    public OtpRateLimiter() {
        this(Clock.systemUTC());
    }

    public OtpRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public void checkAllowed(String email) {
        Instant now = clock.instant();
        requests.compute(email, (key, timestamps) -> {
            Deque<Instant> recent = timestamps == null ? new ArrayDeque<>() : timestamps;
            while (!recent.isEmpty() && !recent.peekFirst().isAfter(now.minus(WINDOW))) {
                recent.pollFirst();
            }
            if (recent.size() >= MAX_REQUESTS) {
                throw new BadRequestException("Too many verification code requests. Please try again in 10 minutes.");
            }
            recent.addLast(now);
            return recent;
        });
    }

    public void refund(String email) {
        requests.computeIfPresent(email, (key, timestamps) -> {
            if (!timestamps.isEmpty()) {
                timestamps.pollLast();
            }
            return timestamps.isEmpty() ? null : timestamps;
        });
    }
}
