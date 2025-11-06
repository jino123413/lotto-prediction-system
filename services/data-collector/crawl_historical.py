#!/usr/bin/env python3
"""
역사적 로또 판매점 데이터 수집 스크립트
Usage: python crawl_historical.py [start_round] [end_round]
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.store_crawler import StoreCrawler
from app.database import Database
import time
import argparse

def main():
    parser = argparse.ArgumentParser(description='로또 판매점 역사적 데이터 수집')
    parser.add_argument('--start', type=int, default=601, help='시작 회차 (기본: 601)')
    parser.add_argument('--end', type=int, default=None, help='종료 회차 (기본: 최신)')
    parser.add_argument('--batch-size', type=int, default=100, help='배치 크기 (기본: 100)')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("로또 판매점 역사적 데이터 수집")
    print("=" * 60)
    print(f"시작 회차: {args.start}")
    print(f"종료 회차: {args.end if args.end else '최신'}")
    print(f"배치 크기: {args.batch_size}")
    print()
    
    # DB 연결
    db = Database('mysql-db', 'lotto_user', '2323', 'lotto_db')
    sc = StoreCrawler(db)
    
    # 종료 회차 확인
    if not args.end:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = sc._get_latest_round(headers)
        args.end = response if response else 1196
        print(f"최신 회차: {args.end}")
    
    # 배치로 수집
    total_collected = 0
    total_saved = 0
    
    start = args.start
    while start <= args.end:
        batch_end = min(start + args.batch_size - 1, args.end)
        
        print(f"\n[{start}-{batch_end}회] 크롤링 중...")
        start_time = time.time()
        
        result = sc.crawl_historical_stores(start_round=start, end_round=batch_end)
        
        elapsed = time.time() - start_time
        
        if result.get('success'):
            count = result.get('count', 0)
            saved = result.get('saved', 0)
            total_collected += count
            total_saved += saved
            
            print(f"  ✓ 완료 ({elapsed:.1f}초)")
            print(f"  ✓ 수집: {count}개")
            print(f"  ✓ 저장: {saved}개")
        else:
            print(f"  ✗ 실패: {result.get('error', 'Unknown')}")
        
        start = batch_end + 1
        time.sleep(1)  # 다음 배치 전 잠시 대기
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("크롤링 완료!")
    print("=" * 60)
    print(f"총 수집 판매점: {total_collected}개")
    print(f"총 저장: {total_saved}개")
    
    # DB 확인
    cursor = db.connection.cursor()
    cursor.execute("SELECT COUNT(*), SUM(wins_1st) FROM lotto_stores")
    total_stores, total_wins = cursor.fetchone()
    
    print(f"\n[DB 현황]")
    print(f"  판매점: {total_stores}개")
    print(f"  총 1등: {total_wins}회")
    print()

if __name__ == '__main__':
    main()
