#!/bin/bash
# 크롤링 진행 상황 모니터링

echo "🔍 크롤링 진행 상황 모니터링"
echo "======================================"

while true; do
    # 현재 수집된 데이터 개수
    COUNT=$(mysql -u lotto_user -p2323 lotto_db -se "SELECT COUNT(*) FROM lotto_numbers;" 2>/dev/null)
    
    # 최근 수집된 회차
    LATEST=$(mysql -u lotto_user -p2323 lotto_db -se "SELECT MAX(round) FROM lotto_numbers;" 2>/dev/null)
    
    # 프로세스 확인
    if ps aux | grep -q "[b]ulk_crawl.py"; then
        STATUS="🟢 실행 중"
    else
        STATUS="🔴 중지됨"
        echo ""
        echo "✅ 크롤링 완료!"
        echo "최종 수집: ${COUNT}개 (최신: ${LATEST}회)"
        break
    fi
    
    # 진행률 계산 (목표 500개 기준)
    PROGRESS=$((COUNT * 100 / 500))
    
    # 출력
    clear
    echo "🔍 크롤링 진행 상황 모니터링"
    echo "======================================"
    echo "상태: ${STATUS}"
    echo "수집된 데이터: ${COUNT}개 / 500개"
    echo "진행률: ${PROGRESS}%"
    echo "최신 회차: ${LATEST}회"
    echo "======================================"
    echo ""
    echo "⏳ 10초마다 자동 갱신 중..."
    echo "   (Ctrl+C로 종료)"
    
    sleep 10
done
