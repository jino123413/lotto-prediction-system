#!/bin/bash

# 🎓 로또 예측 시스템 - Docker Hub 업로드 스크립트
# 과제 제출용

echo "⚠️  주의: Docker Hub USERNAME을 입력하세요 (이메일 X)"
echo "    예: jinho2, johndoe 등"
echo "    확인: https://hub.docker.com/settings/general"
echo ""
read -p "Docker Hub Username을 입력하세요: " DOCKER_ID

if [ -z "$DOCKER_ID" ]; then
  echo "❌ Docker Hub username을 입력해주세요!"
  exit 1
fi

# username 유효성 검사 (이메일 형식 차단)
if [[ "$DOCKER_ID" == *"@"* ]] || [[ "$DOCKER_ID" == *"."* ]]; then
  echo "❌ 이메일이 아닌 Docker Hub USERNAME을 입력하세요!"
  echo "   예: jinho2"
  echo "   https://hub.docker.com에서 프로필 확인"
  exit 1
fi

echo "=================================="
echo "🎰 로또 예측 시스템 Docker Hub 업로드"
echo "Docker Hub ID: $DOCKER_ID"
echo "=================================="
echo ""

# 1. Docker Hub 로그인
echo "🔐 Step 1: Docker Hub 로그인..."
docker login
if [ $? -ne 0 ]; then
  echo "❌ 로그인 실패!"
  exit 1
fi
echo "✅ 로그인 성공!"
echo ""

# 2. 이미지 태그 지정
echo "🏷️  Step 2: 이미지 태그 지정 중..."

echo "  - Frontend 태그 지정..."
docker tag lotto-prediction-system_frontend-app:latest ${DOCKER_ID}/lotto-frontend:latest

echo "  - API Gateway 태그 지정..."
docker tag lotto-prediction-system_api-gateway:latest ${DOCKER_ID}/lotto-api-gateway:latest

echo "  - Data Collector 태그 지정..."
docker tag lotto-prediction-system_data-collector-service:latest ${DOCKER_ID}/lotto-data-collector:latest

echo "  - Statistics 태그 지정..."
docker tag lotto-prediction-system_statistics-service:latest ${DOCKER_ID}/lotto-statistics:latest

echo "  - ML Prediction 태그 지정..."
docker tag lotto-prediction-system_ml-prediction-service:latest ${DOCKER_ID}/lotto-ml-prediction:latest

echo "  - User Service 태그 지정..."
docker tag lotto-prediction-system_user-service:latest ${DOCKER_ID}/lotto-user-service:latest

echo "✅ 모든 태그 지정 완료!"
echo ""

# 3. Docker Hub에 푸시
echo "📤 Step 3: Docker Hub에 푸시 중..."
echo "  ⏳ 이 작업은 몇 분 소요될 수 있습니다..."
echo ""

echo "  [1/6] Frontend 푸시 중..."
docker push ${DOCKER_ID}/lotto-frontend:latest

echo "  [2/6] API Gateway 푸시 중..."
docker push ${DOCKER_ID}/lotto-api-gateway:latest

echo "  [3/6] Data Collector 푸시 중..."
docker push ${DOCKER_ID}/lotto-data-collector:latest

echo "  [4/6] Statistics 푸시 중..."
docker push ${DOCKER_ID}/lotto-statistics:latest

echo "  [5/6] ML Prediction 푸시 중..."
docker push ${DOCKER_ID}/lotto-ml-prediction:latest

echo "  [6/6] User Service 푸시 중..."
docker push ${DOCKER_ID}/lotto-user-service:latest

echo ""
echo "=================================="
echo "🎉 모든 이미지 푸시 완료!"
echo "=================================="
echo ""
echo "📦 업로드된 이미지:"
echo "  1. ${DOCKER_ID}/lotto-frontend:latest"
echo "  2. ${DOCKER_ID}/lotto-api-gateway:latest"
echo "  3. ${DOCKER_ID}/lotto-data-collector:latest"
echo "  4. ${DOCKER_ID}/lotto-statistics:latest"
echo "  5. ${DOCKER_ID}/lotto-ml-prediction:latest"
echo "  6. ${DOCKER_ID}/lotto-user-service:latest"
echo ""
echo "🔗 Docker Hub 주소:"
echo "   https://hub.docker.com/u/${DOCKER_ID}"
echo ""
echo "📋 과제 제출 시 포함할 정보:"
echo "   - Docker Hub ID: ${DOCKER_ID}"
echo "   - 저장소: lotto-frontend, lotto-api-gateway, etc."
echo "   - 태그: latest"
echo ""
