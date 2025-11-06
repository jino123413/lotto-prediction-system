# Docker Hub 업로드 가이드

## 📦 Docker Hub 배포 정보

### Docker Hub 계정
- **아이디**: `YOUR_DOCKERHUB_ID` (본인의 Docker Hub 아이디로 변경)
- **저장소**: `lotto-prediction-system`

### 🔍 업로드 대상 (6개 커스텀 이미지)

**업로드 필요 (직접 빌드한 이미지):**
1. ✅ frontend-app (React + Nginx)
2. ✅ api-gateway (Node.js + Express)
3. ✅ data-collector-service (Python + Flask)
4. ✅ statistics-service (Python + Flask)
5. ✅ ml-prediction-service (Python + Flask)
6. ✅ user-service (Spring Boot)

**업로드 불필요 (공식 이미지 사용):**
- ❌ nginx-proxy-manager → `jc21/nginx-proxy-manager:latest`
- ❌ mysql-db → `mysql:8.0`
- ❌ redis-session → `redis:7-alpine`

> 💡 **이유**: 공식 이미지는 이미 Docker Hub에 있으므로 별도로 업로드할 필요가 없습니다.

---

## 🚀 1단계: Docker Hub 로그인

```bash
docker login
```

아이디와 비밀번호 입력

---

## 🏷️ 2단계: 이미지 태그 지정

```bash
# Docker Hub 아이디를 변수로 설정 (본인 아이디로 변경)
DOCKER_ID="YOUR_DOCKERHUB_ID"

# 커스텀 이미지만 태그 지정 (6개)
docker tag lotto-prediction-system_frontend-app:latest ${DOCKER_ID}/lotto-frontend:latest
docker tag lotto-prediction-system_api-gateway:latest ${DOCKER_ID}/lotto-api-gateway:latest
docker tag lotto-prediction-system_data-collector-service:latest ${DOCKER_ID}/lotto-data-collector:latest
docker tag lotto-prediction-system_statistics-service:latest ${DOCKER_ID}/lotto-statistics:latest
docker tag lotto-prediction-system_ml-prediction-service:latest ${DOCKER_ID}/lotto-ml-prediction:latest
docker tag lotto-prediction-system_user-service:latest ${DOCKER_ID}/lotto-user-service:latest
```

---

## 📤 3단계: Docker Hub에 푸시

```bash
# 커스텀 이미지만 푸시 (6개)
docker push ${DOCKER_ID}/lotto-frontend:latest
docker push ${DOCKER_ID}/lotto-api-gateway:latest
docker push ${DOCKER_ID}/lotto-data-collector:latest
docker push ${DOCKER_ID}/lotto-statistics:latest
docker push ${DOCKER_ID}/lotto-ml-prediction:latest
docker push ${DOCKER_ID}/lotto-user-service:latest
```

---

## 🔄 4단계: 한 번에 실행 (스크립트)

`docker-push.sh` 파일 생성:

```bash
#!/bin/bash

# Docker Hub 아이디 설정 (본인 아이디로 변경 필수!)
read -p "Docker Hub Username을 입력하세요: " DOCKER_ID

echo "🔐 Docker Hub 로그인..."
docker login

echo "🏷️  커스텀 이미지 태그 지정 중... (6개)"
docker tag lotto-prediction-system_frontend-app:latest ${DOCKER_ID}/lotto-frontend:latest
docker tag lotto-prediction-system_api-gateway:latest ${DOCKER_ID}/lotto-api-gateway:latest
docker tag lotto-prediction-system_data-collector-service:latest ${DOCKER_ID}/lotto-data-collector:latest
docker tag lotto-prediction-system_statistics-service:latest ${DOCKER_ID}/lotto-statistics:latest
docker tag lotto-prediction-system_ml-prediction-service:latest ${DOCKER_ID}/lotto-ml-prediction:latest
docker tag lotto-prediction-system_user-service:latest ${DOCKER_ID}/lotto-user-service:latest

echo "📤 Docker Hub에 푸시 중... (6개)"
docker push ${DOCKER_ID}/lotto-frontend:latest
docker push ${DOCKER_ID}/lotto-api-gateway:latest
docker push ${DOCKER_ID}/lotto-data-collector:latest
docker push ${DOCKER_ID}/lotto-statistics:latest
docker push ${DOCKER_ID}/lotto-ml-prediction:latest
docker push ${DOCKER_ID}/lotto-user-service:latest

echo "✅ 커스텀 이미지 푸시 완료! (6개)"
echo "🔗 Docker Hub: https://hub.docker.com/u/${DOCKER_ID}"
echo ""
echo "ℹ️  공식 이미지는 별도 푸시 불필요:"
echo "   - nginx-proxy-manager (jc21/nginx-proxy-manager:latest)"
echo "   - mysql (mysql:8.0)"
echo "   - redis (redis:7-alpine)"
```

실행:
```bash
chmod +x docker-push.sh
./docker-push.sh
```

---

## 📥 설치 가이드 (과제 제출용)

### Docker Hub에서 설치하기

```bash
# 1. 저장소 복제
git clone https://github.com/YOUR_USERNAME/lotto-prediction-system.git
cd lotto-prediction-system

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일 수정 (MySQL 비밀번호 등)

# 3. Docker Compose로 실행 (Docker Hub 이미지 사용)
docker-compose -f docker-compose-hub.yml up -d
```

### `docker-compose-hub.yml` 예시

```yaml
version: '3.8'

services:
  frontend-app:
    image: YOUR_DOCKERHUB_ID/lotto-frontend:latest
    ports:
      - "80:80"
    networks:
      - lotto-network

  api-gateway:
    image: YOUR_DOCKERHUB_ID/lotto-api-gateway:latest
    ports:
      - "8000:8000"
    networks:
      - lotto-network

  # ... 나머지 서비스들
```

---

## 🔗 Docker Hub 접속 주소

**형식**: `아이디/레파지토리:태그`

### 커스텀 이미지 (6개)
```
YOUR_DOCKERHUB_ID/lotto-frontend:latest
YOUR_DOCKERHUB_ID/lotto-api-gateway:latest
YOUR_DOCKERHUB_ID/lotto-data-collector:latest
YOUR_DOCKERHUB_ID/lotto-statistics:latest
YOUR_DOCKERHUB_ID/lotto-ml-prediction:latest
YOUR_DOCKERHUB_ID/lotto-user-service:latest
```

### 공식 이미지 (3개 - Docker Hub 푸시 불필요)
```
jc21/nginx-proxy-manager:latest
mysql:8.0
redis:7-alpine
```

---

## ✅ 확인 방법

### 1. Docker Hub에서 확인
```
https://hub.docker.com/u/YOUR_DOCKERHUB_ID
```

### 2. 로컬에서 테스트
```bash
# 기존 이미지 삭제
docker rmi ${DOCKER_ID}/lotto-frontend:latest

# Docker Hub에서 다운로드
docker pull ${DOCKER_ID}/lotto-frontend:latest

# 실행 확인
docker run -p 80:80 ${DOCKER_ID}/lotto-frontend:latest
```

---

## 📋 과제 제출 시 포함 내용

1. **Docker Hub 주소**
   - https://hub.docker.com/u/YOUR_DOCKERHUB_ID

2. **커스텀 이미지 목록 (6개)**
   ```
   YOUR_DOCKERHUB_ID/lotto-frontend:latest
   YOUR_DOCKERHUB_ID/lotto-api-gateway:latest
   YOUR_DOCKERHUB_ID/lotto-data-collector:latest
   YOUR_DOCKERHUB_ID/lotto-statistics:latest
   YOUR_DOCKERHUB_ID/lotto-ml-prediction:latest
   YOUR_DOCKERHUB_ID/lotto-user-service:latest
   ```

   **공식 이미지 (3개 - 별도 업로드 불필요)**
   ```
   jc21/nginx-proxy-manager:latest
   mysql:8.0
   redis:7-alpine
   ```

3. **설치 명령어**
   ```bash
   docker-compose -f docker-compose-hub.yml up -d
   ```

4. **접속 주소**
   ```
   http://localhost (또는 서버 IP)
   ```

---

**작성일**: 2025-11-07  
**버전**: 1.0
