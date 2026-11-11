package com.mtbs.auth_service.service.impl;

import com.mtbs.auth_service.domain.dto.request.ChangePasswordRequest;
import com.mtbs.auth_service.domain.dto.request.LoginRequest;
import com.mtbs.auth_service.domain.dto.request.RegisterRequest;
import com.mtbs.auth_service.domain.dto.response.TokenResponse;
import com.mtbs.auth_service.domain.entity.RedisToken;
import com.mtbs.auth_service.domain.entity.User;
import com.mtbs.auth_service.exception.InvalidDataException;
import com.mtbs.auth_service.exception.ResourceNotFoundException;
import com.mtbs.auth_service.repository.UserRepository;
import com.mtbs.auth_service.service.*;
import com.mtbs.auth_service.util.TokenType;
import com.mtbs.auth_service.util.UserStatus;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpHeaders.REFERER;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserService userService;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    // private final TokenService tokenService;
    private final RedisTokenService redisTokenService;
    private final JwtService jwtService;

    private final RestClient.Builder restClientBuilder;

    @Value("${app.user-service.base-url}")
    private String userServiceBaseUrl;

    @Value("${app.user-service.internal-api-key}")
    private String internalApiKey;

    @Override
    public TokenResponse login(LoginRequest request) {
        // dinh nghia user entity thanh user detail
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.email(), request.password()));
        var user = userRepository.findByEmail(request.email()).orElseThrow(
                () -> new UsernameNotFoundException("Email ko ton tai"));

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // tokenService.save(InvalidateToken.builder()
        // .email(user.getEmail())
        // .accessToken(accessToken)
        // .refreshToken(refreshToken)
        // .build());

        redisTokenService.save(RedisToken.builder()
                .id(user.getEmail())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build());

        return TokenResponse.from(
                accessToken,
                refreshToken,
                user.getUserId());
    }

    @Override
    public TokenResponse refreshToken(HttpServletRequest request) {
        String refreshToken = request.getHeader(REFERER);
        if (StringUtils.isBlank(refreshToken)) {
            throw new InvalidDataException("Token must be not blank");
        }

        // extract user from token
        final String email = jwtService.extractEmail(refreshToken, TokenType.REFRESH_TOKEN);
        System.out.println("email: " + email);
        // check it into database
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new UsernameNotFoundException("Email ko ton tai"));
        System.out.println("UserId: " + user.getUserId());

        if (!jwtService.isValid(refreshToken, user, TokenType.REFRESH_TOKEN)) {
            System.out.println("User email: " + user.getEmail());
            throw new InvalidDataException("Token is invalid");
        }

        String accessToken = jwtService.generateToken(user);

        redisTokenService.save(RedisToken.builder()
                .id(user.getEmail())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build());

        return TokenResponse.from(accessToken, refreshToken, user.getUserId());
    }

    @Override
    public String logout(HttpServletRequest request) {
        String accessToken = request.getHeader(REFERER);
        if (StringUtils.isBlank(accessToken)) {
            throw new InvalidDataException("Token must be not blank");
        }

        final String email = jwtService.extractEmail(accessToken, TokenType.ACCESS_TOKEN);
        User user = userService.getByEmail(email);

        // delete token permanent
        redisTokenService.delete(user.getEmail());

        return "Deleted";
    }

    @Override
    public String forgotPassword(String email) {
        // Kiem tra email co ton tai ko
        User user = userService.getByEmail(email);
        // Kiem tra nguoi dung co hoat dong ko
        if (!user.isEnabled()) {
            throw new InvalidDataException("User not active");
        }
        // Tao reset token
        String resetToken = jwtService.generateResetToken(user);
        // Gui link confirm
        // String confirmLink = "http://localhost:80/auth/reset-password";
        String confirmLink = String.format("curl --location 'http://localhost:/auth/reset-password'\\\n" +
                "--header 'accept: */*' \\\n" +
                "--header 'Content-Type: application/json' \\\n" +
                "--data '%s'", resetToken);
        log.info("confirmLink={}", confirmLink);
        redisTokenService.save(RedisToken.builder()
                .id(user.getEmail())
                .resetToken(resetToken)
                .build());
        return "Send";
    }

    @Override
    public String resetPassword(String secretKey) {
        log.info("----resetPassword----");
        // Kiem tra
        var user = validateToken(secretKey);

        redisTokenService.findById(user.getEmail());

        return "Reset";
    }

    @Override
    public String changePassword(ChangePasswordRequest request) {
        User user = validateToken(request.secretKey());
        if (!request.password().equals(request.confirmPassword())) {
            throw new InvalidDataException("Password not match");
        }
        user.setPassword(passwordEncoder.encode(request.password()));
        userService.saveUser(user);
        return "Changed";
    }

    @Override
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResourceNotFoundException("Email da ton tai");
        }
        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
                .password(passwordEncoder.encode(request.password()))
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.saveAndFlush(user);

        log.info("Auth account created: userId={}", savedUser.getUserId());

        syncUserProfile(savedUser);
    }

    private void syncUserProfile(User user) {
        // TODO Auto-generated method stub
        Map<String, Object> payload = Map.of(
                "authUserId", user.getUserId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "phoneNumber", user.getPhoneNumber());

        // 2. Tạo RestClient
        RestClient client = restClientBuilder.baseUrl(userServiceBaseUrl).build();

        try {
            // 3. Gọi API nội bộ của User Service
            client.post()
                    .uri("/api/users/internal/profiles")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            log.info(
                    "User profile synchronized: authUserId={}",
                    user.getUserId());

        } catch (RestClientResponseException ex) {
            int status = ex.getStatusCode().value();
            log.error("User Service rejected profile synchronization: " + "authUserId={}, status={}",
                    user.getUserId(), status);

            // Dữ liệu đã tồn tại nhưng không khớp
            if (status == 409) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "User profile conflict. Manual reconciliation required.");
            }

            // User Service gặp lỗi HTTP
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "User profile synchronization failed");

        } catch (ResourceAccessException ex) {

            // User Service không kết nối được hoặc timeout
            log.error("User Service unavailable: authUserId={}", user.getUserId());

            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "User Service is temporarily unavailable");
        }
    }

    private User validateToken(String secretKey) {
        final String email = jwtService.extractEmail(secretKey, TokenType.RESET_TOKEN);
        var user = userService.getByEmail(email);

        if (!user.isEnabled()) {
            throw new InvalidDataException("User not active");
        }

        if (!jwtService.isValid(secretKey, user, TokenType.RESET_TOKEN)) {
            throw new InvalidDataException("Not allow access with this token");
        }
        return user;
    }
}
