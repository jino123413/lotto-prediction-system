import requests
from bs4 import BeautifulSoup
import logging
import time
import re

logger = logging.getLogger(__name__)


class StoreCrawler:
    """로또 판매점 정보 크롤러"""
    
    def __init__(self, db):
        self.db = db
        self.base_url = "https://www.dhlottery.co.kr"
        # 최근 1등 배출점 목록 페이지
        self.store_url = f"{self.base_url}/store.do?method=topStore&pageGubun=L645"
        # 회차별 당첨 결과 페이지
        self.result_url = f"{self.base_url}/gameResult.do?method=byWin"
        
    def crawl_winning_stores(self):
        """1등 배출 판매점 크롤링"""
        try:
            logger.info("1등 배출 판매점 크롤링 시작...")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(self.store_url, headers=headers, timeout=10)
            response.raise_for_status()
            response.encoding = 'euc-kr'
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 1등 배출점만 찾기 (첫 번째 group_content)
            contents = soup.select('.group_content')
            if not contents or len(contents) < 1:
                logger.error("1등 배출점 영역을 찾을 수 없습니다")
                return {'success': False, 'error': '페이지 구조 오류'}
            
            # 첫 번째 group_content = 1등 배출점
            first_content = contents[0]
            rows = first_content.select('table tbody tr')
            
            stores = []
            for row in rows:
                cols = row.select('td')
                if len(cols) >= 4:  # 번호, 상호명, 구분, 소재지, 위치보기
                    try:
                        rank = cols[0].get_text(strip=True)
                        store_name = cols[1].get_text(strip=True)
                        method = cols[2].get_text(strip=True)  # 자동/수동
                        address = cols[3].get_text(strip=True)
                        
                        # URL이나 잘못된 판매점 이름 필터링
                        if self._is_invalid_store_name(store_name):
                            logger.warning(f"잘못된 판매점 이름 스킵: {store_name}")
                            continue
                        
                        # 지역 추출
                        region = self._extract_region(address)
                        
                        # 1등 배출점 데이터
                        store_data = {
                            'store_name': store_name,
                            'address': address,
                            'region': region,
                            'wins_1st': 1,
                            'wins_2nd': 0,
                            'total_wins': 1,
                            'rank': int(rank) if rank.isdigit() else len(stores) + 1
                        }
                        
                        stores.append(store_data)
                        logger.info(f"수집: {rank}. {store_name} ({region}) - {method}")
                        
                    except Exception as e:
                        logger.error(f"판매점 파싱 오류: {e}")
                        continue
            
            # DB 저장
            if stores:
                saved_count = self.save_stores(stores)
                logger.info(f"총 {len(stores)}개 1등 배출 판매점 수집 완료, {saved_count}개 저장")
                return {'success': True, 'count': len(stores), 'saved': saved_count}
            else:
                logger.warning("수집된 판매점 데이터 없음")
                return {'success': False, 'error': '데이터 없음'}
                
        except Exception as e:
            logger.error(f"판매점 크롤링 실패: {e}")
            return {'success': False, 'error': str(e)}
    
    def _is_invalid_store_name(self, store_name):
        """잘못된 판매점 이름 체크 (URL 등)"""
        if not store_name or len(store_name) < 2:
            return True
        
        # URL 패턴 체크
        invalid_patterns = [
            'http://', 'https://', '.co.kr', '.com', '.net',
            'dhlottery', 'www.', '://'
        ]
        
        for pattern in invalid_patterns:
            if pattern in store_name.lower():
                return True
        
        return False
    
    def _extract_region(self, address):
        """주소에서 지역 추출"""
        if not address:
            return '기타'
        
        region_parts = address.split()
        if not region_parts:
            return '기타'
        
        # 첫 단어가 시/도 이름
        region = region_parts[0]
        
        # "서울특별시", "부산광역시" 등으로 확장
        if len(region_parts) > 1:
            second = region_parts[1]
            if second in ['특별시', '광역시', '특별자치시', '특별자치도']:
                region = region + second
            elif '도' in region and not region.endswith('도'):
                region = region + '도'
        
        return region
    
    def _get_latest_round(self, headers):
        """최신 회차 번호 가져오기"""
        try:
            url = f"{self.base_url}/common.do?method=getLottoNumber&drwNo="
            response = requests.get(url, headers=headers, timeout=10)
            data = response.json()
            return data.get('drwNo', 1196)
        except:
            return None
    
    def _parse_store_info(self, store_text):
        """판매점 정보 파싱"""
        stores = []
        
        # 여러 판매점이 있을 수 있음 (,로 구분)
        parts = store_text.split(',')
        
        for part in parts:
            part = part.strip()
            if not part or part == '-' or '자동' in part:
                continue
            
            # 지역과 판매점명 추출
            # 형식: "서울 강남구 xxx / 판매점명" 또는 "판매점명"
            if '/' in part:
                address_part, store_name = part.rsplit('/', 1)
                address_part = address_part.strip()
                store_name = store_name.strip()
            else:
                # 주소만 있는 경우
                address_part = part
                # 주소에서 판매점명 추정 (마지막 부분)
                words = part.split()
                if len(words) >= 3:
                    store_name = ' '.join(words[-2:])
                    address_part = ' '.join(words[:-2])
                else:
                    store_name = part
            
            # 지역 추출
            region_match = re.match(r'([가-힣]+시|[가-힣]+도)', address_part)
            region = region_match.group(1) if region_match else address_part.split()[0] if address_part else ''
            
            if store_name:
                stores.append((store_name, address_part, region))
        
        return stores
    
    def save_stores(self, stores):
        """판매점 데이터 DB 저장"""
        saved_count = 0
        for store in stores:
            if self.db.insert_store(store):
                saved_count += 1
        return saved_count
    
    def crawl_historical_stores(self, start_round=601, end_round=None):
        """회차별 1등 배출점 수집 및 집계"""
        try:
            logger.info(f"{start_round}회차부터 역사적 데이터 수집 시작...")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            # 최신 회차 확인
            if not end_round:
                # 페이지에서 최신 회차 확인
                response = requests.get(self.store_url, headers=headers, timeout=10)
                response.encoding = 'euc-kr'
                soup = BeautifulSoup(response.text, 'html.parser')
                select_drw = soup.select('select[name="drwNo"] option')
                if select_drw:
                    end_round = int(select_drw[0].get('value'))
                else:
                    end_round = 1196
            
            logger.info(f"수집 범위: {start_round}회 ~ {end_round}회 (총 {end_round - start_round + 1}회)")
            
            # 판매점별 당첨 횟수 집계
            stores_dict = {}  # {store_key: {store_name, address, region, wins_1st}}
            
            total_rounds = end_round - start_round + 1
            for idx, round_num in enumerate(range(start_round, end_round + 1)):
                retry_count = 0
                max_retries = 3
                response = None
                
                while retry_count < max_retries:
                    try:
                        if (idx + 1) % 50 == 0 or (idx + 1) == total_rounds:
                            logger.info(f"진행 중... {idx + 1}/{total_rounds} ({round_num}회)")
                        
                        # 회차별 1등 배출점 페이지
                        url = f"{self.store_url}&drwNo={round_num}"
                        response = requests.get(url, headers=headers, timeout=30)
                        response.raise_for_status()
                        response.encoding = 'euc-kr'
                        break  # 성공하면 루프 탈출
                        
                    except requests.exceptions.Timeout:
                        retry_count += 1
                        if retry_count < max_retries:
                            wait_time = retry_count * 5
                            logger.warning(f"{round_num}회 타임아웃, {wait_time}초 후 재시도 ({retry_count}/{max_retries})")
                            time.sleep(wait_time)
                        else:
                            logger.error(f"{round_num}회 수집 실패 (타임아웃)")
                    except Exception as e:
                        logger.error(f"{round_num}회 수집 오류: {e}")
                        retry_count = max_retries  # 다른 오류는 재시도 안 함
                
                if retry_count >= max_retries or response is None:
                    continue
                
                # 파싱
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # 첫 번째 group_content = 1등 배출점
                contents = soup.select('.group_content')
                if contents and len(contents) > 0:
                    rows = contents[0].select('table tbody tr')
                    
                    for row in rows:
                        cols = row.select('td')
                        if len(cols) >= 4:
                            rank = cols[0].get_text(strip=True)
                            store_name = cols[1].get_text(strip=True)
                            method = cols[2].get_text(strip=True)
                            address = cols[3].get_text(strip=True)
                            
                            # URL이나 잘못된 판매점 이름 필터링
                            if self._is_invalid_store_name(store_name):
                                continue
                            
                            region = self._extract_region(address)
                            
                            # 판매점 식별 키 (주소 기반)
                            store_key = f"{store_name}_{address}"
                            
                            if store_key not in stores_dict:
                                stores_dict[store_key] = {
                                    'store_name': store_name,
                                    'address': address,
                                    'region': region,
                                    'wins_1st': 0,
                                    'wins_2nd': 0
                                }
                            
                            stores_dict[store_key]['wins_1st'] += 1
                
                # 서버 부하 방지 - 대기 시간 증가
                time.sleep(1.0)
            
            # 결과 정리
            stores = []
            for data in stores_dict.values():
                data['total_wins'] = data['wins_1st'] + data['wins_2nd']
                stores.append(data)
            
            # 당첨 횟수로 정렬
            stores.sort(key=lambda x: x['total_wins'], reverse=True)
            
            # 순위 부여
            for i, store in enumerate(stores):
                store['rank'] = i + 1
            
            # DB 저장
            if stores:
                saved_count = self.save_stores(stores)
                logger.info(f"총 {len(stores)}개 판매점 수집 완료, {saved_count}개 저장")
                top_10 = [f"{s['store_name']}({s['wins_1st']}회)" for s in stores[:10]]
                logger.info(f"TOP 10: {top_10}")
                return {
                    'success': True, 
                    'count': len(stores), 
                    'saved': saved_count,
                    'rounds': f'{start_round}-{end_round}'
                }
            else:
                logger.warning("수집된 판매점 데이터 없음")
                return {'success': False, 'error': '데이터 없음'}
                
        except Exception as e:
            logger.error(f"역사적 데이터 수집 실패: {e}")
            return {'success': False, 'error': str(e)}
    
    def _parse_store_from_result(self, store_text):
        """당첨 결과 페이지의 판매점 정보 파싱"""
        stores = []
        
        # 쉼표로 구분된 여러 판매점
        parts = store_text.split(',')
        
        for part in parts:
            part = part.strip()
            if not part or part == '-':
                continue
            
            # 주소 패턴 매칭
            # 예: "서울 강남구 테헤란로 123"
            address_match = re.match(r'([가-힣]+\s+[가-힣]+\s+[^\s]+)', part)
            if address_match:
                address = address_match.group(1)
                region = self._extract_region(address)
                
                # 나머지를 판매점명으로 사용
                store_name = part.replace(address, '').strip()
                if not store_name:
                    store_name = address.split()[-1] if address else 'Unknown'
                
                stores.append((store_name, address, region))
        
        return stores
    
    def crawl_by_region(self, region_code=''):
        """지역별 판매점 크롤링"""
        try:
            logger.info(f"지역별 판매점 크롤링: {region_code}")
            
            # 지역별 URL 구성 (필요시 구현)
            # 현재는 전국 TOP 판매점만 수집
            
            return self.crawl_winning_stores()
            
        except Exception as e:
            logger.error(f"지역별 크롤링 실패: {e}")
            return {'success': False, 'error': str(e)}
