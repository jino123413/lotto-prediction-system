from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import logging
from .predictor import MLPredictor
from .real_predictor import RealMLPredictor
from .database import Database

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

# ML 예측기 (실제 학습된 모델 사용)
try:
    model_dir = '/app/models' if os.path.exists('/app/models') else './models'
    real_predictor = RealMLPredictor(db, model_dir=model_dir)
    USE_REAL_MODEL = True
    logger.info(f"✓ 실제 학습된 ML 모델 사용 (경로: {model_dir})")
except Exception as e:
    logger.warning(f"실제 모델 로드 실패, 시뮬레이션 모드 사용: {e}")
    import traceback
    traceback.print_exc()
    real_predictor = None
    USE_REAL_MODEL = False

# 백업용 시뮬레이션 예측기
predictor = MLPredictor(db)


@app.route('/health', methods=['GET'])
def health_check():
    """헬스 체크"""
    return jsonify({"status": "healthy", "service": "ml-prediction"}), 200


@app.route('/predict', methods=['POST'])
def predict():
    """단일 번호 예측"""
    try:
        data = request.get_json()
        method = data.get('method', 'random_forest')  # random_forest, xgboost, ensemble
        
        result = predictor.predict_numbers(method=method)
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"예측 실패: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/predict-multiple', methods=['POST'])
def predict_multiple():
    """5가지 조합 예측 (ML 3개 + 통계 2개)"""
    try:
        # 실제 학습된 모델 사용
        if USE_REAL_MODEL and real_predictor:
            results = real_predictor.predict_multiple()
            return jsonify({
                "success": True,
                "predictions": results,
                "count": len(results),
                "model_type": "trained"
            }), 200
        
        # 백업: 시뮬레이션 모드
        results = []
        
        # Random Forest
        rf_result = predictor.predict_numbers(method='random_forest')
        if rf_result.get('success'):
            results.append({
                "method": "Random Forest ML",
                "numbers": rf_result['numbers'],
                "confidence": rf_result.get('confidence', 0)
            })
        
        # XGBoost
        xgb_result = predictor.predict_numbers(method='xgboost')
        if xgb_result.get('success'):
            results.append({
                "method": "XGBoost ML",
                "numbers": xgb_result['numbers'],
                "confidence": xgb_result.get('confidence', 0)
            })
        
        # Ensemble
        ensemble_result = predictor.predict_numbers(method='ensemble')
        if ensemble_result.get('success'):
            results.append({
                "method": "Ensemble ML",
                "numbers": ensemble_result['numbers'],
                "confidence": ensemble_result.get('confidence', 0)
            })
        
        # 통계 기반 1: 빈도 높은 번호
        freq_result = predictor.predict_by_frequency()
        if freq_result.get('success'):
            results.append({
                "method": "High Frequency",
                "numbers": freq_result['numbers'],
                "confidence": 65
            })
        
        # 통계 기반 2: 최근 추세
        trend_result = predictor.predict_by_trend()
        if trend_result.get('success'):
            results.append({
                "method": "Recent Trend",
                "numbers": trend_result['numbers'],
                "confidence": 60
            })
        
        return jsonify({
            "success": True,
            "predictions": results,
            "count": len(results),
            "model_type": "simulation"
        }), 200
    except Exception as e:
        logger.error(f"다중 예측 실패: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/model-info', methods=['GET'])
def model_info():
    """모델 정보"""
    try:
        info = predictor.get_model_info()
        return jsonify(info), 200
    except Exception as e:
        logger.error(f"모델 정보 조회 실패: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/train', methods=['POST'])
def train_model():
    """모델 재학습"""
    try:
        data = request.get_json()
        method = data.get('method', 'all')
        
        result = predictor.train_models(method=method)
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"모델 학습 실패: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8003, debug=True)
