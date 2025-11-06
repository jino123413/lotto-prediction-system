#!/bin/bash

# 로또 예측 시스템 시작 스크립트

echo "========================================="
echo "로또 예측 시스템 시작"
echo "========================================="
echo ""

# Docker 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    echo "   https://docs.docker.com/get-docker/ 에서 설치하세요."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다."
    echo "   https://docs.docker.com/compose/install/ 에서 설치하세요."
    exit 1
fi

echo "✅ Docker 및 Docker Compose 확인 완료"
echo ""

# 환경 변수 파일 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다."
    exit 1
fi

echo "✅ 환경 변수 파일 확인 완료"
echo ""

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리 중..."
docker-compose down 2>/dev/null
echo ""

# 컨테이너 빌드 및 시작
echo "🚀 서비스 시작 중..."
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ 모든 서비스가 시작되었습니다!"
    echo "========================================="
    echo ""
    echo "📊 서비스 URL:"
    echo "  - Nginx:              http://localhost"
    echo "  - Frontend:           http://localhost:3000"
    echo "  - API Gateway:        http://localhost:8000"
    echo "  - Data Collector:     http://localhost:8001"
    echo "  - Statistics:         http://localhost:8002"
    echo "  - ML Prediction:      http://localhost:8003"
    echo "  - User Service:       http://localhost:8004"
    echo ""
    echo "💾 데이터베이스:"
    echo "  - MySQL:              localhost:3306"
    echo "  - Redis:              localhost:6379"
    echo ""
    echo "📝 유용한 명령어:"
    echo "  - 로그 확인:          docker-compose logs -f"
    echo "  - 상태 확인:          docker-compose ps"
    echo "  - 서비스 중지:        docker-compose down"
    echo "  - 서비스 재시작:      docker-compose restart"
    echo ""
    echo "🧪 API 테스트:"
    echo "  curl http://localhost:8001/latest"
    echo "  curl http://localhost:8002/frequency"
    echo "  curl -X POST http://localhost:8003/predict -H 'Content-Type: application/json' -d '{\"method\":\"ensemble\"}'"
    echo ""
    echo "========================================="
else
    echo ""
    echo "❌ 서비스 시작 실패"
    echo "   로그를 확인하세요: docker-compose logs"
    exit 1
fi
