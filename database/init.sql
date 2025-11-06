-- 로또 예측 시스템 데이터베이스 초기화 스크립트

-- 데이터베이스가 없으면 생성 (docker-compose에서 자동 생성됨)
CREATE DATABASE IF NOT EXISTS lotto_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lotto_db;

-- 1. 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 로또 당첨 번호 테이블
CREATE TABLE IF NOT EXISTS lotto_numbers (
    draw_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    round INT NOT NULL UNIQUE COMMENT '회차',
    draw_date DATE NOT NULL COMMENT '추첨일',
    number1 INT NOT NULL,
    number2 INT NOT NULL,
    number3 INT NOT NULL,
    number4 INT NOT NULL,
    number5 INT NOT NULL,
    number6 INT NOT NULL,
    bonus_number INT COMMENT '보너스 번호',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_draw_date (draw_date DESC),
    INDEX idx_round (round DESC),
    CHECK (number1 BETWEEN 1 AND 45),
    CHECK (number2 BETWEEN 1 AND 45),
    CHECK (number3 BETWEEN 1 AND 45),
    CHECK (number4 BETWEEN 1 AND 45),
    CHECK (number5 BETWEEN 1 AND 45),
    CHECK (number6 BETWEEN 1 AND 45),
    CHECK (bonus_number BETWEEN 1 AND 45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 예측 이력 테이블
CREATE TABLE IF NOT EXISTS prediction_history (
    prediction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    predicted_numbers VARCHAR(50) NOT NULL COMMENT '예측된 번호 (쉼표로 구분)',
    method VARCHAR(20) NOT NULL COMMENT 'ml, statistical, hybrid',
    confidence DECIMAL(5,2) COMMENT '신뢰도 (0-100)',
    matched_numbers INT DEFAULT 0 COMMENT '맞은 개수',
    target_round INT COMMENT '대상 회차',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 선호 번호 테이블
CREATE TABLE IF NOT EXISTS favorite_numbers (
    favorite_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    numbers VARCHAR(50) NOT NULL COMMENT '선호 번호 (쉼표로 구분)',
    label VARCHAR(50) COMMENT '레이블 (예: 내 번호, 분석가 추천)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 사용자 분석 통계 테이블
CREATE TABLE IF NOT EXISTS user_analysis (
    analysis_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    accuracy_rate DECIMAL(5,2) COMMENT '정확도 (%)',
    total_predictions INT DEFAULT 0 COMMENT '총 예측 횟수',
    matches INT DEFAULT 0 COMMENT '맞춘 횟수',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 샘플 데이터 삽입 (테스트용)
INSERT INTO users (username, password_hash, email) VALUES 
('test_user', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'test@example.com'),
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@example.com')
ON DUPLICATE KEY UPDATE username=username;

-- 최근 로또 당첨 번호 샘플 (실제 데이터로 대체 필요)
INSERT INTO lotto_numbers (round, draw_date, number1, number2, number3, number4, number5, number6, bonus_number) VALUES
(1095, '2023-11-04', 8, 19, 20, 31, 34, 42, 18),
(1094, '2023-10-28', 3, 9, 14, 19, 27, 42, 33),
(1093, '2023-10-21', 1, 8, 11, 31, 34, 42, 15),
(1092, '2023-10-14', 7, 16, 20, 34, 39, 43, 2),
(1091, '2023-10-07', 4, 12, 18, 25, 33, 40, 23)
ON DUPLICATE KEY UPDATE round=round;

-- 인덱스 생성 확인
SHOW INDEX FROM users;
SHOW INDEX FROM lotto_numbers;
SHOW INDEX FROM prediction_history;
