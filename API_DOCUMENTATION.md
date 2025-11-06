# API 문서

## 📋 목차
1. [개요](#개요)
2. [인증](#인증)
3. [Data Collector Service](#data-collector-service)
4. [Statistics Service](#statistics-service)
5. [ML Prediction Service](#ml-prediction-service)
6. [User Service](#user-service)

---

## 개요

### Base URL
- **프로덕션**: `http://192.168.44.128/api`
- **개발**: `http://localhost:8000`

### 응답 형식
모든 API는 다음 형식의 JSON을 반환합니다:
```json
{
  "success": true,
  "data": { ... },
  "count": 0,
  "message": "성공 메시지"
}
```

---

## 인증

### JWT 토큰
일부 API는 JWT 토큰이 필요합니다.

**헤더 형식:**
```
Authorization: Bearer <token>
```

---

## Data Collector Service

Base Path: `/api/data`

### 1. 최신 로또 번호 조회
```http
GET /api/data/lotto/latest
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "draw_no": 1196,
    "draw_date": "2025-11-01",
    "number1": 7,
    "number2": 12,
    "number3": 19,
    "number4": 28,
    "number5": 35,
    "number6": 42,
    "bonus": 15
  }
}
```

### 2. 특정 회차 조회
```http
GET /api/data/lotto/{draw_no}
```

**경로 파라미터:**
- `draw_no`: 회차 번호 (예: 1196)

### 3. 로또 번호 크롤링 (관리자용)
```http
POST /api/data/lotto/crawl
```

**요청 바디:**
```json
{
  "draw_no": 1197
}
```

### 4. 판매점 통계 조회
```http
GET /api/data/stores/stats/region
```

**응답 예시:**
```json
{
  "success": true,
  "count": 17,
  "data": [
    {
      "region": "경기",
      "store_count": 357,
      "total_1st_wins": "413",
      "total_2nd_wins": "0",
      "total_wins": "413",
      "avg_1st_wins": "1.1569"
    }
  ]
}
```

### 5. 상위 판매점 조회
```http
GET /api/data/stores/top?limit=100
```

**쿼리 파라미터:**
- `limit`: 조회할 판매점 수 (기본값: 10)

---

## Statistics Service

Base Path: `/api/stats`

### 1. 번호 빈도 분석
```http
GET /api/stats/frequency
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "1": 150,
    "2": 145,
    ...
    "45": 138
  }
}
```

### 2. 패턴 분석
```http
GET /api/stats/patterns
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "odd_even": {
      "odd": 3.2,
      "even": 2.8
    },
    "low_high": {
      "low": 3.1,
      "high": 2.9
    }
  }
}
```

### 3. 추이 분석
```http
GET /api/stats/trends?limit=50
```

**쿼리 파라미터:**
- `limit`: 분석할 최근 회차 수 (기본값: 20)

### 4. 히트맵 데이터
```http
GET /api/stats/heatmap
```

---

## ML Prediction Service

Base Path: `/api/ml`

### 1. AI 번호 예측
```http
POST /api/ml/predict
```

**요청 바디:**
```json
{
  "method": "ensemble"
}
```

**예측 방식 (method):**
- `random_forest`: Random Forest 모델
- `xgboost`: XGBoost 모델
- `ensemble`: 앙상블 (RF + XGB)
- `statistical`: 통계 기반
- `combined`: 5가지 조합

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "numbers": [7, 12, 19, 28, 35, 42],
    "method": "ensemble",
    "confidence": 0.75,
    "generated_at": "2025-11-07T00:36:00"
  }
}
```

### 2. 모델 정보 조회
```http
GET /api/ml/model/info
```

---

## User Service

Base Path: `/api/auth` 및 `/api/predictions`

### 1. 회원가입
```http
POST /api/auth/register
```

**요청 바디:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "securepassword"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "회원가입 성공",
  "data": {
    "userId": 1,
    "username": "user123"
  }
}
```

### 2. 로그인
```http
POST /api/auth/login
```

**요청 바디:**
```json
{
  "username": "user123",
  "password": "securepassword"
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "username": "user123"
  }
}
```

### 3. 예측 이력 저장
```http
POST /api/predictions
```

**헤더:**
```
Authorization: Bearer <token>
```

**요청 바디:**
```json
{
  "numbers": [7, 12, 19, 28, 35, 42],
  "method": "ensemble",
  "draw_no": 1197
}
```

### 4. 예측 이력 조회
```http
GET /api/predictions
```

**헤더:**
```
Authorization: Bearer <token>
```

### 5. 예측 이력 삭제
```http
DELETE /api/predictions/{id}
```

---

## 에러 코드

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `404`: 리소스 없음
- `500`: 서버 오류

### 에러 응답 형식
```json
{
  "success": false,
  "error": "오류 메시지",
  "code": "ERROR_CODE"
}
```

---

## 테스트

### cURL 예시

**최신 로또 번호 조회:**
```bash
curl http://192.168.44.128/api/data/lotto/latest
```

**AI 예측:**
```bash
curl -X POST http://192.168.44.128/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{"method":"ensemble"}'
```

**로그인:**
```bash
curl -X POST http://192.168.44.128/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user123","password":"securepassword"}'
```

---

## 버전 정보
- **작성일**: 2025-11-07
- **API 버전**: v1.0
- **최종 업데이트**: 2025-11-07 00:36
