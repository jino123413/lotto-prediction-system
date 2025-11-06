"""
실제 동행복권 로또 데이터 크롤러
"""
import requests
from bs4 import BeautifulSoup
import logging
import re
from datetime import datetime

logger = logging.getLogger(__name__)


class RealLottoCrawler:
    """실제 동행복권 사이트에서 로또 데이터 크롤링"""
    
    def __init__(self, database):
        self.db = database
        self.base_url = "https://www.dhlottery.co.kr/gameResult.do?method=byWin"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def get_latest_round(self):
        """최신 회차 번호 가져오기"""
        try:
            response = requests.get(self.base_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 회차 정보 추출 - 여러 방법 시도
            # 방법 1: strong 태그에서 회차 찾기
            strong_tags = soup.find_all('strong')
            for tag in strong_tags:
                text = tag.get_text()
                match = re.search(r'(\d+)회', text)
                if match:
                    round_num = int(match.group(1))
                    logger.info(f"최신 회차 발견: {round_num}")
                    return round_num
            
            # 방법 2: input 태그에서 drwNo 찾기
            input_tag = soup.find('input', {'id': 'dwrNo'})
            if input_tag and input_tag.get('value'):
                round_num = int(input_tag['value'])
                logger.info(f"최신 회차 발견 (input): {round_num}")
                return round_num
            
            # 기본값
            logger.warning("최신 회차를 찾을 수 없어 기본값 사용")
            return 1095
            
        except Exception as e:
            logger.error(f"최신 회차 조회 실패: {e}")
            return 1095
    
    def crawl_round(self, round_number=None):
        """특정 회차 데이터 크롤링"""
        try:
            if not round_number:
                round_number = self.get_latest_round()
            
            # URL 구성
            url = f"{self.base_url}&drwNo={round_number}"
            logger.info(f"크롤링 시작: {url}")
            
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 당첨 번호 추출
            numbers = []
            bonus = None
            
            # 방법 1: ball_645 클래스를 가진 span 태그
            ball_spans = soup.select('span.ball_645')
            
            if ball_spans and len(ball_spans) >= 6:
                # 처음 6개는 당첨 번호
                for i in range(6):
                    num_text = ball_spans[i].get_text().strip()
                    try:
                        numbers.append(int(num_text))
                    except ValueError:
                        logger.error(f"번호 변환 실패: {num_text}")
                
                # 7번째는 보너스 번호
                if len(ball_spans) >= 7:
                    bonus_text = ball_spans[6].get_text().strip()
                    try:
                        bonus = int(bonus_text)
                    except ValueError:
                        pass
            
            # 추첨일 추출
            draw_date = None
            date_pattern = re.compile(r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일')
            
            # p 태그에서 날짜 찾기
            p_tags = soup.find_all('p', class_='desc')
            for p in p_tags:
                match = date_pattern.search(p.get_text())
                if match:
                    year, month, day = match.groups()
                    draw_date = f"{year}-{int(month):02d}-{int(day):02d}"
                    break
            
            # 날짜를 못 찾으면 현재 날짜 사용
            if not draw_date:
                draw_date = datetime.now().strftime('%Y-%m-%d')
            
            # 검증
            if len(numbers) != 6:
                logger.error(f"번호 개수 오류: {len(numbers)}개 (6개 필요)")
                return None
            
            # 번호 범위 검증
            for num in numbers:
                if not (1 <= num <= 45):
                    logger.error(f"잘못된 번호: {num}")
                    return None
            
            if bonus and not (1 <= bonus <= 45):
                logger.error(f"잘못된 보너스 번호: {bonus}")
                bonus = None
            
            # 데이터베이스 저장
            success = self.db.insert_lotto_numbers(
                round_num=round_number,
                draw_date=draw_date,
                numbers=numbers,
                bonus=bonus
            )
            
            if success:
                logger.info(f"✓ {round_number}회차 저장 완료: {numbers} + {bonus}")
                return {
                    "round": round_number,
                    "draw_date": draw_date,
                    "numbers": numbers,
                    "bonus": bonus
                }
            else:
                logger.error(f"데이터베이스 저장 실패")
                return None
                
        except requests.RequestException as e:
            logger.error(f"HTTP 요청 실패: {e}")
            return None
        except Exception as e:
            logger.error(f"크롤링 오류: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def crawl_multiple_rounds(self, start_round, end_round=None):
        """여러 회차 일괄 크롤링"""
        if not end_round:
            end_round = self.get_latest_round()
        
        results = []
        failed = []
        
        logger.info(f"일괄 크롤링 시작: {start_round} ~ {end_round}회")
        
        for round_num in range(start_round, end_round + 1):
            result = self.crawl_round(round_num)
            if result:
                results.append(result)
            else:
                failed.append(round_num)
            
            # 서버 부하 방지
            import time
            time.sleep(1)
        
        logger.info(f"크롤링 완료: 성공 {len(results)}개, 실패 {len(failed)}개")
        
        return {
            "success_count": len(results),
            "failed_count": len(failed),
            "failed_rounds": failed,
            "results": results
        }
    
    def test_crawl(self):
        """크롤링 테스트 (최신 회차만)"""
        logger.info("=== 크롤링 테스트 시작 ===")
        
        latest = self.get_latest_round()
        logger.info(f"최신 회차: {latest}")
        
        result = self.crawl_round(latest)
        
        if result:
            logger.info(f"테스트 성공!")
            logger.info(f"회차: {result['round']}")
            logger.info(f"날짜: {result['draw_date']}")
            logger.info(f"번호: {result['numbers']}")
            logger.info(f"보너스: {result['bonus']}")
            return True
        else:
            logger.error("테스트 실패!")
            return False
