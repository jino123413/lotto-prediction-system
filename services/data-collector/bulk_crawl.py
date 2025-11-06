#!/usr/bin/env python3
"""
대량 크롤링 스크립트 - 1회부터 최신까지 일괄 수집
안전하게 100회씩 배치로 나눠서 수집
"""

import sys
import os
import time

# 현재 디렉토리를 path에 추가
sys.path.insert(0, os.path.dirname(__file__))

from app.database import Database
from app.real_crawler import RealLottoCrawler


def bulk_crawl(start_round=1, end_round=None, batch_size=100):
    """대량 크롤링 실행"""
    
    print("=" * 70)
    print("  🎰 로또 번호 대량 크롤링 시작")
    print("=" * 70)
    
    # DB 연결
    db = Database(
        host='localhost',
        user='lotto_user',
        password='2323',
        database='lotto_db'
    )
    
    # 크롤러 생성
    crawler = RealLottoCrawler(db)
    
    # 최신 회차 확인
    if not end_round:
        end_round = crawler.get_latest_round()
        print(f"\n📌 최신 회차: {end_round}회")
    
    total_rounds = end_round - start_round + 1
    print(f"📊 수집 범위: {start_round}회 ~ {end_round}회 (총 {total_rounds}개)")
    print(f"⚙️  배치 크기: {batch_size}회씩")
    print()
    
    # 전체 통계
    total_success = 0
    total_failed = 0
    all_failed_rounds = []
    
    # 배치별로 크롤링
    current = start_round
    batch_num = 1
    
    while current <= end_round:
        batch_end = min(current + batch_size - 1, end_round)
        
        print(f"\n{'='*70}")
        print(f"  📦 배치 {batch_num}: {current}회 ~ {batch_end}회")
        print(f"{'='*70}")
        
        # 배치 크롤링
        start_time = time.time()
        result = crawler.crawl_multiple_rounds(current, batch_end)
        elapsed = time.time() - start_time
        
        # 통계 업데이트
        total_success += result['success_count']
        total_failed += result['failed_count']
        all_failed_rounds.extend(result['failed_rounds'])
        
        # 배치 결과 출력
        print(f"\n✅ 배치 완료: {result['success_count']}개 성공, {result['failed_count']}개 실패")
        print(f"⏱️  소요 시간: {elapsed:.1f}초")
        
        if result['failed_rounds']:
            print(f"⚠️  실패한 회차: {result['failed_rounds'][:10]}")
            if len(result['failed_rounds']) > 10:
                print(f"   ... 외 {len(result['failed_rounds']) - 10}개")
        
        # 다음 배치로
        current = batch_end + 1
        batch_num += 1
        
        # 서버 부하 방지 - 배치 간 대기
        if current <= end_round:
            print(f"\n⏳ 다음 배치 전 5초 대기...")
            time.sleep(5)
    
    # 최종 통계
    print("\n" + "=" * 70)
    print("  🎉 대량 크롤링 완료!")
    print("=" * 70)
    print(f"\n📊 최종 통계:")
    print(f"  • 총 시도: {total_rounds}개")
    print(f"  • ✅ 성공: {total_success}개")
    print(f"  • ❌ 실패: {total_failed}개")
    print(f"  • 성공률: {(total_success/total_rounds*100):.1f}%")
    
    if all_failed_rounds:
        print(f"\n⚠️  실패한 회차 목록 ({len(all_failed_rounds)}개):")
        # 최대 20개까지만 표시
        for i, round_num in enumerate(all_failed_rounds[:20]):
            print(f"  {round_num}", end="")
            if (i + 1) % 10 == 0:
                print()
        if len(all_failed_rounds) > 20:
            print(f"\n  ... 외 {len(all_failed_rounds) - 20}개")
    
    print("\n" + "=" * 70)
    print("\n📁 데이터 확인:")
    print("  mysql -u lotto_user -p2323 lotto_db -e 'SELECT COUNT(*) FROM lotto_numbers;'")
    print("  mysql -u lotto_user -p2323 lotto_db -e 'SELECT * FROM lotto_numbers ORDER BY round DESC LIMIT 5;'")
    print()
    
    return {
        'total_success': total_success,
        'total_failed': total_failed,
        'failed_rounds': all_failed_rounds
    }


def main():
    """메인 함수"""
    
    if len(sys.argv) == 1:
        # 전체 크롤링 (1회부터 최신까지)
        print("전체 크롤링을 시작합니다...")
        print("⚠️  주의: 약 1,200개 회차를 수집하는데 20~30분 소요됩니다.")
        
        response = input("\n계속하시겠습니까? (y/N): ")
        if response.lower() != 'y':
            print("취소되었습니다.")
            sys.exit(0)
        
        bulk_crawl(start_round=1)
        
    elif len(sys.argv) == 3:
        # 범위 지정 크롤링
        start = int(sys.argv[1])
        end = int(sys.argv[2])
        
        print(f"{start}회 ~ {end}회 크롤링을 시작합니다...")
        bulk_crawl(start_round=start, end_round=end)
        
    else:
        print("사용법:")
        print("  python3 bulk_crawl.py              # 전체 크롤링 (1회~최신)")
        print("  python3 bulk_crawl.py 1 100        # 범위 크롤링 (1~100회)")
        sys.exit(1)


if __name__ == '__main__':
    main()
