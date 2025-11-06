#!/usr/bin/env python3
"""
로또 번호 예측 ML 모델 학습 스크립트

실제 수집된 데이터를 사용하여 Random Forest, XGBoost 모델을 학습합니다.
"""

import sys
import os
import numpy as np
import pandas as pd
import pickle
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
import xgboost as xgb

# 경로 추가
sys.path.insert(0, os.path.dirname(__file__))
from app.database import Database


class LottoModelTrainer:
    """로또 예측 모델 훈련"""
    
    def __init__(self, db):
        self.db = db
        self.models_dir = './models'
        os.makedirs(self.models_dir, exist_ok=True)
        
        self.rf_models = {}  # 번호 위치별 Random Forest 모델
        self.xgb_models = {}  # 번호 위치별 XGBoost 모델
    
    def load_data(self, min_rounds=100):
        """데이터 로드 및 전처리"""
        print("\n📊 데이터 로드 중...")
        
        # 데이터베이스에서 모든 회차 조회
        data = self.db.get_all_numbers()
        
        if len(data) < min_rounds:
            print(f"⚠️  경고: 데이터가 부족합니다 (현재: {len(data)}개, 최소: {min_rounds}개)")
            print(f"   크롤러로 더 많은 데이터를 수집해주세요.")
            return None
        
        print(f"✓ {len(data)}개 회차 데이터 로드 완료")
        
        # DataFrame으로 변환
        df = pd.DataFrame(data)
        df = df.sort_values('round')
        
        return df
    
    def extract_features(self, df, window=10):
        """특성 추출 (Feature Engineering)"""
        print("\n🔧 특성 추출 중...")
        
        features_list = []
        targets = {f'num{i+1}': [] for i in range(6)}
        
        for idx in range(window, len(df)):
            # 최근 window개 회차 데이터
            recent = df.iloc[idx-window:idx]
            
            # 특성 계산
            features = {}
            
            # 1. 최근 번호들의 빈도
            all_numbers = []
            for _, row in recent.iterrows():
                all_numbers.extend([
                    row['number1'], row['number2'], row['number3'],
                    row['number4'], row['number5'], row['number6']
                ])
            
            # 각 번호별 출현 빈도
            for num in range(1, 46):
                features[f'freq_{num}'] = all_numbers.count(num)
            
            # 2. 통계 특성
            features['mean'] = np.mean(all_numbers)
            features['std'] = np.std(all_numbers)
            features['median'] = np.median(all_numbers)
            
            # 3. 홀짝 비율
            odd_count = sum(1 for n in all_numbers if n % 2 == 1)
            features['odd_ratio'] = odd_count / len(all_numbers)
            
            # 4. 번호 범위 분포
            low_count = sum(1 for n in all_numbers if n <= 15)
            mid_count = sum(1 for n in all_numbers if 16 <= n <= 30)
            high_count = sum(1 for n in all_numbers if n >= 31)
            features['low_ratio'] = low_count / len(all_numbers)
            features['mid_ratio'] = mid_count / len(all_numbers)
            features['high_ratio'] = high_count / len(all_numbers)
            
            # 5. 연속 번호 개수
            sorted_nums = sorted(all_numbers)
            consecutive = 0
            for i in range(len(sorted_nums)-1):
                if sorted_nums[i+1] - sorted_nums[i] == 1:
                    consecutive += 1
            features['consecutive'] = consecutive
            
            features_list.append(features)
            
            # 타겟 값 (다음 회차 번호)
            current = df.iloc[idx]
            for i in range(6):
                targets[f'num{i+1}'].append(current[f'number{i+1}'])
        
        X = pd.DataFrame(features_list)
        y = pd.DataFrame(targets)
        
        print(f"✓ 특성 추출 완료: {X.shape[0]}개 샘플, {X.shape[1]}개 특성")
        
        return X, y
    
    def train_random_forest(self, X, y):
        """Random Forest 모델 학습"""
        print("\n🌲 Random Forest 모델 학습 중...")
        
        # 각 번호 위치별로 별도 모델 학습
        for i in range(1, 7):
            print(f"  - {i}번째 번호 모델 학습 중...")
            
            # 데이터 분할
            X_train, X_test, y_train, y_test = train_test_split(
                X, y[f'num{i}'], test_size=0.2, random_state=42
            )
            
            # 모델 생성 및 학습
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X_train, y_train)
            
            # 평가
            train_score = model.score(X_train, y_train)
            test_score = model.score(X_test, y_test)
            
            print(f"    학습 정확도: {train_score:.3f}, 테스트 정확도: {test_score:.3f}")
            
            self.rf_models[f'num{i}'] = model
        
        print("✓ Random Forest 모델 학습 완료")
    
    def train_xgboost(self, X, y):
        """XGBoost 모델 학습 (회귀 방식)"""
        print("\n⚡ XGBoost 모델 학습 중...")
        
        for i in range(1, 7):
            print(f"  - {i}번째 번호 모델 학습 중...")
            
            # 데이터 분할
            X_train, X_test, y_train, y_test = train_test_split(
                X, y[f'num{i}'], test_size=0.2, random_state=42
            )
            
            # 회귀 모델로 변경 (로또 번호는 1~45 범위의 연속값)
            model = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X_train, y_train)
            
            # 평가 (R² 스코어)
            train_score = model.score(X_train, y_train)
            test_score = model.score(X_test, y_test)
            
            # RMSE 계산
            from sklearn.metrics import mean_squared_error
            train_pred = model.predict(X_train)
            test_pred = model.predict(X_test)
            train_rmse = np.sqrt(mean_squared_error(y_train, train_pred))
            test_rmse = np.sqrt(mean_squared_error(y_test, test_pred))
            
            print(f"    R² 스코어: {test_score:.3f}, RMSE: {test_rmse:.2f}")
            
            self.xgb_models[f'num{i}'] = model
        
        print("✓ XGBoost 모델 학습 완료")
    
    def save_models(self):
        """모델 저장"""
        print("\n💾 모델 저장 중...")
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Random Forest 모델 저장
        rf_path = os.path.join(self.models_dir, f'random_forest_{timestamp}.pkl')
        with open(rf_path, 'wb') as f:
            pickle.dump(self.rf_models, f)
        print(f"✓ Random Forest 모델 저장: {rf_path}")
        
        # XGBoost 모델 저장
        xgb_path = os.path.join(self.models_dir, f'xgboost_{timestamp}.pkl')
        with open(xgb_path, 'wb') as f:
            pickle.dump(self.xgb_models, f)
        print(f"✓ XGBoost 모델 저장: {xgb_path}")
        
        # 최신 모델로 심볼릭 링크 생성
        rf_latest = os.path.join(self.models_dir, 'random_forest_latest.pkl')
        xgb_latest = os.path.join(self.models_dir, 'xgboost_latest.pkl')
        
        if os.path.exists(rf_latest):
            os.remove(rf_latest)
        if os.path.exists(xgb_latest):
            os.remove(xgb_latest)
        
        os.symlink(os.path.basename(rf_path), rf_latest)
        os.symlink(os.path.basename(xgb_path), xgb_latest)
        
        print("✓ 모델 저장 완료")
    
    def train_all(self):
        """전체 훈련 프로세스 실행"""
        print("=" * 70)
        print("  🤖 로또 예측 ML 모델 학습 시작")
        print("=" * 70)
        
        # 1. 데이터 로드
        df = self.load_data(min_rounds=100)
        if df is None:
            return False
        
        # 2. 특성 추출
        X, y = self.extract_features(df, window=10)
        
        # 3. Random Forest 학습
        self.train_random_forest(X, y)
        
        # 4. XGBoost 학습
        self.train_xgboost(X, y)
        
        # 5. 모델 저장
        self.save_models()
        
        print("\n" + "=" * 70)
        print("  🎉 모델 학습 완료!")
        print("=" * 70)
        print("\n📝 다음 단계:")
        print("  1. 모델을 ml-prediction 서비스에 적용")
        print("  2. API 서버 재시작")
        print("  3. 예측 API 테스트")
        print()
        
        return True


def main():
    """메인 함수"""
    
    # DB 연결
    db = Database(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        user=os.getenv('MYSQL_USER', 'lotto_user'),
        password=os.getenv('MYSQL_PASSWORD', '2323'),
        database=os.getenv('MYSQL_DATABASE', 'lotto_db')
    )
    
    # 훈련 시작
    trainer = LottoModelTrainer(db)
    success = trainer.train_all()
    
    if success:
        print("✅ 성공!")
        sys.exit(0)
    else:
        print("❌ 실패!")
        sys.exit(1)


if __name__ == '__main__':
    main()
