# 개발 환경 설정 가이드

로또 예측 시스템 개발을 위한 환경 설정 방법입니다.

## 현재 상황

시스템에 다음 도구들이 필요합니다:
- ✅ Python 3 (설치됨)
- ❌ pip3 (Python 패키지 관리자)
- ❌ Docker (컨테이너 실행)
- ❌ Docker Compose (다중 컨테이너 관리)

## 선택지

### 옵션 1: Docker로 실행 (추천 - 프로덕션 환경)

가장 간단하고 안전한 방법입니다.

```bash
# Docker 설치
sudo apt update
sudo apt install -y docker.io docker-compose

# 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 재로그인 후 실행
cd /home/jh/lotto-prediction-system
docker-compose up -d
```

### 옵션 2: 로컬 개발 환경 (개발/테스트용)

각 서비스를 로컬에서 직접 실행합니다.

#### 2.1 Python 개발 도구 설치

```bash
# pip3 설치
sudo apt update
sudo apt install -y python3-pip python3-venv

# 가상환경 생성
cd /home/jh/lotto-prediction-system/services/data-collector
python3 -m venv venv
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt

# 크롤러 테스트
python test_crawler.py
```

#### 2.2 Node.js 설치 (API Gateway용)

```bash
# Node.js 18 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# API Gateway 실행
cd /home/jh/lotto-prediction-system/api-gateway
npm install
npm start
```

#### 2.3 MySQL 설치 (로컬 데이터베이스)

```bash
# MySQL 설치
sudo apt install -y mysql-server

# MySQL 시작
sudo systemctl start mysql

# 데이터베이스 생성
sudo mysql < /home/jh/lotto-prediction-system/database/init.sql
```

#### 2.4 Redis 설치 (캐시 서버)

```bash
# Redis 설치
sudo apt install -y redis-server

# Redis 시작
sudo systemctl start redis-server
```

### 옵션 3: 크롤러만 먼저 테스트 (최소 설치)

데이터베이스 없이 크롤러 기능만 테스트합니다.

```bash
# 필요한 패키지만 설치
sudo apt install -y python3-pip
pip3 install requests beautifulsoup4 lxml --user

# 크롤러 테스트
cd /home/jh/lotto-prediction-system/services/data-collector
python3 test_crawler.py
```

## 추천 순서

### 초보자 / 빠른 시작
```bash
# Docker 한 번에 설치 및 실행
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
# 로그아웃 후 재로그인
cd /home/jh/lotto-prediction-system
docker-compose up -d
```

### 개발자 / 커스터마이징
```bash
# 로컬 개발 환경 구축
sudo apt update
sudo apt install -y python3-pip python3-venv nodejs npm mysql-server redis-server

# 각 서비스 개별 실행
cd services/data-collector
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.main
```

## 실행 확인

### Docker 사용 시
```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f

# API 테스트
curl http://localhost:8001/health
```

### 로컬 개발 환경 사용 시
```bash
# 각 서비스를 별도 터미널에서 실행
# Terminal 1: Data Collector
cd services/data-collector
source venv/bin/activate
python -m app.main

# Terminal 2: Statistics
cd services/statistics
source venv/bin/activate
python -m app.main

# Terminal 3: ML Prediction
cd services/ml-prediction
source venv/bin/activate
python -m app.main

# Terminal 4: API Gateway
cd api-gateway
npm start
```

## 다음 단계

환경이 설정되면:

1. **크롤러 테스트**
   ```bash
   cd services/data-collector
   python3 test_crawler.py
   ```

2. **데이터 수집**
   ```bash
   # 최신 회차 수집
   curl -X POST http://localhost:8001/collect
   
   # 데이터 확인
   curl http://localhost:8001/latest
   ```

3. **통계 분석**
   ```bash
   curl http://localhost:8002/frequency
   ```

4. **AI 예측**
   ```bash
   curl -X POST http://localhost:8003/predict \
     -H "Content-Type: application/json" \
     -d '{"method":"ensemble"}'
   ```

## 문제 해결

### 포트 충돌
```bash
# 사용 중인 포트 확인
sudo netstat -tulpn | grep :8001

# 프로세스 종료
sudo kill -9 <PID>
```

### 권한 오류
```bash
# Docker 권한
sudo usermod -aG docker $USER

# 파일 권한
chmod +x start.sh stop.sh test-api.sh
```

## 지금 바로 시작

가장 쉬운 방법:

```bash
# 한 줄로 설치
sudo apt update && sudo apt install -y docker.io docker-compose python3-pip

# Docker 그룹 추가
sudo usermod -aG docker $USER

# 재로그인 필요 (또는 newgrp docker)

# 시스템 시작
cd /home/jh/lotto-prediction-system
docker-compose up -d
```

어떤 방법을 선택하시겠습니까?
