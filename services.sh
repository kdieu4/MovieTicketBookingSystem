#!/usr/bin/env bash
# Start/stop all backend services in dependency order.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$ROOT_DIR/.run"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yaml"
mkdir -p "$RUN_DIR"

# Services read secrets (DB, MoMo, internal keys) from a root .env, as their
# .env.example files instruct.
if [ -f "$ROOT_DIR/.env" ]; then
	set -a
	. "$ROOT_DIR/.env"
	set +a
fi

# Eureka must be ready before the clients; stop uses the reverse order.
SERVICES=(
	eureka-server:8761
	api-gateway:8080
	user-service:8081
	booking-service:8082
	movie-service:8083
	payment-service:8084
	auth-service:8085
)

port_in_use() {
	(exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null
}

is_running() {
	local pid
	pid="$(cat "$RUN_DIR/$1.pid" 2>/dev/null || true)"
	[ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

wait_for_port() {
	local port=$1 name=$2 timeout=${3:-60} i=0
	while ! port_in_use "$port"; do
		if ((i >= timeout)); then
			echo "ERROR: $name did not open port $port within ${timeout}s. See $RUN_DIR/$name.log" >&2
			return 1
		fi
		sleep 1
		i=$((i + 1))
	done
}

# Docker Desktop ships as a user unit and is not enabled by default, so a fresh
# login has no daemon and every compose call fails. Start it and wait for the
# socket instead of asking the user to do it by hand.
ensure_docker() {
	docker info >/dev/null 2>&1 && return 0

	if systemctl --user start docker-desktop 2>/dev/null; then
		echo "Waiting for Docker Desktop..."
		for _ in {1..60}; do
			docker info >/dev/null 2>&1 && return 0
			sleep 2
		done
	fi

	echo "ERROR: Docker daemon is not running. Start Docker Desktop and retry." >&2
	return 1
}

start_infra() {
	ensure_docker
	echo "Starting Redis + RabbitMQ..."
	docker compose -f "$COMPOSE_FILE" up -d --wait
}

stop_infra() {
	echo "Stopping Redis + RabbitMQ..."
	docker compose -f "$COMPOSE_FILE" stop
}

start_one() {
	local entry=$1 name=${entry%%:*} port=${entry##*:}

	if is_running "$name"; then
		echo "$name already running"
		return 0
	fi
	rm -f "$RUN_DIR/$name.pid"

	if port_in_use "$port"; then
		echo "WARN: port $port is already in use, not starting $name"
		return 0
	fi

	echo "Starting $name (port $port)..."
	(
		cd "$ROOT_DIR/$name"
		setsid mvn -q spring-boot:run >"$RUN_DIR/$name.log" 2>&1 &
		echo $! >"$RUN_DIR/$name.pid"
	)
}

stop_one() {
	local name=$1
	local pid_file="$RUN_DIR/$name.pid"
	local pid

	if [ ! -f "$pid_file" ]; then
		echo "$name not running"
		return 0
	fi

	pid="$(cat "$pid_file")"
	if ! kill -0 "$pid" 2>/dev/null; then
		rm -f "$pid_file"
		echo "$name not running"
		return 0
	fi

	echo "Stopping $name..."
	kill -TERM -- "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
	for _ in {1..20}; do
		kill -0 "$pid" 2>/dev/null || break
		sleep 0.5
	done
	kill -KILL -- "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
	rm -f "$pid_file"
}

case "${1:-}" in
start)
	start_infra

	for entry in "${SERVICES[@]}"; do
		start_one "$entry"
		# Never let services race Eureka on a cold start.
		if [ "${entry%%:*}" = eureka-server ]; then
			wait_for_port 8761 eureka-server 90
		fi
	done

	echo "Waiting for services to open their ports..."
	failed=0
	for _ in {1..90}; do
		failed=0
		for entry in "${SERVICES[@]}"; do
			if ! port_in_use "${entry##*:}"; then
				failed=1
				break
			fi
		done
		if [ "$failed" = 0 ]; then
			break
		fi
		sleep 1
	done

	for entry in "${SERVICES[@]}"; do
		name=${entry%%:*}
		if port_in_use "${entry##*:}"; then
			echo "  $name up"
		else
			echo "  $name DOWN (see $RUN_DIR/$name.log)"
		fi
	done
	exit "$failed"
	;;
stop)
	for ((i = ${#SERVICES[@]} - 1; i >= 0; i--)); do
		stop_one "${SERVICES[$i]%%:*}"
	done
	stop_infra
	echo "Stopped."
	;;
*)
	echo "Usage: $0 {start|stop}" >&2
	exit 1
	;;
esac
