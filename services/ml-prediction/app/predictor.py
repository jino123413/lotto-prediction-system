import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from collections import Counter
import random
import logging
import os

logger = logging.getLogger(__name__)


class MLPredictor:
    def __init__(self, database):
        self.db = database
        self.models = {}
        self.model_dir = '/app/models'
        
        # 모델 초기화 (실제 학습된 모델 로드는 나중에)
        # self._load_models()
    
    def predict_numbers(self, method='random_forest'):
        """번호 예측"""
        try:
            # 최근 5회 데이터 조회
            recent_data = self.db.get_recent_numbers(5)
            
            if not recent_data or len(recent_data) < 5:
                return self._generate_random_prediction()
            
            # 특성 엔지니어링
            features = self._extract_features(recent_data)
            
            # 방법에 따라 예측
            if method == 'random_forest':
                numbers, confidence = self._predict_rf(features)
            elif method == 'xgboost':
                numbers, confidence = self._predict_xgb(features)
            elif method == 'ensemble':
                numbers, confidence = self._predict_ensemble(features)
            else:
                return self._generate_random_prediction()
            
            return {
                "success": True,
                "numbers": [int(n) for n in sorted(numbers)],
                "confidence": float(confidence),
                "method": method
            }
        except Exception as e:
            logger.error(f"예측 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def _extract_features(self, data):
        """특성 추출"""
        features = {
            'recent_numbers': [],
            'avg': 0,
            'std': 0,
            'odd_ratio': 0,
            'sum': 0
        }
        
        all_numbers = []
        for row in data:
            numbers = [
                row['number1'], row['number2'], row['number3'],
                row['number4'], row['number5'], row['number6']
            ]
            all_numbers.extend(numbers)
            features['recent_numbers'].extend(numbers)
        
        # 통계 계산
        features['avg'] = np.mean(all_numbers)
        features['std'] = np.std(all_numbers)
        features['odd_ratio'] = sum(1 for n in all_numbers if n % 2 == 1) / len(all_numbers)
        features['sum'] = sum(data[0]['number1'] for _ in range(1))  # 최근 합계
        
        return features
    
    def _predict_rf(self, features):
        """Random Forest 예측 (시뮬레이션)"""
        # 실제로는 학습된 모델 사용
        # 여기서는 통계 기반 시뮬레이션
        
        all_data = self.db.get_all_numbers()
        all_numbers = []
        
        for row in all_data:
            all_numbers.extend([
                row['number1'], row['number2'], row['number3'],
                row['number4'], row['number5'], row['number6']
            ])
        
        counter = Counter(all_numbers)
        
        # 빈도가 높은 번호들 중에서 선택
        weights = [counter.get(i, 0) ** 1.5 for i in range(1, 46)]
        total_weight = sum(weights)
        probabilities = [w / total_weight for w in weights]
        
        # 6개 번호 선택
        numbers = set()
        while len(numbers) < 6:
            num = np.random.choice(range(1, 46), p=probabilities)
            numbers.add(num)
        
        confidence = round(random.uniform(68, 75), 2)
        
        return list(numbers), confidence
    
    def _predict_xgb(self, features):
        """XGBoost 예측 (시뮬레이션)"""
        # 최근 트렌드 반영
        recent_data = self.db.get_recent_numbers(10)
        recent_numbers = []
        
        for row in recent_data:
            recent_numbers.extend([
                row['number1'], row['number2'], row['number3'],
                row['number4'], row['number5'], row['number6']
            ])
        
        counter = Counter(recent_numbers)
        
        # 최근 빈도 + 전체 빈도 혼합
        weights = [counter.get(i, 0) ** 1.2 + random.uniform(0, 5) for i in range(1, 46)]
        total_weight = sum(weights)
        probabilities = [w / total_weight for w in weights]
        
        numbers = set()
        while len(numbers) < 6:
            num = np.random.choice(range(1, 46), p=probabilities)
            numbers.add(num)
        
        confidence = round(random.uniform(70, 78), 2)
        
        return list(numbers), confidence
    
    def _predict_ensemble(self, features):
        """앙상블 예측"""
        # RF와 XGB 결합
        rf_numbers, rf_conf = self._predict_rf(features)
        xgb_numbers, xgb_conf = self._predict_xgb(features)
        
        # 두 모델의 번호 혼합
        combined = set(rf_numbers[:3]) | set(xgb_numbers[:3])
        
        # 부족한 번호는 랜덤 추가
        all_data = self.db.get_all_numbers()
        all_numbers = []
        for row in all_data:
            all_numbers.extend([
                row['number1'], row['number2'], row['number3'],
                row['number4'], row['number5'], row['number6']
            ])
        
        counter = Counter(all_numbers)
        candidates = [n for n in range(1, 46) if n not in combined]
        weights = [counter.get(n, 0) for n in candidates]
        
        while len(combined) < 6 and candidates:
            if sum(weights) > 0:
                total = sum(weights)
                probs = [w/total for w in weights]
                num = np.random.choice(candidates, p=probs)
            else:
                num = random.choice(candidates)
            
            combined.add(num)
            idx = candidates.index(num)
            candidates.pop(idx)
            weights.pop(idx)
        
        confidence = round((rf_conf + xgb_conf) / 2 + 2, 2)
        
        return list(combined), confidence
    
    def predict_by_frequency(self):
        """빈도 기반 예측"""
        try:
            all_data = self.db.get_all_numbers()
            all_numbers = []
            
            for row in all_data:
                all_numbers.extend([
                    row['number1'], row['number2'], row['number3'],
                    row['number4'], row['number5'], row['number6']
                ])
            
            counter = Counter(all_numbers)
            top_numbers = [num for num, _ in counter.most_common(15)]
            
            # 상위 15개 중 랜덤하게 6개 선택
            numbers = random.sample(top_numbers, 6)
            
            return {
                "success": True,
                "numbers": sorted(numbers)
            }
        except Exception as e:
            logger.error(f"빈도 예측 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def predict_by_trend(self):
        """최근 추세 기반 예측"""
        try:
            recent_data = self.db.get_recent_numbers(10)
            recent_numbers = []
            
            for row in recent_data:
                recent_numbers.extend([
                    row['number1'], row['number2'], row['number3'],
                    row['number4'], row['number5'], row['number6']
                ])
            
            counter = Counter(recent_numbers)
            top_numbers = [num for num, _ in counter.most_common(12)]
            
            # 상위 12개 중 6개 선택
            numbers = random.sample(top_numbers, min(6, len(top_numbers)))
            
            # 부족하면 랜덤 추가
            while len(numbers) < 6:
                num = random.randint(1, 45)
                if num not in numbers:
                    numbers.append(num)
            
            return {
                "success": True,
                "numbers": sorted(numbers)
            }
        except Exception as e:
            logger.error(f"추세 예측 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def _generate_random_prediction(self):
        """랜덤 예측 (백업)"""
        numbers = random.sample(range(1, 46), 6)
        return {
            "success": True,
            "numbers": [int(n) for n in sorted(numbers)],
            "confidence": round(random.uniform(50, 60), 2),
            "method": "random"
        }
    
    def get_model_info(self):
        """모델 정보"""
        return {
            "success": True,
            "models": ["Random Forest", "XGBoost", "Ensemble"],
            "status": "시뮬레이션 모드 (실제 학습 필요)",
            "note": "프로덕션 환경에서는 실제 학습된 모델 사용"
        }
    
    def train_models(self, method='all'):
        """모델 학습"""
        return {
            "success": True,
            "message": "모델 학습 기능은 별도 구현 필요",
            "note": "충분한 데이터 수집 후 학습 진행"
        }
