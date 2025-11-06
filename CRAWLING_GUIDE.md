# 로또 데이터 크롤링 가이드

## 📁 크롤링 스크립트

### 1. `crawl-lotto.sh` (추천) ⭐
**Docker 컨테이너를 통한 크롤링 - 가장 안정적**

```bash
# 위치: /home/jh/lotto-prediction-system/crawl-lotto.sh

# 최신 회차 1개 크롤링
./crawl-lotto.sh

# 특정 회차 크롤링 (예: 1196회)
./crawl-lotto.sh 1196

# 범위 크롤링 (예: 1180회 ~ 1196회)
./crawl-lotto.sh 1180 1196

# 전체 과거 데이터 크롤링 (1회 ~ 최신)
./crawl-lotto.sh 1 1196
```

### 2. `crawl_manual.py` (선택)
**로컬 Python 환경에서 직접 실행**

```bash
# 위치: /home/jh/lotto-prediction-system/services/data-collector/crawl_manual.py

cd services/data-collector

# 최신 회차 1개 크롤링
python3 crawl_manual.py

# 특정 회차 크롤링
python3 crawl_manual.py 1196

# 범위 크롤링
python3 crawl_manual.py 1180 1196
```

**주의**: Python 환경에 필요한 패키지가 설치되어 있어야 합니다:
```bash
pip install requests beautifulsoup4 mysql-connector-python
```

---

## 🚀 빠른 사용 예시

### 최신 데이터 업데이트
```bash
cd /home/jh/lotto-prediction-system
./crawl-lotto.sh
```

### 최근 20회차 수집
```bash
./crawl-lotto.sh 1177 1196
```

### 전체 데이터 수집 (처음부터 끝까지)
```bash
# 주의: 약 20분 소요 (1196회차 * 1초)
./crawl-lotto.sh 1 1196
```

---

## 📊 크롤링 후 확인

### 데이터 개수 확인
```bash
mysql -u lotto_user -p2323 lotto_db -e "SELECT COUNT(*) FROM lotto_numbers;"
```

### 최신 5회차 확인
```bash
mysql -u lotto_user -p2323 lotto_db -e "
SELECT round, draw_date, number1, number2, number3, number4, number5, number6, bonus_number 
FROM lotto_numbers 
ORDER BY round DESC 
LIMIT 5;
"
```

### API로 확인
```bash
curl http://localhost:8001/stats/count
curl http://localhost:8001/latest?limit=5
```

---

## ⚠️ 주의사항

1. **서버 부하 방지**
   - 크롤링 간격: 1회당 1초 대기
   - 대량 크롤링 시 시간이 오래 걸립니다

2. **중복 방지**
   - 이미 존재하는 회차는 자동으로 업데이트됩니다
   - 같은 회차를 여러 번 크롤링해도 안전합니다

3. **에러 처리**
   - 크롤링 실패 시 자동으로 건너뛰고 다음 회차로 진행
   - 실패한 회차 목록이 출력됩니다

4. **Docker 필요**
   - `crawl-lotto.sh`는 Docker 컨테이너가 실행 중이어야 합니다
   - `docker ps | grep data-collector`로 확인

---

## 🔧 문제 해결

### Docker 컨테이너가 없는 경우
```bash
cd /home/jh/lotto-prediction-system
sudo docker-compose -f docker-compose-simple.yml up -d data-collector-service
```

### Python 패키지 없는 경우 (crawl_manual.py)
```bash
cd services/data-collector
pip install -r requirements.txt
```

### 권한 오류
```bash
chmod +x crawl-lotto.sh
chmod +x services/data-collector/crawl_manual.py
```

---

## 📈 자동화 (선택사항)

### 매주 토요일 자동 크롤링 (cron)
```bash
# crontab -e
0 22 * * 6 cd /home/jh/lotto-prediction-system && ./crawl-lotto.sh >> /var/log/lotto-crawl.log 2>&1
```

**설명**: 매주 토요일 밤 10시에 최신 회차 크롤링

---

## 🎯 추천 사용 시나리오

### 1. 초기 데이터 수집
```bash
# 전체 데이터 한 번에 수집 (약 20분)
./crawl-lotto.sh 1 1196
```

### 2. 매주 업데이트
```bash
# 매주 토요일 저녁에 실행
./crawl-lotto.sh
```

### 3. 누락된 데이터 보충
```bash
# 특정 범위만 다시 크롤링
./crawl-lotto.sh 100 200
```

---

**작성일**: 2024-11-05  
**버전**: 1.0
