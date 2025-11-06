package com.lotto.userservice.service;

import com.lotto.userservice.dto.AuthRequest;
import com.lotto.userservice.dto.AuthResponse;
import com.lotto.userservice.dto.RegisterRequest;
import com.lotto.userservice.entity.User;
import com.lotto.userservice.repository.UserRepository;
import com.lotto.userservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 중복 검사
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // 사용자 생성
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();
        
        userRepository.save(user);
        
        // JWT 생성
        String token = jwtUtil.generateToken(user.getUsername());
        
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .message("Registration successful")
                .build();
    }
    
    public AuthResponse login(AuthRequest request) {
        // 사용자 찾기
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        
        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }
        
        // JWT 생성
        String token = jwtUtil.generateToken(user.getUsername());
        
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .message("Login successful")
                .build();
    }
}
