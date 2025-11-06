# 🎰 로또 예측 시스템

**통계 및 머신러닝을 활용한 로또 번호 추첨 예측 시스템 (프로덕션 완성)**

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](http://192.168.44.128)
[![Version](https://img.shields.io/badge/Version-v1.7.9-blue)](#)
[![Docker](https://img.shields.io/badge/Docker-9%20Containers-2496ED)](#)

## 📋 프로젝트 개요

- **아키텍처**: 마이크로서비스 아키텍처 (MSA) + API Gateway 패턴
- **배포 방식**: Docker Compose 기반 컨테이너화
- **프로덕션 URL**: http://192.168.44.128
- **관리 페이지**: http://192.168.44.128:81
- **프로젝트 완성도**: ✅ 100% (Phase 7.9 완료)

## 🏗️ 시스템 구성

### ✅ 9개 컨테이너 (모두 정상 작동 중)

1. **Nginx Proxy Manager** ⭐ - 포트 80, 81, 443 (웹 GUI 관리)
2. **React Frontend** (Nginx 기반) - 포트 80 (프로덕션 빌드)
3. **API Gateway** (Node.js/Express) - 포트 8000
4. **Data Collector Service** (Python/Flask) - 포트 8001 (판매점 크롤러 포함)
5. **Statistics Service** (Python/Flask) - 포트 8002
6. **ML Prediction Service** (Python/Flask) - 포트 8003
7. **User Service** (Spring Boot 3.1.5) - 포트 8004 (JWT 인증)
8. **Redis** (세션 & 캐싱) - 포트 6379
9. **MySQL 8.0** (Docker) - 포트 3306

### 📊 수집 데이터
- **로또 번호**: 1,196개 회차 (1회 ~ 1196회)
- **판매점**: 1,364개 (17개 지역)
- **통계**: 지역별 1등 배출 현황

## 🚀 빠른 시작

### 사전 요구사항

- Docker 및 Docker Compose 설치
- 최소 4GB RAM
- 10GB 이상의 여유 디스크 공간

### 실행 방법

```bash
# 1. 프로젝트 디렉토리로 이동
cd lotto-prediction-system

# 2. 환경 변수 확인 및 수정 (.env 파일)
# 필요시 데이터베이스 비밀번호 등 수정

# 3. Docker Compose로 전체 시스템 실행
docker-compose up -d

# 4. 로그 확인
docker-compose logs -f

# 5. 중지
docker-compose down
```

### 개별 서비스 빌드

```bash
# API Gateway
cd api-gateway
npm install
npm start

# Data Collector
cd services/data-collector
pip install -r requirements.txt
python -m app.main

# Statistics Service
cd services/statistics
pip install -r requirements.txt
python -m app.main

# ML Prediction Service
cd services/ml-prediction
pip install -r requirements.txt
python -m app.main

# User Service (Spring Boot)
cd services/user-service
mvn clean package
java -jar target/*.jar
```

## 🎯 주요 기능

### 1. 프론트엔드 (9개 페이지)
- **홈**: AI 예측 및 최신 당첨번호
- **통계 분석**: 빈도, 패턴, 추이 차트
- **번호 분석**: 1-45번 상세 분석
- **당첨 확인**: 보유 번호 당첨 여부 확인
- **예측 이력**: 서버 연동 예측 기록
- **로그인/회원가입**: JWT 인증
- **판매점 순위**: 상위 3개 지역 표시 ⭐
- **지도 시각화**: 인터랙티브 한국 지도 (호버 툴팁, 색상 매핑) ⭐⭐⭐

### 2. 데이터 수집
- 동행복권 로또 번호 실시간 크롤링
- 판매점 정보 크롤링 (264개 판매점)
- 자동 데이터 업데이트
- 안정적인 재시도 로직 (타임아웃 30초, 3회 재시도)

### 3. 통계 분석
- 빈도 분석 (Hot/Cold Numbers)
- 패턴 분석 (홀짝 비율, 연속 번호, 범위 분포)
- 추이 분석 (최근 vs 전체)
- 히트맵 시각화
- Redis 캐싱 (성능 최적화)

### 4. ML 예측 (5가지 방식)
- Random Forest 모델
- XGBoost 모델
- 앙상블 예측
- 통계 기반 예측
- 5가지 조합 예측
- 신뢰도 점수 제공

### 5. 사용자 관리
- JWT 토큰 기반 인증 (256bit 시크릿)
- 예측 이력 서버 저장
- bcrypt 비밀번호 해싱
- Redis 세션 관리

### 6. 판매점 시각화 ⭐ NEW
- 지역별 1등 배출 현황
- 인터랙티브 한국 지도
- 호버 시 툴팁 (지역명, 배출 횟수, 판매점 수)
- 10단계 색상 그라데이션
- 클릭/호버 이벤트 연동

## 🌐 API 엔드포인트

### Base URL
- **프로덕션**: `http://192.168.44.128/api`
- **개발**: `http://localhost:8000/api`

### 데이터 수집 (Data Collector)
- `POST /api/data/lotto/crawl` - 로또 번호 크롤링
- `GET /api/data/lotto/latest` - 최신 당첨 번호
- `GET /api/data/lotto/{draw_no}` - 특정 회차 조회
- `GET /api/data/stores/stats/region` - 판매점 지역별 통계 ⭐
- `GET /api/data/stores/top` - 판매점 TOP 100 ⭐

### 통계 분석 (Statistics)
- `GET /api/stats/frequency` - 빈도 분석
- `GET /api/stats/patterns` - 패턴 분석
- `GET /api/stats/statistics` - 통계 지표
- `GET /api/stats/trends` - 추이 분석
- `GET /api/stats/heatmap` - 히트맵

### ML 예측 (ML Prediction)
- `POST /api/predict/predict` - 단일 예측
- `POST /api/predict/predict-multiple` - 5가지 조합 예측
- `GET /api/predict/model-info` - 모델 정보

### 사용자 관리 (User Service)
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/user/profile` - 프로필 조회
- `POST /api/user/history` - 예측 이력 저장

> 자세한 API 문서는 [API_DOCUMENTATION.md](API_DOCUMENTATION.md) 참고

## 📁 프로젝트 구조

```
lotto-prediction-system/
├── docker-compose.yml          # Docker Compose 설정 (9개 컨테이너)
├── .env                        # 환경 변수
├── .gitignore                 # Git 제외 파일
├── README.md                  # 프로젝트 소개
├── DEVELOPMENT_PLAN.md        # 개발 계획서 (Phase 7.9 완료)
├── API_DOCUMENTATION.md       # API 문서
├── CONTAINER_ARCHITECTURE.md  # 컨테이너 구조
├── GETTING_STARTED.md         # 시작 가이드
├── SETUP_ENVIRONMENT.md       # 환경 설정
├── NETWORK_SETUP.md           # 네트워크 설정
├── DOCKER_HUB_GUIDE.md        # Docker Hub 업로드
├── frontend/                  # React 프론트엔드 (9개 페이지)
│   ├── Dockerfile             # 프로덕션 빌드
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── pages/             # 9개 페이지
│       │   ├── Home.tsx
│       │   ├── Analysis.tsx
│       │   ├── NumberAnalysis.tsx
│       │   ├── CheckWinning.tsx
│       │   ├── PredictionHistory.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Stores.tsx       # 판매점 순위
│       │   └── StoreMap.tsx     # 지도 시각화
│       └── components/
├── api-gateway/               # API Gateway (Node.js)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── services/
│   ├── data-collector/        # 데이터 수집 (Python Flask)
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── app/
│   │       ├── main.py
│   │       ├── crawler.py
│   │       └── store_crawler.py  # 판매점 크롤러
│   ├── statistics/            # 통계 분석 (Python Flask)
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── app/
│   ├── ml-prediction/         # ML 예측 (Python Flask)
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── app/
│   │   └── models/            # ML 모델 저장
│   └── user-service/          # 사용자 관리 (Spring Boot)
│       ├── Dockerfile
│       ├── pom.xml
│       └── src/
└── database/
    └── init.sql               # DB 초기화 스크립트
```

## 🔧 개발 환경 설정

### 환경 변수 (.env)

```env
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=lotto_db
MYSQL_USER=lotto_user
MYSQL_PASSWORD=lotto_password123
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 데이터베이스

MySQL 8.0을 사용하며, 초기 스키마는 `database/init.sql`에 정의되어 있습니다.

주요 테이블:
- `users` - 사용자 정보
- `lotto_numbers` - 당첨 번호
- `prediction_history` - 예측 이력
- `favorite_numbers` - 선호 번호
- `user_analysis` - 사용자 통계

## ✅ 완료된 작업

### Phase 7.9 완료 (100%)
- ✅ 9개 컨테이너 모두 정상 작동
- ✅ 프론트엔드 9개 페이지 완성
- ✅ 백엔드 마이크로서비스 100% 완성
- ✅ 1,196개 회차 데이터 수집
- ✅ 1,369개 판매점 데이터 수집
- ✅ AI 기반 5가지 예측 방식 구현
- ✅ JWT 인증 시스템 구현
- ✅ Nginx Proxy Manager 설치
- ✅ 인터랙티브 지도 시각화
- ✅ 프로덕션 배포 완료



## 📖 문서

- [시작 가이드](GETTING_STARTED.md)
- [개발 계획서](DEVELOPMENT_PLAN.md)
- [API 문서](API_DOCUMENTATION.md)
- [컨테이너 아키텍처](CONTAINER_ARCHITECTURE.md)
- [환경 설정](SETUP_ENVIRONMENT.md)
- [NPM 설정](NGINX_PROXY_MANAGER_SETUP.md)
- [크롤링 가이드](CRAWLING_GUIDE.md)

## ⚠️ 주의사항

1. **프로덕션 배포 완료**: 현재 시스템은 즉시 사용 가능한 프로덕션 환경입니다.

2. **크롤링 정책**: 동행복권 사이트의 robots.txt와 이용약관을 준수하세요.

3. **모델 정확도**: ML 모델의 예측은 참고용이며, 실제 당첨을 보장하지 않습니다.

4. **데이터 백업**: MySQL 볼륨은 docker-compose down 시에도 유지됩니다.

## 🎉 주요 성과

- ✅ **9개 컨테이너 프로덕션 환경 100% 완성**
- ✅ **프론트엔드 9개 페이지 완성**
- ✅ **인터랙티브 지도 시각화 완성**
- ✅ **1,196개 회차 + 264개 판매점 데이터**
- ✅ **AI 기반 5가지 예측 방식**
- ✅ **JWT 인증 및 사용자 관리**
- ✅ **Redis 캐싱 성능 최적화**

## 🛠️ 기술 스택

**Frontend**
- React 18, TypeScript, Vite 7.2
- TailwindCSS v4
- Recharts, react-simple-south-korea-map-chart

**Backend**
- Python (Flask 3.0)
- Node.js 20 (Express)
- Spring Boot 3.1.5 (Java 17)

**Database**
- MySQL 8.0 (Docker)
- Redis 7 (Docker)

**ML**
- scikit-learn, XGBoost

**Infrastructure**
- Docker, Docker Compose
- Nginx Proxy Manager

## 📝 라이선스

이 프로젝트는 교육 목적으로 작성되었습니다.

## 📅 버전 정보

- **현재 버전**: v1.7.9
- **최종 업데이트**: 2025-11-07
- **프로젝트 상태**: ✅ 프로덕션 완성
- **작성자**: AI Assistant + User
