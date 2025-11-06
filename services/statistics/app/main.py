from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import logging
from .analyzer import StatisticsAnalyzer
from .database import Database
from .cache import CacheManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 데이터베이스 연결
db = Database(
    host=os.getenv('MYSQL_HOST', 'localhost'),
    user=os.getenv('MYSQL_USER', 'root'),
    password=os.getenv('MYSQL_PASSWORD', ''),
    database=os.getenv('MYSQL_DATABASE', 'lotto_db')
)

# 캐시 매니저
cache = CacheManager(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379))
)

# 통계 분석기
analyzer = StatisticsAnalyzer(db, cache)


@app.route('/health', methods=['GET'])
def health_check():
    """헬스 체크"""
    return jsonify({"status": "healthy", "service": "statistics"}), 200


@app.route('/frequency', methods=['GET'])
def get_frequency():
    """빈도 분석"""
    try:
        # 캐시 확인
        cached = cache.get('stats:frequency')
        if cached:
            return jsonify(cached), 200
        
        # 분석 수행
        result = analyzer.analyze_frequency()
        
        # 캐시 저장 (1시간)
        cache.set('stats:frequency', result, ttl=3600)
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"빈도 분석 실패: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/patterns', methods=['GET'])
def get_patterns():
    """패턴 분석"""
    try:
        # 캐시 확인
        cached = cache.get('stats:patterns')
        if cached:
            return jsonify(cached), 200
        
        # 분석 수행
        result = analyzer.analyze_patterns()
        
        # 캐시 저장
        cache.set('stats:patterns', result, ttl=3600)
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"패턴 분석 실패: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/statistics', methods=['GET'])
def get_statistics():
    """통계 지표"""
    try:
        # 캐시 확인
        cached = cache.get('stats:statistics')
        if cached:
            return jsonify(cached), 200
        
        # 분석 수행
        result = analyzer.get_statistics()
        
        # 캐시 저장
        cache.set('stats:statistics', result, ttl=3600)
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"통계 조회 실패: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/trends', methods=['GET'])
def get_trends():
    """추이 분석"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        # 캐시 확인
        cache_key = f'stats:trends:{limit}'
        cached = cache.get(cache_key)
        if cached:
            return jsonify(cached), 200
        
        # 분석 수행
        result = analyzer.analyze_trends(limit)
        
        # 캐시 저장
        cache.set(cache_key, result, ttl=3600)
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"추이 분석 실패: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/heatmap', methods=['GET'])
def get_heatmap():
    """히트맵 데이터"""
    try:
        # 캐시 확인
        cached = cache.get('stats:heatmap')
        if cached:
            return jsonify(cached), 200
        
        # 분석 수행
        result = analyzer.generate_heatmap()
        
        # 캐시 저장
        cache.set('stats:heatmap', result, ttl=3600)
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"히트맵 생성 실패: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8002, debug=True)
