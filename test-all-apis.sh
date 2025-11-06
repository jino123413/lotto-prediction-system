#!/bin/bash

echo "========================================="
echo "로또 예측 시스템 - 전체 API 테스트"
echo "========================================="
echo ""

# 색상
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

test_api() {
    local name=$1
    local method=${2:-GET}
    local url=$3
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$url")
    else
        response=$(curl -s -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    if echo "$response" | grep -q '"success": *true'; then
        echo -e "${GREEN}✓ 성공${NC}"
        return 0
    else
        echo -e "${RED}✗ 실패${NC}"
        echo "Response: $response"
        return 1
    fi
}

echo "📊 1. 데이터 수집 서비스 (포트 8001)"
echo "-----------------------------------"
test_api "헬스 체크" GET "http://localhost:8001/health"
test_api "최신 번호 조회" GET "http://localhost:8001/latest"
test_api "회차 개수" GET "http://localhost:8001/stats/count"

echo ""
echo "📈 2. 통계 분석 서비스 (포트 8002)"
echo "-----------------------------------"
test_api "헬스 체크" GET "http://localhost:8002/health"
test_api "빈도 분석" GET "http://localhost:8002/frequency"
test_api "패턴 분석" GET "http://localhost:8002/patterns"
test_api "통계 지표" GET "http://localhost:8002/statistics"
test_api "히트맵" GET "http://localhost:8002/heatmap"

echo ""
echo "🤖 3. ML 예측 서비스 (포트 8003)"
echo "-----------------------------------"
test_api "헬스 체크" GET "http://localhost:8003/health"
test_api "모델 정보" GET "http://localhost:8003/model-info"
test_api "단일 예측" POST "http://localhost:8003/predict" '{"method":"ensemble"}'
test_api "5가지 조합 예측" POST "http://localhost:8003/predict-multiple" '{}'

echo ""
echo "🌐 4. API Gateway (포트 8000)"
echo "-----------------------------------"
test_api "헬스 체크" GET "http://localhost:8000/health"
test_api "데이터 조회 (프록시)" GET "http://localhost:8000/api/data/latest"
test_api "통계 분석 (프록시)" GET "http://localhost:8000/api/stats/frequency"

echo ""
echo "========================================="
echo "테스트 완료!"
echo "========================================="
echo ""
echo "💡 상세 응답 확인:"
echo "  curl http://localhost:8001/latest | jq"
echo "  curl http://localhost:8002/frequency | jq"
echo "  curl -X POST http://localhost:8003/predict-multiple -H 'Content-Type: application/json' | jq"
echo ""
echo "📊 서비스 상태:"
echo "  sudo docker-compose -f docker-compose-simple.yml ps"
echo ""
echo "📝 로그 확인:"
echo "  sudo docker-compose -f docker-compose-simple.yml logs -f [service-name]"
