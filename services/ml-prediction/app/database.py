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
    
    def get_all_numbers(self):
        """모든 로또 번호 조회"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        cursor = None
        try:
            cursor = self.connection.cursor(dictionary=True)
            query = """
                SELECT round, draw_date,
                       number1, number2, number3, number4, number5, number6, bonus_number
                FROM lotto_numbers
                ORDER BY round ASC
            """
            cursor.execute(query)
            results = cursor.fetchall()
            return results
        except Error as e:
            logger.error(f"조회 실패: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
    
    def get_recent_numbers(self, limit=10):
        """최근 N회 번호 조회"""
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
            return results
        except Error as e:
            logger.error(f"조회 실패: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
    
    def save_prediction(self, user_id, numbers, method, confidence):
        """예측 결과 저장"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        cursor = None
        try:
            cursor = self.connection.cursor()
            query = """
                INSERT INTO prediction_history
                (user_id, predicted_numbers, method, confidence)
                VALUES (%s, %s, %s, %s)
            """
            numbers_str = ','.join(map(str, numbers))
            cursor.execute(query, (user_id, numbers_str, method, confidence))
            self.connection.commit()
            return cursor.lastrowid
        except Error as e:
            logger.error(f"저장 실패: {e}")
            self.connection.rollback()
            return None
        finally:
            if cursor:
                cursor.close()
