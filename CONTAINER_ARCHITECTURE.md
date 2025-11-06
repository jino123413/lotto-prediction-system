# 컨테이너 아키텍처 설명

## 📦 전체 계획: 9개 컨테이너

### 프로덕션 환경 (9개)
```
1. nginx-proxy-manager  - Nginx Proxy Manager (웹 GUI 관리)
2. frontend-app         - React 빌드 정적 파일 (Nginx)
3. api-gateway          - Node.js Express
4. data-collector       - Python Flask (판매점 크롤러 포함)
5. statistics-service   - Python Flask
6. ml-prediction        - Python Flask
7. user-service         - Spring Boot 3.1.5 (JWT)
8. redis-session        - Redis 7
9. mysql-db             - MySQL 8.0 (Docker)
```

## 🎯 현재 상태: 9개 컨테이너 (프로덕션 준비 완료) ⭐⭐⭐ 100% 완성

### 실행 중인 컨테이너 (9/9) ✅
```
✅ 1. nginx-proxy-manager      - 포트 80, 81, 443 ⭐⭐⭐
✅ 2. frontend-app             - 포트 80 (Nginx) ⭐⭐
✅ 3. api-gateway              - 포트 8000
✅ 4. data-collector-service   - 포트 8001 (판매점 크롤러 포함)
✅ 5. statistics-service       - 포트 8002
✅ 6. ml-prediction-service    - 포트 8003
✅ 7. user-service             - 포트 8004 (Spring Boot 3.1.5)
✅ 8. redis-session            - 포트 6379 (Redis 7)
✅ 9. mysql-db                 - 포트 3306 (MySQL 8.0)
```

### 🎊 모든 컨테이너 정상 작동 중!

---

## 🔄 개발 환경 vs 프로덕션 환경

### 개발 환경 (현재)
- **Frontend**: `npm run dev` (포트 3000)
  - Vite 개발 서버
  - Hot Module Replacement (HMR)
  - 빠른 개발 및 디버깅
  
- **직접 접속**:
  - http://localhost:3000 (Frontend)
  - http://localhost:8001 (Data Collector)
  - http://localhost:8002 (Statistics)
  - http://localhost:8003 (ML Prediction)
  - http://localhost:8000 (API Gateway)

### 프로덕션 환경 (계획)
- **Frontend**: Docker 컨테이너
  - `npm run build` 결과물
  - Nginx로 정적 파일 서빙
  - 최적화된 빌드

- **Nginx 라우팅**:
  - https://example.com → Frontend
  - https://example.com/api/data → Data Collector
  - https://example.com/api/stats → Statistics
  - https://example.com/api/ml → ML Prediction
  - https://example.com/api/user → User Service

---

## 📋 각 컨테이너 역할

### 1. nginx-proxy-manager ⭐⭐⭐
- **역할**: 리버스 프록시, SSL/TLS 종료, 웹 GUI 관리
- **기술**: Nginx Proxy Manager
- **포트**: 80 (HTTP), 81 (Admin), 443 (HTTPS)
- **상태**: 실행 중
- **접속**: http://192.168.44.128:81

### 2. frontend-app ⭐⭐
- **역할**: React 빌드 파일 서빙
- **기술**: Nginx + React build (Vite)
- **포트**: 80
- **상태**: 실행 중 (프로덕션 빌드)
- **페이지**: 9개 (Home, Analysis, NumberAnalysis, CheckWinning, PredictionHistory, Login, Register, Stores, StoreMap)
- **접속**: http://192.168.44.128

### 3. api-gateway ✅
- **역할**: API 라우팅, 인증 검증
- **기술**: Node.js + Express
- **포트**: 8000
- **상태**: 실행 중

### 4. data-collector-service ⭐
- **역할**: 로또 데이터 크롤링 및 판매점 정보 수집
- **기술**: Python + Flask
- **포트**: 8001
- **상태**: 실행 중
- **데이터**: 1,196개 회차 + 264개 판매점

### 5. statistics-service ✅
- **역할**: 통계 분석 (빈도, 패턴)
- **기술**: Python + Flask + NumPy
- **포트**: 8002
- **상태**: 실행 중

### 6. ml-prediction-service ✅
- **역할**: 머신러닝 예측 (5가지 방식)
- **기술**: Python + Flask + scikit-learn + XGBoost
- **포트**: 8003
- **상태**: 실행 중

### 7. user-service ✅
- **역할**: 사용자 인증, 회원 관리, JWT 토큰 발급
- **기술**: Spring Boot 3.1.5 + JWT + Spring Security
- **포트**: 8004
- **상태**: 실행 중 ⭐ 구현 완료

### 8. redis-session ✅
- **역할**: 캐시, 세션 관리
- **기술**: Redis 7
- **포트**: 6379
- **상태**: 실행 중

### 9. mysql-db ✅
- **역할**: 데이터베이스 (로또 번호, 사용자, 판매점, 통계)
- **기술**: MySQL 8.0 (Docker)
- **포트**: 3306
- **데이터**: 1,196개 회차 + 1369개 판매점 + 사용자 정보
- **테이블**: lotto_numbers, users, lotto_stores, v_region_stats 등
- **상태**: Docker 컨테이너로 실행 중

---

## ✅ 완료된 작업 (Phase 7.9)

### 프로덕션 배포 완료
```bash
# 전체 9개 컨테이너 실행 중
docker-compose ps

# 프론트엔드 접속
http://192.168.44.128

# API 접속
http://192.168.44.128/api/

# 관리 페이지
http://192.168.44.128:81
```

### 주요 기능
- ✅ 9개 페이지 프론트엔드
- ✅ AI 기반 5가지 예측 방식
- ✅ 지역별 판매점 지도 시각화 (인터랙티브)
- ✅ JWT 인증 및 사용자 관리
- ✅ 1,196개 회차 데이터
- ✅ 1,369개 판매점 데이터

---

## 📊 현재 시스템 구조 (프로덕션 환경)

```
                    ┌─────────────────────────────────────┐
                    │   사용자 (Browser)                   │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │  Nginx Proxy Manager :80, 81, 443  │
                    │  (리버스 프록시 + 웹 GUI 관리)       │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────┴──────────────────────┐
                    │                                     │
        ┌───────────▼──────────┐          ┌──────────────▼─────────┐
        │  Frontend (Nginx)    │          │   API Gateway :8000    │
        │  :80 (React Build)   │          │   (Node.js/Express)    │
        └──────────────────────┘          └──────────────┬─────────┘
                                                         │
                              ┌──────────────────────────┼──────────────────┐
                              │                          │                  │
                 ┌────────────▼──────────┐  ┌───────────▼────────┐  ┌──────▼────────┐
                 │  Data Collector :8001 │  │ Statistics :8002   │  │ ML Pred :8003 │
                 │  (로또+판매점 크롤러)  │  │  (통계 분석)       │  │  (AI 예측)    │
                 └────────────┬──────────┘  └───────────┬────────┘  └──────┬────────┘
                              │                         │                  │
                              └─────────────┬───────────┴──────────────────┘
                                            │
                              ┌─────────────▼──────────┐
                              │   User Service :8004   │
                              │   (Spring Boot/JWT)    │
                              └─────────────┬──────────┘
                                            │
                              ┌─────────────┴──────────┐
                              │                        │
                   ┌──────────▼─────────┐   ┌─────────▼─────────┐
                   │  MySQL :3306       │   │  Redis :6379      │
                   │  (1,196회차 +      │   │  (세션 & 캐시)    │
                   │   1,369 판매점)    │   │                   │
                   └────────────────────┘   └───────────────────┘
```

---

**작성일**: 2025-11-05  
**최종 업데이트**: 2025-11-07 01:15  
**버전**: 4.0  
**상태**: 프로덕션 환경 100% 완성 (Phase 7.9) ⭐⭐⭐
