package com.mtbs.api_gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

/** Internal service endpoints are for service-to-service calls, never for gateway clients. */
@Component
public class InternalPathBlockFilter implements GlobalFilter, Ordered {

	private static final String[] INTERNAL_PREFIXES = { "/api/internal/", "/api/users/internal/" };

	@Override
	public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
		String path = exchange.getRequest().getPath().value();
		for (String prefix : INTERNAL_PREFIXES) {
			if (path.startsWith(prefix)) {
				exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
				return exchange.getResponse().setComplete();
			}
		}
		return chain.filter(exchange);
	}

	@Override
	public int getOrder() {
		return -1;
	}

}
