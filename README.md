# 로또 추첨 예측 시스템

통계 및 머신러닝을 활용한 로또 번호 추첨 예측 시스템입니다.

## 📋 프로젝트 개요

- **아키텍처**: 마이크로서비스 아키텍처 (MSA)
- **배포 방식**: Docker Compose 기반 컨테이너화
- **총 9개 컨테이너**: Nginx, Frontend, API Gateway, 4개의 백엔드 서비스, MySQL, Redis

## 🏗️ 시스템 구성

### 컨테이너 목록

1. **Nginx** (리버스 프록시) - 포트 80, 443
2. **React Frontend** - 포트 3000
3. **API Gateway** (Node.js) - 포트 8000
4. **Data Collector Service** (Python/Flask) - 포트 8001
5. **Statistics Service** (Python/Flask) - 포트 8002
6. **ML Prediction Service** (Python/Flask) - 포트 8003
7. **User Service** (Spring Boot) - 포트 8004
8. **Redis** (세션 관리) - 포트 6379
9. **MySQL** (데이터베이스) - 포트 3306

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

## 📊 주요 기능

### 1. 데이터 수집
- 동행복권 로또 번호 자동 크롤링
- 주 1회 자동 데이터 수집
- 수동 데이터 수집 API 제공

### 2. 통계 분석
- 빈도 분석 (Hot/Cold Numbers)
- 패턴 분석 (홀짝 비율, 연속 번호)
- 추이 분석 (최근 vs 전체)
- 히트맵 시각화

### 3. ML 예측
- Random Forest 모델
- XGBoost 모델
- 앙상블 예측
- 신뢰도 점수 제공

### 4. 사용자 관리
- JWT 토큰 기반 인증
- 예측 이력 저장
- 선호 번호 관리
- Redis 세션 관리

## 🌐 API 엔드포인트

### API Gateway (포트 8000)

#### 데이터 수집
- `POST /api/data/collect` - 수동 데이터 수집
- `GET /api/data/latest` - 최신 당첨 번호
- `GET /api/data/history` - 당첨 이력

#### 통계 분석
- `GET /api/stats/frequency` - 빈도 분석
- `GET /api/stats/patterns` - 패턴 분석
- `GET /api/stats/statistics` - 통계 지표
- `GET /api/stats/trends` - 추이 분석
- `GET /api/stats/heatmap` - 히트맵

#### ML 예측
- `POST /api/predict/predict` - 단일 예측
- `POST /api/predict/predict-multiple` - 5가지 조합 예측
- `GET /api/predict/model-info` - 모델 정보
- `POST /api/predict/train` - 모델 재학습

#### 사용자
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/user/profile` - 프로필 조회
- `GET /api/user/history` - 예측 이력

## 📁 프로젝트 구조

```
lotto-prediction-system/
├── docker-compose.yml          # Docker Compose 설정
├── .env                        # 환경 변수
├── .gitignore                 # Git 제외 파일
├── README.md                  # 이 파일
├── nginx/                     # Nginx 설정
│   ├── Dockerfile
│   └── nginx.conf
├── frontend/                  # React 프론트엔드
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── api-gateway/               # API Gateway
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── services/
│   ├── data-collector/        # 데이터 수집 서비스
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── app/
│   ├── statistics/            # 통계 분석 서비스
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── app/
│   ├── ml-prediction/         # ML 예측 서비스
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── app/
│   │   └── models/
│   └── user-service/          # 사용자 관리 서비스
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

## 🎯 다음 단계

### 필수 구현 사항

1. **Frontend 개발**
   - React 컴포넌트 구현
   - 차트 및 시각화
   - 반응형 디자인

2. **User Service 완성**
   - Spring Boot Controller/Service 구현
   - JWT 인증 로직
   - Security 설정

3. **ML 모델 학습**
   - 실제 데이터로 모델 학습
   - 모델 저장/로드 구현
   - 성능 평가

4. **테스트**
   - 단위 테스트
   - 통합 테스트
   - E2E 테스트

### 선택 구현 사항

- CI/CD 파이프라인
- 모니터링 (Prometheus, Grafana)
- 로깅 시스템 (ELK Stack)
- HTTPS 설정
- 부하 테스트

## ⚠️ 주의사항

1. **개발 환경용**: 현재 설정은 개발 환경용입니다. 프로덕션 배포 시 보안 설정을 강화하세요.

2. **크롤링 정책**: 동행복권 사이트의 robots.txt와 이용약관을 준수하세요.

3. **모델 정확도**: ML 모델의 예측은 참고용이며, 실제 당첨을 보장하지 않습니다.

4. **데이터 백업**: 중요한 데이터는 정기적으로 백업하세요.

## 📝 라이선스

이 프로젝트는 교육 목적으로 작성되었습니다.

## 👥 기여

버그 리포트 및 기능 제안은 Issues에 등록해주세요.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 Issues를 통해 연락주세요.
