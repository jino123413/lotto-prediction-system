from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import logging
from datetime import datetime
from .database import Database
from .crawler import LottoCrawler
from .store_crawler import StoreCrawler
from apscheduler.schedulers.background import BackgroundScheduler

# 로깅 설정
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

# 크롤러 초기화
crawler = LottoCrawler(db)
store_crawler = StoreCrawler(db)

# 스케줄러 설정 (주 1회 토요일 저녁 수집)
scheduler = BackgroundScheduler()
scheduler.add_job(func=crawler.collect_latest, trigger="cron", day_of_week='sat', hour=21)
scheduler.start()


@app.route('/health', methods=['GET'])
def health_check():
    """헬스 체크"""
    return jsonify({"status": "healthy", "service": "data-collector"}), 200


@app.route('/collect', methods=['POST'])
def collect_data():
    """수동 데이터 수집"""
    try:
        data = request.get_json()
        round_number = data.get('round') if data else None
        
        result = crawler.collect_latest(round_number)
        
        return jsonify({
            "success": True,
            "message": "데이터 수집 완료",
            "data": result
        }), 200
    except Exception as e:
        logger.error(f"데이터 수집 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/latest', methods=['GET'])
def get_latest():
    """최신 5회 당첨 번호 조회"""
    try:
        limit = request.args.get('limit', 5, type=int)
        results = db.get_latest_numbers(limit)
        
        return jsonify({
            "success": True,
            "count": len(results),
            "data": results
        }), 200
    except Exception as e:
        logger.error(f"조회 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/history', methods=['GET'])
def get_history():
    """당첨 이력 조회 (페이지네이션)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        results = db.get_history(page, per_page)
        
        return jsonify({
            "success": True,
            "page": page,
            "per_page": per_page,
            "data": results
        }), 200
    except Exception as e:
        logger.error(f"조회 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/stats/count', methods=['GET'])
def get_count():
    """전체 회차 개수"""
    try:
        count = db.get_total_count()
        
        return jsonify({
            "success": True,
            "total_rounds": count
        }), 200
    except Exception as e:
        logger.error(f"조회 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/crawl/real', methods=['POST'])
def crawl_real():
    """실제 동행복권 사이트에서 데이터 크롤링"""
    try:
        data = request.get_json() or {}
        round_number = data.get('round')
        
        if round_number:
            # 특정 회차 크롤링
            result = real_crawler.crawl_round(round_number)
            if result:
                return jsonify({
                    "success": True,
                    "message": f"{round_number}회 크롤링 완료",
                    "data": result
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "error": "크롤링 실패"
                }), 500
        else:
            # 최신 회차 크롤링
            latest_round = real_crawler.get_latest_round()
            result = real_crawler.crawl_round(latest_round)
            if result:
                return jsonify({
                    "success": True,
                    "message": f"최신 {latest_round}회 크롤링 완료",
                    "data": result
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "error": "크롤링 실패"
                }), 500
                
    except Exception as e:
        logger.error(f"크롤링 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/crawl/batch', methods=['POST'])
def crawl_batch():
    """여러 회차 일괄 크롤링"""
    try:
        data = request.get_json() or {}
        start_round = data.get('start_round', 1177)
        end_round = data.get('end_round')
        
        if not end_round:
            end_round = real_crawler.get_latest_round()
        
        result = real_crawler.crawl_multiple_rounds(start_round, end_round)
        
        return jsonify({
            "success": True,
            "message": f"{start_round}~{end_round}회 크롤링 완료",
            "data": result
        }), 200
        
    except Exception as e:
        logger.error(f"일괄 크롤링 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/stores/crawl', methods=['POST'])
def crawl_stores():
    """판매점 데이터 크롤링 (최근 1등 배출점)"""
    try:
        result = store_crawler.crawl_winning_stores()
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"판매점 크롤링 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/stores/crawl/historical', methods=['POST'])
def crawl_historical_stores():
    """회차별 역사적 데이터 크롤링"""
    try:
        data = request.get_json() or {}
        start_round = data.get('start_round', 600)
        end_round = data.get('end_round', None)
        
        logger.info(f"역사적 데이터 크롤링 시작: {start_round}회부터")
        result = store_crawler.crawl_historical_stores(start_round, end_round)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"역사적 데이터 크롤링 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/stores/top', methods=['GET'])
def get_top_stores():
    """상위 판매점 조회"""
    try:
        limit = request.args.get('limit', 100, type=int)
        stores = db.get_top_stores(limit)
        
        return jsonify({
            "success": True,
            "count": len(stores),
            "data": stores
        }), 200
        
    except Exception as e:
        logger.error(f"판매점 조회 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/stores/region/<region>', methods=['GET'])
def get_stores_by_region(region):
    """지역별 판매점 조회"""
    try:
        stores = db.get_stores_by_region(region)
        
        return jsonify({
            "success": True,
            "region": region,
            "count": len(stores),
            "data": stores
        }), 200
        
    except Exception as e:
        logger.error(f"지역별 판매점 조회 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/stores/stats/region', methods=['GET'])
def get_region_stats():
    """지역별 통계"""
    try:
        stats = db.get_region_stats()
        
        return jsonify({
            "success": True,
            "count": len(stats),
            "data": stats
        }), 200
        
    except Exception as e:
        logger.error(f"지역별 통계 조회 실패: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)
