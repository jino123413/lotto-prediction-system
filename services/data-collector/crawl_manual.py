#!/usr/bin/env python3
"""
수동 크롤링 스크립트 (Docker 없이 로컬에서 실행)

사용법:
    python3 crawl_manual.py                 # 최신 회차 1개
    python3 crawl_manual.py 1196            # 특정 회차
    python3 crawl_manual.py 1180 1196       # 범위 크롤링
"""

import sys
import os

# 현재 디렉토리를 path에 추가
sys.path.insert(0, os.path.dirname(__file__))

from app.database import Database
from app.real_crawler import RealLottoCrawler


def main():
    print("=" * 60)
    print("  로또 번호 크롤링 시작")
    print("=" * 60)
    
    # DB 연결
    db = Database(
        host='localhost',
        user='lotto_user',
        password='2323',
        database='lotto_db'
    )
    
    # 크롤러 생성
    crawler = RealLottoCrawler(db)
    
    # 인자에 따라 다른 동작
    if len(sys.argv) == 1:
        # 최신 회차 1개 크롤링
        print("\n최신 회차 크롤링 중...")
        latest = crawler.get_latest_round()
        print(f"최신 회차: {latest}회")
        
        result = crawler.crawl_round(latest)
        if result:
            print(f"✓ 성공: {result['numbers']} + 보너스 {result['bonus']}")
        else:
            print("✗ 실패")
            
    elif len(sys.argv) == 2:
        # 특정 회차 크롤링
        round_num = int(sys.argv[1])
        print(f"\n{round_num}회 크롤링 중...")
        
        result = crawler.crawl_round(round_num)
        if result:
            print(f"✓ {round_num}회 성공: {result['numbers']} + 보너스 {result['bonus']}")
        else:
            print(f"✗ {round_num}회 실패")
            
    elif len(sys.argv) == 3:
        # 범위 크롤링
        start = int(sys.argv[1])
        end = int(sys.argv[2])
        print(f"\n{start}회 ~ {end}회 크롤링 중...")
        print("잠시만 기다려주세요... (1회당 약 1초 소요)")
        
        result = crawler.crawl_multiple_rounds(start, end)
        
        print("\n" + "=" * 60)
        print("크롤링 완료!")
        print(f"성공: {result['success_count']}개")
        print(f"실패: {result['failed_count']}개")
        if result['failed_rounds']:
            print(f"실패한 회차: {result['failed_rounds']}")
        print("=" * 60)
        
    else:
        print("사용법:")
        print("  python3 crawl_manual.py              # 최신 회차 1개")
        print("  python3 crawl_manual.py 1196         # 특정 회차")
        print("  python3 crawl_manual.py 1180 1196    # 범위 크롤링")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("  크롤링 완료")
    print("=" * 60)
    print("\n데이터 확인:")
    print("  mysql -u lotto_user -p2323 lotto_db -e 'SELECT COUNT(*) FROM lotto_numbers;'")
    print()


if __name__ == '__main__':
    main()
