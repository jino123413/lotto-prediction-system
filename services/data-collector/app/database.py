import mysql.connector
from mysql.connector import Error
import logging

logger = logging.getLogger(__name__)


class Database:
    def __init__(self, host, user, password, database):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.connection = None
        # 초기 연결 시도
        self.connect()
    
    def connect(self):
        """데이터베이스 연결"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            if self.connection.is_connected():
                logger.info("MySQL 데이터베이스 연결 성공")
                return True
        except Error as e:
            logger.error(f"데이터베이스 연결 실패: {e}")
            self.connection = None
            return False
    
    def disconnect(self):
        """데이터베이스 연결 종료"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("MySQL 연결 종료")
    
    def insert_lotto_numbers(self, round_num, draw_date, numbers, bonus):
        """로또 번호 저장"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        try:
            cursor = self.connection.cursor()
            query = """
                INSERT INTO lotto_numbers 
                (round, draw_date, number1, number2, number3, number4, number5, number6, bonus_number)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                draw_date = VALUES(draw_date),
                number1 = VALUES(number1),
                number2 = VALUES(number2),
                number3 = VALUES(number3),
                number4 = VALUES(number4),
                number5 = VALUES(number5),
                number6 = VALUES(number6),
                bonus_number = VALUES(bonus_number)
            """
            cursor.execute(query, (round_num, draw_date, *numbers, bonus))
            self.connection.commit()
            logger.info(f"{round_num}회차 데이터 저장 완료")
            return True
        except Error as e:
            logger.error(f"데이터 저장 실패: {e}")
            self.connection.rollback()
            return False
        finally:
            cursor.close()
    
    def get_latest_numbers(self, limit=5):
        """최신 N회 당첨 번호 조회"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        cursor = None
        try:
            cursor = self.connection.cursor(dictionary=True)
            query = """
                SELECT round, draw_date, 
                       number1, number2, number3, number4, number5, number6, bonus_number
                FROM lotto_numbers
                ORDER BY round DESC
                LIMIT %s
            """
            cursor.execute(query, (limit,))
            results = cursor.fetchall()
            
            # datetime을 문자열로 변환
            for row in results:
                if row['draw_date']:
                    row['draw_date'] = row['draw_date'].strftime('%Y-%m-%d')
            
            return results
        except Error as e:
            logger.error(f"조회 실패: {e}")
            return []
        finally:
            cursor.close()
    
    def get_history(self, page=1, per_page=20):
        """당첨 이력 조회 (페이지네이션)"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        cursor = None
        try:
            cursor = self.connection.cursor(dictionary=True)
            offset = (page - 1) * per_page
            query = """
                SELECT round, draw_date,
                       number1, number2, number3, number4, number5, number6, bonus_number
                FROM lotto_numbers
                ORDER BY round DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (per_page, offset))
            results = cursor.fetchall()
            
            # datetime을 문자열로 변환
            for row in results:
                if row['draw_date']:
                    row['draw_date'] = row['draw_date'].strftime('%Y-%m-%d')
            
            return results
        except Error as e:
            logger.error(f"조회 실패: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
    
    def get_total_count(self):
        """전체 회차 개수"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        cursor = None
        try:
            cursor = self.connection.cursor()
            query = "SELECT COUNT(*) FROM lotto_numbers"
            cursor.execute(query)
            count = cursor.fetchone()[0]
            return count
        except Error as e:
            logger.error(f"조회 실패: {e}")
            return 0
        finally:
            if cursor:
                cursor.close()
    
    def insert_store(self, store_data):
        """판매점 데이터 저장"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        cursor = None
        try:
            cursor = self.connection.cursor()
            query = """
                INSERT INTO lotto_stores 
                (store_name, address, region, wins_1st, wins_2nd, total_wins, `rank`)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                wins_1st = VALUES(wins_1st),
                wins_2nd = VALUES(wins_2nd),
                total_wins = VALUES(total_wins),
                `rank` = VALUES(`rank`),
                updated_at = CURRENT_TIMESTAMP
            """
            cursor.execute(query, (
                store_data['store_name'],
                store_data['address'],
                store_data['region'],
                store_data['wins_1st'],
                store_data['wins_2nd'],
                store_data['total_wins'],
                store_data['rank']
            ))
            self.connection.commit()
            return True
        except Error as e:
            logger.error(f"판매점 저장 실패: {e}")
            self.connection.rollback()
            return False
        finally:
            if cursor:
                cursor.close()
    
    def get_top_stores(self, limit=100):
        """상위 판매점 조회"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        cursor = None
        try:
            cursor = self.connection.cursor(dictionary=True)
            query = """
                SELECT store_id, store_name, address, region,
                       wins_1st, wins_2nd, total_wins, `rank`
                FROM lotto_stores
                ORDER BY `rank` ASC, total_wins DESC
                LIMIT %s
            """
            cursor.execute(query, (limit,))
            results = cursor.fetchall()
            return results
        except Error as e:
            logger.error(f"판매점 조회 실패: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
    
    def get_stores_by_region(self, region):
        """지역별 판매점 조회"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        cursor = None
        try:
            cursor = self.connection.cursor(dictionary=True)
            query = """
                SELECT store_id, store_name, address, region,
                       wins_1st, wins_2nd, total_wins, `rank`
                FROM lotto_stores
                WHERE region = %s
                ORDER BY total_wins DESC
            """
            cursor.execute(query, (region,))
            results = cursor.fetchall()
            return results
        except Error as e:
            logger.error(f"지역별 판매점 조회 실패: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
    
    def get_region_stats(self):
        """지역별 통계"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        cursor = None
        try:
            cursor = self.connection.cursor(dictionary=True)
            query = "SELECT * FROM v_region_stats"
            cursor.execute(query)
            results = cursor.fetchall()
            return results
        except Error as e:
            logger.error(f"지역별 통계 조회 실패: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
