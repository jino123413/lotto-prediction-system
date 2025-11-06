# 네트워크 접속 가이드

## 🌐 접속 정보

### 프로덕션 접속 (권장)
- **Frontend**: http://192.168.44.128
- **API**: http://192.168.44.128/api/
- **관리 페이지** (Nginx Proxy Manager): http://192.168.44.128:81

### 개발/직접 접속
- **Frontend (Dev)**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Data Collector**: http://localhost:8001
- **Statistics**: http://localhost:8002
- **ML Prediction**: http://localhost:8003
- **User Service**: http://localhost:8004

---

## 📱 다양한 기기에서 접속하기

### 1. 직접 IP 접속 (가장 간단) ⭐ 권장
```
http://192.168.44.128
```

**장점:**
- ✅ 별도 설정 불필요
- ✅ 모든 기기에서 즉시 접속 가능
- ✅ Windows PC, Mac, 스마트폰 모두 지원

### 2. 도메인 접속 (hosts 파일 설정 필요)
```
http://lotto.local
http://www.lotto.local
```

**장점:**
- ✅ 깔끔한 URL
- ✅ 프로페셔널한 인상

**단점:**
- ⚠️ 기기별로 hosts 파일 설정 필요

---

## 🖥️ Windows PC에서 접속

### 방법 1: IP 직접 사용 (추천)
브라우저 주소창에 입력:
```
http://192.168.44.128
```

### 방법 2: 도메인 사용 (hosts 파일 설정)

1. **관리자 권한으로 메모장 실행**
   - 시작 메뉴에서 "메모장" 검색
   - 마우스 우클릭 → "관리자 권한으로 실행"

2. **hosts 파일 열기**
   - 메모장에서 `파일` → `열기`
   - 파일 경로 입력:
     ```
     C:\Windows\System32\drivers\etc\hosts
     ```
   - 파일 형식을 "모든 파일"로 변경
   - `hosts` 파일 선택 후 열기

3. **맨 아래 추가**
   ```
   # Lotto Prediction System
   192.168.44.128 lotto.local
   192.168.44.128 www.lotto.local
   ```

4. **저장** (Ctrl + S)

5. **DNS 캐시 초기화** (명령 프롬프트 관리자 권한)
   ```cmd
   ipconfig /flushdns
   ```

6. **브라우저에서 접속**
   ```
   http://lotto.local
   ```

---

## 📱 스마트폰에서 접속

### Android / iPhone

1. **같은 WiFi 네트워크에 연결**
   - 서버와 동일한 WiFi 연결

2. **브라우저 열기**
   - Chrome, Safari 등

3. **주소창에 입력**
   ```
   http://192.168.44.128
   ```

**참고:**
- 스마트폰에서 도메인(lotto.local) 사용은 권장하지 않습니다.
- IP 주소로 접속하는 것이 가장 간단합니다.

---

## 🍎 macOS에서 접속

### 방법 1: IP 직접 사용 (추천)
Safari 또는 Chrome에서:
```
http://192.168.44.128
```

### 방법 2: 도메인 사용 (hosts 파일 설정)

1. **터미널 열기**

2. **hosts 파일 편집**
   ```bash
   sudo nano /etc/hosts
   ```

3. **맨 아래 추가**
   ```
   # Lotto Prediction System
   192.168.44.128 lotto.local
   192.168.44.128 www.lotto.local
   ```

4. **저장 및 종료**
   - `Ctrl + O` (저장)
   - `Enter`
   - `Ctrl + X` (종료)

5. **DNS 캐시 초기화**
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

6. **브라우저에서 접속**
   ```
   http://lotto.local
   ```

---

## 🔥 방화벽 설정 (Linux 서버)

다른 기기에서 접속이 안 된다면 방화벽 확인:

```bash
# UFW 상태 확인
sudo ufw status

# 포트 80 허용
sudo ufw allow 80/tcp

# 또는 특정 네트워크에서만 허용
sudo ufw allow from 192.168.44.0/24 to any port 80

# NPM 관리 페이지 (포트 81) 허용
sudo ufw allow 81/tcp
```

---

## ✅ 접속 테스트

### 서버에서 테스트
```bash
# localhost
curl http://localhost

# 127.0.0.1
curl http://127.0.0.1

# 실제 IP
curl http://192.168.44.128

# 도메인 (hosts 설정 후)
curl http://lotto.local
```

### 다른 기기에서 테스트
브라우저에서:
```
http://192.168.44.128
```

---

## 🌐 접속 URL 정리

| 용도 | URL | 설명 |
|------|-----|------|
| **Frontend** | http://192.168.44.128 | 메인 웹 페이지 |
| **API** | http://192.168.44.128/api/ | API 엔드포인트 |
| **NPM** | http://192.168.44.128:81 | Nginx Proxy Manager 관리 |
| **도메인 (선택)** | http://lotto.local | hosts 파일 설정 후 사용 |

---

## 🔧 문제 해결

### 1. "사이트에 연결할 수 없음"
- 같은 WiFi/네트워크에 연결되어 있는지 확인
- 서버가 실행 중인지 확인:
  ```bash
  docker ps
  ```
- 방화벽 설정 확인

### 2. "연결 시간 초과"
```bash
# Linux 서버에서 방화벽 확인
sudo ufw status

# 포트 80 허용
sudo ufw allow 80/tcp
```

### 3. Windows에서 hosts 파일 저장 안 됨
- 관리자 권한으로 메모장 실행 확인
- 바이러스 백신 프로그램의 hosts 파일 보호 기능 확인
- Windows Defender에서 제외 추가

### 4. DNS 캐시 문제

**Windows:**
```cmd
ipconfig /flushdns
```

**Linux:**
```bash
sudo systemd-resolve --flush-caches
```

**macOS:**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### 5. 브라우저 캐시 문제
- `Ctrl + Shift + Delete`로 캐시 삭제
- 또는 시크릿/프라이빗 모드로 테스트
- 하드 새로고침: `Ctrl + F5` (Windows) 또는 `Cmd + Shift + R` (Mac)

---

## 📝 보안 참고사항

- 이 설정은 **로컬 네트워크 내에서만** 작동합니다
- 외부 인터넷에서는 접속할 수 없습니다 (안전)
- 프로덕션 배포 시에는:
  - 실제 도메인 구매 및 DNS 설정
  - HTTPS/SSL 인증서 적용
  - 방화벽 및 보안 설정 강화

---

## 🎯 권장 사용 방법

### 개발/테스트 단계
- **IP 직접 사용** (`192.168.44.128`)
  - 간단하고 빠름
  - 모든 기기에서 즉시 접속 가능
  - 설정 불필요

### 데모/프레젠테이션
- **도메인 사용** (`lotto.local`)
  - 깔끔한 URL
  - 프로페셔널한 인상
  - hosts 파일 설정 필요

---

## 📞 추가 도움말

더 자세한 정보는 다음 문서를 참고하세요:
- [시작 가이드](GETTING_STARTED.md)
- [개발 계획서](DEVELOPMENT_PLAN.md)
- [NPM 설정](NGINX_PROXY_MANAGER_SETUP.md)

---

**최종 업데이트**: 2025-11-07  
**버전**: 1.0
