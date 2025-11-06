import redis
import json
import logging

logger = logging.getLogger(__name__)


class CacheManager:
    def __init__(self, host='localhost', port=6379, db=0):
        try:
            self.redis_client = redis.Redis(
                host=host,
                port=port,
                db=db,
                decode_responses=True
            )
            self.redis_client.ping()
            logger.info("Redis 연결 성공")
        except Exception as e:
            logger.error(f"Redis 연결 실패: {e}")
            self.redis_client = None
    
    def get(self, key):
        """캐시에서 데이터 가져오기"""
        if not self.redis_client:
            return None
        
        try:
            data = self.redis_client.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"캐시 조회 실패: {e}")
            return None
    
    def set(self, key, value, ttl=3600):
        """캐시에 데이터 저장"""
        if not self.redis_client:
            return False
        
        try:
            data = json.dumps(value, ensure_ascii=False)
            self.redis_client.setex(key, ttl, data)
            return True
        except Exception as e:
            logger.error(f"캐시 저장 실패: {e}")
            return False
    
    def delete(self, key):
        """캐시에서 데이터 삭제"""
        if not self.redis_client:
            return False
        
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"캐시 삭제 실패: {e}")
            return False
