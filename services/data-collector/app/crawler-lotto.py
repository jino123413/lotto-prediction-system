
"""
로또 데이터 크롤링 스크립트 (Python 버전)

사용법:
    python crawl-lotto.py              # 최신 회차 1개 크롤링
    python crawl-lotto.py 1196         # 특정 회차 크롤링
    python crawl-lotto.py 1180 1196    # 범위 크롤링 (시작 끝)
"""

import sys
import os
import subprocess
import argparse


def run_docker_python_command(python_code: str) -> int:
    """Docker 컨테이너 내에서 Python 코드 실행"""
    try:
        result = subprocess.run(
            ['sudo', 'docker', 'exec', '-i', 'data-collector-service', 'python3'],
            input=python_code,
            text=True,
            capture_output=False
        )
        return result.returncode
    except Exception as e:
        print(f"오류 발생: {e}")
        return 1


def crawl_latest():
    """최신 회차 1개 크롤링"""
    print("최신 회차 크롤링 중...")
    
    python_code = """
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
print(f"\\n최신 회차: {latest}회")

result = crawler.crawl_round(latest)
if result:
    print(f"✓ 성공: {result['numbers']} + 보너스 {result['bonus']}")
else:
    print("✗ 실패")
"""
    
    return run_docker_python_command(python_code)


def crawl_single_round(round_num: int):
    """특정 회차 크롤링"""
    print(f"{round_num}회 크롤링 중...")
    
    python_code = f"""
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
result = crawler.crawl_round({round_num})
if result:
    print(f"✓ {round_num}회 성공: {{result['numbers']}} + 보너스 {{result['bonus']}}")
else:
    print(f"✗ {round_num}회 실패")
"""
    
    return run_docker_python_command(python_code)


def crawl_range(start: int, end: int):
    """범위 크롤링"""
    print(f"{start}회 ~ {end}회 크롤링 중...")
    print("잠시만 기다려주세요... (1회당 약 1초 소요)")
    
    python_code = f"""
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
result = crawler.crawl_multiple_rounds({start}, {end})

print("")
print("=" * 60)
print(f"크롤링 완료!")
print(f"성공: {{result['success_count']}}개")
print(f"실패: {{result['failed_count']}}개")
if result['failed_rounds']:
    print(f"실패한 회차: {{result['failed_rounds']}}")
print("=" * 60)
"""
    
    return run_docker_python_command(python_code)


def print_header():
    """헤더 출력"""
    print("=" * 38)
    print("  로또 번호 크롤링 시작")
    print("=" * 38)


def print_footer():
    """푸터 출력"""
    print("")
    print("=" * 38)
    print("  크롤링 완료")
    print("=" * 38)
    print("")
    print("데이터 확인:")
    print("  mysql -u lotto_user -p2323 lotto_db -e 'SELECT COUNT(*) FROM lotto_numbers;'")
    print("")


def main():
    parser = argparse.ArgumentParser(
        description='로또 데이터 크롤링 스크립트',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  python crawl-lotto.py              # 최신 회차 1개
  python crawl-lotto.py 1196         # 특정 회차
  python crawl-lotto.py 1180 1196    # 범위 크롤링
        """
    )
    
    parser.add_argument(
        'rounds',
        nargs='*',
        type=int,
        help='크롤링할 회차 (없음: 최신, 1개: 특정 회차, 2개: 범위)'
    )
    
    args = parser.parse_args()
    
    print_header()
    
    try:
        if len(args.rounds) == 0:
            # 최신 회차 1개
            exit_code = crawl_latest()
        elif len(args.rounds) == 1:
            # 특정 회차
            exit_code = crawl_single_round(args.rounds[0])
        elif len(args.rounds) == 2:
            # 범위 크롤링
            start, end = args.rounds
            if start > end:
                print(f"오류: 시작 회차({start})가 끝 회차({end})보다 큽니다.")
                return 1
            exit_code = crawl_range(start, end)
        else:
            print("오류: 인자가 너무 많습니다.")
            parser.print_help()
            return 1
        
        print_footer()
        return exit_code
        
    except KeyboardInterrupt:
        print("\n\n크롤링이 중단되었습니다.")
        return 130
    except Exception as e:
        print(f"\n예상치 못한 오류 발생: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())
