#!/bin/bash

# 로또 예측 시스템 중지 스크립트

echo "========================================="
echo "로또 예측 시스템 중지"
echo "========================================="
echo ""

echo "🛑 서비스 중지 중..."
docker-compose down

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 모든 서비스가 중지되었습니다."
    echo ""
    echo "💡 완전히 삭제하려면 (데이터 포함):"
    echo "   docker-compose down -v"
else
    echo ""
    echo "❌ 서비스 중지 실패"
    exit 1
fi
