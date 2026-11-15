package com.mtbs.api_gateway.filter;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

class InternalPathBlockFilterTests {

	private final InternalPathBlockFilter filter = new InternalPathBlockFilter();

	@Test
	void blocksInternalPaths() {
		MockServerWebExchange exchange = MockServerWebExchange
				.from(MockServerHttpRequest.get("/api/internal/showtimes/1/seat-claims"));

		filter.filter(exchange, failingChain()).block();

		assertEquals(HttpStatus.FORBIDDEN, exchange.getResponse().getStatusCode());
	}

	@Test
	void passesPublicPathsThrough() {
		MockServerWebExchange exchange = MockServerWebExchange
				.from(MockServerHttpRequest.get("/api/getMovies"));
		boolean[] reachedChain = { false };

		filter.filter(exchange, ex -> {
			reachedChain[0] = true;
			return Mono.empty();
		}).block();

		assertEquals(true, reachedChain[0]);
	}

	private GatewayFilterChain failingChain() {
		return (ServerWebExchange exchange) -> Mono.error(new AssertionError("chain must not be called"));
	}

}
