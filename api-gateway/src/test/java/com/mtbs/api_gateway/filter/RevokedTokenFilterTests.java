package com.mtbs.api_gateway.filter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.junit.jupiter.api.Test;

class RevokedTokenFilterTests {

	@Test
	void readsJtiFromPayload() {
		String payload = "{\"sub\":\"a@example.com\",\"jti\":\"abc-123\"}";
		String token = "header." + Base64.getUrlEncoder().withoutPadding()
				.encodeToString(payload.getBytes(StandardCharsets.UTF_8)) + ".signature";

		assertEquals("abc-123", RevokedTokenFilter.readJti(token));
	}

	@Test
	void ignoresMalformedToken() {
		assertNull(RevokedTokenFilter.readJti("not-a-jwt"));
		assertNull(RevokedTokenFilter.readJti("header.%%%.signature"));
	}
}
