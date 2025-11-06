# 시작하기 가이드

로또 예측 시스템을 처음 시작하는 분들을 위한 가이드입니다.

## 🎉 현재 상태: 프로덕션 100% 완성

- ✅ 9개 컨테이너 모두 정상 작동 중
- ✅ 프론트엔드 9개 페이지 완성
- ✅ AI 기반 5가지 예측 방식
- ✅ 지역별 판매점 지도 시각화
- ✅ 1,196개 회차 + 1,369개 판매점 데이터

## 1단계: 환경 확인

### 필수 소프트웨어
- Docker 20.10 이상
- Docker Compose 2.0 이상
- (선택) Node.js 18 이상 (개발 시)
- (선택) Python 3.11 이상 (개발 시)
- (선택) Java 17 이상 (개발 시)

### 설치 확인
```bash
docker --version
docker-compose --version
```

## 2단계: 프로젝트 설정

### 환경 변수 확인
`.env` 파일을 열어 설정을 확인하세요:

```env
# MySQL 설정 - 프로덕션에서는 반드시 변경하세요!
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=lotto_db
MYSQL_USER=lotto_user
MYSQL_PASSWORD=lotto_password123

# JWT 설정 - 반드시 변경하세요!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 3단계: 서비스 시작

### 전체 시스템 시작
```bash
# 프로젝트 디렉토리로 이동
cd /home/jh/lotto-prediction-system

# 백그라운드에서 모든 서비스 시작 (9개 컨테이너)
docker-compose up -d

# 로그 확인 (전체)
docker-compose logs -f

# 특정 서비스 로그만 확인
docker-compose logs -f data-collector-service
```

### 프로덕션 접속
```bash
# 프론트엔드
http://192.168.44.128

# API Gateway
http://192.168.44.128/api/

# Nginx Proxy Manager (관리 페이지)
http://192.168.44.128:81
```

### 서비스 상태 확인
```bash
# 실행 중인 컨테이너 확인 (9개)
docker-compose ps

# 헬스 체크
curl http://localhost:8000/health  # API Gateway
curl http://localhost:8001/health  # Data Collector
curl http://localhost:8002/health  # Statistics
curl http://localhost:8003/health  # ML Prediction
curl http://localhost:8004/health  # User Service

# 프론트엔드 확인
curl http://192.168.44.128
```

## 4단계: API 테스트

### 데이터 수집 테스트
```bash
# 최신 5회 당첨 번호 조회
curl http://192.168.44.128/api/data/latest

# 전체 회차 개수 확인
curl http://192.168.44.128/api/data/count

# 판매점 통계 (지역별) ⭐ NEW
curl http://192.168.44.128/api/data/stores/stats/region

# 판매점 TOP 100
curl http://192.168.44.128/api/data/stores/top
```

### 통계 분석 테스트
```bash
# 빈도 분석
curl http://192.168.44.128/api/stats/frequency

# 패턴 분석
curl http://192.168.44.128/api/stats/patterns

# 히트맵 데이터
curl http://192.168.44.128/api/stats/heatmap

# 전체 통계
curl http://192.168.44.128/api/stats/statistics
```

### ML 예측 테스트
```bash
# 5가지 조합 예측 (Random Forest, XGBoost, Ensemble, 통계 기반)
curl -X POST http://192.168.44.128/api/predict/predict-multiple \
  -H "Content-Type: application/json"

# 단일 예측 (Ensemble)
curl -X POST http://192.168.44.128/api/predict/predict \
  -H "Content-Type: application/json" \
  -d '{"method": "ensemble"}'

# 모델 정보
curl http://192.168.44.128/api/predict/model-info
```

### 사용자 인증 테스트 ⭐ NEW
```bash
# 회원가입
curl -X POST http://192.168.44.128/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test1234","email":"test@test.com"}'

# 로그인
curl -X POST http://192.168.44.128/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test1234"}'
```

## 5단계: 데이터베이스 확인

### MySQL 접속
```bash
# MySQL 컨테이너 접속
docker-compose exec mysql-db mysql -u lotto_user -p

# 비밀번호 입력: lotto_password123

# 데이터베이스 선택
USE lotto_db;

# 테이블 확인
SHOW TABLES;

# 데이터 조회
SELECT * FROM lotto_numbers ORDER BY round DESC LIMIT 5;
SELECT * FROM users;
```

### Redis 확인
```bash
# Redis 컨테이너 접속
docker-compose exec redis-session redis-cli

# 키 확인
KEYS *

# 종료
EXIT
```

## 6단계: 개발 모드

각 서비스를 개별적으로 개발하려면:

### Python 서비스 (Data Collector, Statistics, ML Prediction)
```bash
cd services/data-collector

# 가상환경 생성 (선택)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r requirements.txt

# 개발 서버 실행
python -m app.main
```

### Node.js 서비스 (API Gateway)
```bash
cd api-gateway

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

### Spring Boot 서비스 (User Service)
```bash
cd services/user-service

# Maven 빌드
mvn clean package

# 실행
java -jar target/*.jar

# 또는 Maven으로 직접 실행
mvn spring-boot:run
```

## 7단계: 문제 해결

### 포트 충돌
```bash
# 사용 중인 포트 확인
sudo netstat -tulpn | grep :8000
sudo netstat -tulpn | grep :3306

# 해당 프로세스 종료 또는 .env에서 포트 변경
```

### 컨테이너 재시작
```bash
# 모든 서비스 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart data-collector-service

# 컨테이너 완전히 재생성
docker-compose down
docker-compose up -d --build
```

### 로그 확인
```bash
# 실시간 로그
docker-compose logs -f [서비스명]

# 최근 100줄
docker-compose logs --tail=100 [서비스명]

# 특정 시간 이후 로그
docker-compose logs --since 2024-01-01T00:00:00
```

### 볼륨 초기화
```bash
# 주의: 모든 데이터가 삭제됩니다!
docker-compose down -v

# 다시 시작
docker-compose up -d
```

## 8단계: 프로덕션 배포 준비

### 보안 강화
1. `.env` 파일의 모든 비밀번호 변경
2. JWT_SECRET을 강력한 랜덤 문자열로 변경
3. HTTPS 설정 (Let's Encrypt)
4. 방화벽 설정

### 성능 최적화
1. Redis 메모리 증가
2. MySQL 연결 풀 설정
3. Nginx 캐싱 활성화
4. 서비스별 리소스 제한 설정

### 모니터링
1. 로그 수집 시스템 (ELK)
2. 메트릭 수집 (Prometheus)
3. 대시보드 (Grafana)
4. 알림 시스템

## ✅ 완료된 기능

1. ✅ **Frontend 개발**: 9개 페이지 완성
2. ✅ **User Service**: Spring Boot 3.1.5 + JWT 인증
3. ✅ **ML 모델**: 5가지 예측 방식 구현
4. ✅ **판매점 시각화**: 지도 기반 인터랙티브 UI
5. ✅ **프로덕션 배포**: Nginx Proxy Manager 설치



## 참고 자료

- [Docker 공식 문서](https://docs.docker.com/)
- [Flask 공식 문서](https://flask.palletsprojects.com/)
- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [React 공식 문서](https://react.dev/)

## 도움말

문제가 발생하면:
1. 로그를 먼저 확인하세요
2. GitHub Issues에 버그 리포트 작성
3. 커뮤니티 포럼에 질문

프로덕션 배포 완료! 🎉

**최종 업데이트**: 2025-11-07  
**프로젝트 상태**: ✅ 100% 완성 (Phase 7.9)
