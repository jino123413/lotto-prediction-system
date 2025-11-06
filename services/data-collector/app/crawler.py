import requests
from bs4 import BeautifulSoup
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class LottoCrawler:
    def __init__(self, database):
        self.db = database
        self.base_url = "https://www.dhlottery.co.kr/gameResult.do?method=byWin"
    
    def collect_latest(self, round_number=None):
        """최신 로또 번호 수집"""
        try:
            # 회차 번호가 없으면 최신 회차 가져오기
            if not round_number:
                round_number = self._get_latest_round()
            
            # 데이터 크롤링
            url = f"{self.base_url}&drwNo={round_number}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 당첨 번호 추출
            numbers = []
            bonus = None
            
            # 번호 추출 로직 (실제 사이트 구조에 맞게 수정 필요)
            # 예시: class="ball_645" 같은 요소에서 추출
            ball_elements = soup.select('.num.win .ball_645')
            
            if len(ball_elements) >= 6:
                for i in range(6):
                    numbers.append(int(ball_elements[i].text.strip()))
                
                # 보너스 번호
                bonus_element = soup.select_one('.num.bonus .ball_645')
                if bonus_element:
                    bonus = int(bonus_element.text.strip())
            
            # 추첨일 추출
            date_element = soup.select_one('.win_result h4')
            draw_date = None
            if date_element:
                # 날짜 파싱 (예: "2023년 11월 4일 추첨" -> "2023-11-04")
                date_text = date_element.text.strip()
                # 실제 구현에서는 정규식이나 더 정교한 파싱 필요
                draw_date = datetime.now().strftime('%Y-%m-%d')  # 임시
            
            # 데이터베이스에 저장
            if len(numbers) == 6:
                self.db.insert_lotto_numbers(
                    round_num=round_number,
                    draw_date=draw_date,
                    numbers=numbers,
                    bonus=bonus
                )
                
                logger.info(f"{round_number}회차 수집 완료: {numbers}, 보너스: {bonus}")
                
                return {
                    "round": round_number,
                    "draw_date": draw_date,
                    "numbers": numbers,
                    "bonus": bonus
                }
            else:
                logger.error("번호 추출 실패")
                return None
                
        except Exception as e:
            logger.error(f"크롤링 실패: {str(e)}")
            raise
    
    def _get_latest_round(self):
        """최신 회차 번호 가져오기"""
        try:
            response = requests.get(self.base_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 최신 회차 번호 추출 (실제 사이트 구조에 맞게 수정 필요)
            round_element = soup.select_one('.win_result h4 strong')
            if round_element:
                round_text = round_element.text.strip()
                # "1095회" -> 1095
                round_number = int(''.join(filter(str.isdigit, round_text)))
                return round_number
            
            # 기본값 (테스트용)
            return 1095
        except Exception as e:
            logger.error(f"최신 회차 조회 실패: {str(e)}")
            return 1095  # 기본값
