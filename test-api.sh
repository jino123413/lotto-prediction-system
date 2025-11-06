#!/bin/bash

echo "========================================="
echo "로또 예측 시스템 API 테스트"
echo "========================================="
echo ""

# 색상 코드
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 테스트 함수
test_api() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" "$url" 2>/dev/null)
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✓ OK (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL (HTTP $response)${NC}"
        return 1
    fi
}

echo "📊 헬스 체크"
echo "-------------------"
test_api "API Gateway" "http://localhost:8000/health"
test_api "Data Collector" "http://localhost:8001/health"
test_api "Statistics" "http://localhost:8002/health"
test_api "ML Prediction" "http://localhost:8003/health"

echo ""
echo "📈 데이터 API 테스트"
echo "-------------------"
test_api "최신 번호 조회" "http://localhost:8001/latest"
test_api "회차 개수" "http://localhost:8001/stats/count"

echo ""
echo "📊 통계 API 테스트"
echo "-------------------"
test_api "빈도 분석" "http://localhost:8002/frequency"
test_api "패턴 분석" "http://localhost:8002/patterns"
test_api "통계 지표" "http://localhost:8002/statistics"

echo ""
echo "🤖 ML API 테스트"
echo "-------------------"
test_api "모델 정보" "http://localhost:8003/model-info"

echo ""
echo "========================================="
echo "테스트 완료"
echo "========================================="
echo ""
echo "💡 상세 응답 확인:"
echo "  curl http://localhost:8001/latest | jq"
echo "  curl http://localhost:8002/frequency | jq"
echo "  curl -X POST http://localhost:8003/predict -H 'Content-Type: application/json' -d '{\"method\":\"ensemble\"}' | jq"
