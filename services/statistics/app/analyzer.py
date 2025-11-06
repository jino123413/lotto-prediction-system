import numpy as np
import pandas as pd
from collections import Counter
import logging

logger = logging.getLogger(__name__)


class StatisticsAnalyzer:
    def __init__(self, database, cache):
        self.db = database
        self.cache = cache
    
    def analyze_frequency(self):
        """빈도 분석"""
        try:
            # 모든 번호 조회
            data = self.db.get_all_numbers()
            
            if not data:
                return {"success": False, "error": "데이터 없음"}
            
            # 번호 수집
            all_numbers = []
            for row in data:
                all_numbers.extend([
                    row['number1'], row['number2'], row['number3'],
                    row['number4'], row['number5'], row['number6']
                ])
            
            # 빈도 계산
            counter = Counter(all_numbers)
            
            # 전체 번호 빈도 (1-45번 모두)
            hot_numbers = [{"number": num, "count": count} 
                          for num, count in counter.most_common()]
            
            # 하위 10개 (Cold Numbers)
            cold_numbers = [{"number": num, "count": count} 
                           for num, count in counter.most_common()[-10:]]
            
            # 전체 빈도
            frequency = {num: counter.get(num, 0) for num in range(1, 46)}
            
            return {
                "success": True,
                "total_draws": len(data),
                "hot_numbers": hot_numbers,
                "cold_numbers": cold_numbers,
                "frequency": frequency
            }
        except Exception as e:
            logger.error(f"빈도 분석 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def analyze_patterns(self):
        """패턴 분석"""
        try:
            data = self.db.get_all_numbers()
            
            if not data:
                return {"success": False, "error": "데이터 없음"}
            
            # 패턴 통계
            odd_even_ratios = []
            consecutive_counts = []
            sum_values = []
            
            for row in data:
                numbers = sorted([
                    row['number1'], row['number2'], row['number3'],
                    row['number4'], row['number5'], row['number6']
                ])
                
                # 홀짝 비율
                odd_count = sum(1 for n in numbers if n % 2 == 1)
                odd_even_ratios.append({"odd": odd_count, "even": 6 - odd_count})
                
                # 연속 번호
                consecutive = sum(1 for i in range(len(numbers)-1) 
                                if numbers[i+1] - numbers[i] == 1)
                consecutive_counts.append(consecutive)
                
                # 합계
                sum_values.append(sum(numbers))
            
            return {
                "success": True,
                "odd_even_ratio": {
                    "avg_odd": float(np.mean([r["odd"] for r in odd_even_ratios])),
                    "avg_even": float(np.mean([r["even"] for r in odd_even_ratios]))
                },
                "consecutive_avg": float(np.mean(consecutive_counts)),
                "sum_stats": {
                    "mean": float(np.mean(sum_values)),
                    "std": float(np.std(sum_values)),
                    "min": int(np.min(sum_values)),
                    "max": int(np.max(sum_values))
                }
            }
        except Exception as e:
            logger.error(f"패턴 분석 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def get_statistics(self):
        """통계 지표"""
        try:
            data = self.db.get_all_numbers()
            
            if not data:
                return {"success": False, "error": "데이터 없음"}
            
            all_numbers = []
            for row in data:
                all_numbers.extend([
                    row['number1'], row['number2'], row['number3'],
                    row['number4'], row['number5'], row['number6']
                ])
            
            return {
                "success": True,
                "total_rounds": len(data),
                "total_numbers": len(all_numbers),
                "mean": float(np.mean(all_numbers)),
                "median": float(np.median(all_numbers)),
                "std": float(np.std(all_numbers)),
                "variance": float(np.var(all_numbers)),
                "min": int(np.min(all_numbers)),
                "max": int(np.max(all_numbers))
            }
        except Exception as e:
            logger.error(f"통계 조회 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def analyze_trends(self, limit=10):
        """추이 분석"""
        try:
            recent = self.db.get_recent_numbers(limit)
            all_data = self.db.get_all_numbers()
            
            if not recent or not all_data:
                return {"success": False, "error": "데이터 없음"}
            
            # 최근 번호 빈도
            recent_numbers = []
            for row in recent:
                recent_numbers.extend([
                    row['number1'], row['number2'], row['number3'],
                    row['number4'], row['number5'], row['number6']
                ])
            
            recent_counter = Counter(recent_numbers)
            
            # 전체 번호 빈도
            all_numbers = []
            for row in all_data:
                all_numbers.extend([
                    row['number1'], row['number2'], row['number3'],
                    row['number4'], row['number5'], row['number6']
                ])
            
            all_counter = Counter(all_numbers)
            
            # 비교
            trends = []
            for num in range(1, 46):
                recent_freq = recent_counter.get(num, 0)
                all_freq = all_counter.get(num, 0) / len(all_data) * limit
                
                trends.append({
                    "number": num,
                    "recent_count": recent_freq,
                    "expected_count": round(all_freq, 2),
                    "difference": round(recent_freq - all_freq, 2)
                })
            
            return {
                "success": True,
                "limit": limit,
                "trends": sorted(trends, key=lambda x: x['difference'], reverse=True)[:20]
            }
        except Exception as e:
            logger.error(f"추이 분석 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def generate_heatmap(self):
        """히트맵 데이터 생성 (5x9 그리드)"""
        try:
            data = self.db.get_all_numbers()
            
            if not data:
                return {"success": False, "error": "데이터 없음"}
            
            # 빈도 계산
            all_numbers = []
            for row in data:
                all_numbers.extend([
                    row['number1'], row['number2'], row['number3'],
                    row['number4'], row['number5'], row['number6']
                ])
            
            counter = Counter(all_numbers)
            
            # 5x9 그리드 생성 (1-45)
            heatmap = []
            for row in range(5):
                row_data = []
                for col in range(9):
                    num = row * 9 + col + 1
                    if num <= 45:
                        row_data.append({
                            "number": num,
                            "count": counter.get(num, 0)
                        })
                    else:
                        row_data.append(None)
                heatmap.append(row_data)
            
            return {
                "success": True,
                "heatmap": heatmap,
                "max_count": max(counter.values()) if counter else 0,
                "min_count": min(counter.values()) if counter else 0
            }
        except Exception as e:
            logger.error(f"히트맵 생성 오류: {e}")
            return {"success": False, "error": str(e)}
