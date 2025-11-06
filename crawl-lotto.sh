#!/bin/bash

# 로또 데이터 크롤링 스크립트
# 사용법:
#   ./crawl-lotto.sh              # 최신 회차 1개 크롤링
#   ./crawl-lotto.sh 1196         # 특정 회차 크롤링
#   ./crawl-lotto.sh 1180 1196    # 범위 크롤링 (시작 끝)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "======================================"
echo "  로또 번호 크롤링 시작"
echo "======================================"

if [ $# -eq 0 ]; then
    # 인자 없음: 최신 회차 1개 크롤링
    echo "최신 회차 크롤링 중..."
    sudo docker exec -i data-collector-service python3 << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/app')

from app.database import Database
from app.real_crawler import RealLottoCrawler
import os

db = Database(
    host=os.getenv('MYSQL_HOST', 'host.docker.internal'),
    user=os.getenv('MYSQL_USER', 'lotto_user'),
    password=os.getenv('MYSQL_PASSWORD', '2323'),
    database=os.getenv('MYSQL_DATABASE', 'lotto_db')
)

crawler = RealLottoCrawler(db)
latest = crawler.get_latest_round()
print(f"\n최신 회차: {latest}회")

result = crawler.crawl_round(latest)
if result:
    print(f"✓ 성공: {result['numbers']} + 보너스 {result['bonus']}")
else:
    print("✗ 실패")
PYTHON_SCRIPT

elif [ $# -eq 1 ]; then
    # 인자 1개: 특정 회차 크롤링
    ROUND=$1
    echo "${ROUND}회 크롤링 중..."
    sudo docker exec -i data-collector-service python3 << PYTHON_SCRIPT
import sys
sys.path.insert(0, '/app')

from app.database import Database
from app.real_crawler import RealLottoCrawler
import os

db = Database(
    host=os.getenv('MYSQL_HOST', 'host.docker.internal'),
    user=os.getenv('MYSQL_USER', 'lotto_user'),
    password=os.getenv('MYSQL_PASSWORD', '2323'),
    database=os.getenv('MYSQL_DATABASE', 'lotto_db')
)

crawler = RealLottoCrawler(db)
result = crawler.crawl_round($ROUND)
if result:
    print(f"✓ {$ROUND}회 성공: {result['numbers']} + 보너스 {result['bonus']}")
else:
    print(f"✗ {$ROUND}회 실패")
PYTHON_SCRIPT

elif [ $# -eq 2 ]; then
    # 인자 2개: 범위 크롤링
    START=$1
    END=$2
    echo "${START}회 ~ ${END}회 크롤링 중..."
    echo "잠시만 기다려주세요... (1회당 약 1초 소요)"
    sudo docker exec -i data-collector-service python3 << PYTHON_SCRIPT
import sys
sys.path.insert(0, '/app')

from app.database import Database
from app.real_crawler import RealLottoCrawler
import os

db = Database(
    host=os.getenv('MYSQL_HOST', 'host.docker.internal'),
    user=os.getenv('MYSQL_USER', 'lotto_user'),
    password=os.getenv('MYSQL_PASSWORD', '2323'),
    database=os.getenv('MYSQL_DATABASE', 'lotto_db')
)

crawler = RealLottoCrawler(db)
result = crawler.crawl_multiple_rounds($START, $END)

print("")
print("=" * 60)
print(f"크롤링 완료!")
print(f"성공: {result['success_count']}개")
print(f"실패: {result['failed_count']}개")
if result['failed_rounds']:
    print(f"실패한 회차: {result['failed_rounds']}")
print("=" * 60)
PYTHON_SCRIPT

else
    echo "사용법:"
    echo "  ./crawl-lotto.sh              # 최신 회차 1개"
    echo "  ./crawl-lotto.sh 1196         # 특정 회차"
    echo "  ./crawl-lotto.sh 1180 1196    # 범위 크롤링"
    exit 1
fi

echo ""
echo "======================================"
echo "  크롤링 완료"
echo "======================================"
echo ""
echo "데이터 확인:"
echo "  mysql -u lotto_user -p2323 lotto_db -e 'SELECT COUNT(*) FROM lotto_numbers;'"
echo ""
