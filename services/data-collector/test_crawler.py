"""
크롤러 단독 테스트 스크립트
Docker 없이 로컬에서 크롤러만 테스트
"""
import sys
import os

# 경로 설정
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.real_crawler import RealLottoCrawler
import logging

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


class MockDatabase:
    """테스트용 Mock 데이터베이스"""
    
    def __init__(self):
        self.data = []
    
    def insert_lotto_numbers(self, round_num, draw_date, numbers, bonus):
        """데이터 저장 시뮬레이션"""
        logger.info(f"[Mock DB] 저장: {round_num}회 - {draw_date} - {numbers} + {bonus}")
        self.data.append({
            'round': round_num,
            'date': draw_date,
            'numbers': numbers,
            'bonus': bonus
        })
        return True
    
    def get_all(self):
        """저장된 모든 데이터 반환"""
        return self.data


def main():
    print("=" * 60)
    print("로또 크롤러 테스트")
    print("=" * 60)
    print()
    
    # Mock DB 생성
    db = MockDatabase()
    
    # 크롤러 생성
    crawler = RealLottoCrawler(db)
    
    # 테스트 실행
    print("1. 최신 회차 크롤링 테스트...")
    print("-" * 60)
    
    success = crawler.test_crawl()
    
    print()
    print("=" * 60)
    
    if success:
        print("✅ 크롤러 테스트 성공!")
        print()
        print("저장된 데이터:")
        for item in db.get_all():
            print(f"  - {item['round']}회 ({item['date']})")
            print(f"    번호: {item['numbers']}")
            print(f"    보너스: {item['bonus']}")
    else:
        print("❌ 크롤러 테스트 실패")
        print()
        print("문제 해결 방법:")
        print("1. 인터넷 연결 확인")
        print("2. 동행복권 사이트 접근 가능 여부 확인")
        print("3. HTML 구조가 변경되었을 수 있음 - real_crawler.py 수정 필요")
    
    print("=" * 60)
    
    # 추가 옵션: 여러 회차 크롤링
    print()
    choice = input("여러 회차 크롤링을 테스트하시겠습니까? (y/n): ")
    
    if choice.lower() == 'y':
        start = int(input("시작 회차: "))
        end = int(input("종료 회차 (Enter=최신): ") or crawler.get_latest_round())
        
        print()
        print(f"{start}회 ~ {end}회 크롤링 시작...")
        print("-" * 60)
        
        result = crawler.crawl_multiple_rounds(start, end)
        
        print()
        print(f"✓ 성공: {result['success_count']}개")
        print(f"✗ 실패: {result['failed_count']}개")
        
        if result['failed_rounds']:
            print(f"실패한 회차: {result['failed_rounds']}")


if __name__ == "__main__":
    main()
