-- 로또 판매점 테이블
CREATE TABLE IF NOT EXISTS lotto_stores (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(200) NOT NULL,
    address VARCHAR(500),
    region VARCHAR(50),
    wins_1st INT DEFAULT 0 COMMENT '1등 배출 횟수',
    wins_2nd INT DEFAULT 0 COMMENT '2등 배출 횟수',
    total_wins INT DEFAULT 0 COMMENT '총 당첨 횟수',
    `rank` INT DEFAULT 0 COMMENT '순위',
    latitude DECIMAL(10, 7) NULL COMMENT '위도',
    longitude DECIMAL(10, 7) NULL COMMENT '경도',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_store (store_name, address),
    INDEX idx_region (region),
    INDEX idx_rank (`rank`),
    INDEX idx_wins (wins_1st DESC, wins_2nd DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='로또 판매점 정보';

-- 지역별 통계 뷰
CREATE OR REPLACE VIEW v_region_stats AS
SELECT 
    region,
    COUNT(*) as store_count,
    SUM(wins_1st) as total_1st_wins,
    SUM(wins_2nd) as total_2nd_wins,
    SUM(total_wins) as total_wins,
    AVG(wins_1st) as avg_1st_wins,
    AVG(wins_2nd) as avg_2nd_wins
FROM lotto_stores
WHERE region IS NOT NULL AND region != ''
GROUP BY region
ORDER BY total_wins DESC;
