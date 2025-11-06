# Hosts 파일 설정 가이드

## 🌐 네트워크 IP 사용 (권장)

**서버 IP: 192.168.44.128**

이 IP를 사용하면:
- ✅ 같은 네트워크의 다른 기기에서 접속 가능
- ✅ Windows PC, Mac, 스마트폰 등 모든 기기 접속
- ✅ 실제 프로덕션 환경과 유사한 테스트 가능

## 🖥️ Linux / macOS

### hosts 파일 위치
```
/etc/hosts
```

### 설정 방법 (네트워크 접속용)
```bash
sudo nano /etc/hosts
```

또는

```bash
sudo tee -a /etc/hosts << EOF

# Lotto Prediction System - Network Access
192.168.44.128 lotto.local
192.168.44.128 www.lotto.local
EOF
```

### 로컬 전용 설정 (선택)
```bash
# Lotto Prediction System - Local Only
127.0.0.1 lotto.local
127.0.0.1 www.lotto.local
```

## 🪟 Windows

### hosts 파일 위치
```
C:\Windows\System32\drivers\etc\hosts
```

### 설정 방법

1. **관리자 권한으로 메모장 실행**
   - 시작 메뉴에서 "메모장" 검색
   - 마우스 우클릭 → "관리자 권한으로 실행"

2. **파일 열기**
   - 메모장에서 `파일` → `열기`
   - 파일 경로에 다음 입력:
     ```
     C:\Windows\System32\drivers\etc\hosts
     ```
   - 파일 형식을 "모든 파일"로 변경
   - `hosts` 파일 선택 후 열기

3. **아래 내용 추가 (네트워크 접속용)**
   ```
   # Lotto Prediction System
   192.168.44.128 lotto.local
   192.168.44.128 www.lotto.local
   ```
   
   또는 로컬 전용:
   ```
   127.0.0.1 lotto.local
   127.0.0.1 www.lotto.local
   ```

4. **저장** (Ctrl + S)

5. **DNS 캐시 초기화** (명령 프롬프트 관리자 권한)
   ```cmd
   ipconfig /flushdns
   ```

## ✅ 설정 확인

### 1. Ping 테스트
```bash
ping lotto.local
```

응답이 `127.0.0.1`에서 와야 합니다.

### 2. 웹 브라우저 접속
```
http://lotto.local
```

## 🌐 접속 URL

### Nginx 프록시를 통한 접속 (권장)
- **Frontend**: http://lotto.local
- **API**: http://lotto.local/api/
- **헬스 체크**: http://lotto.local/health

### 직접 접속 (개발/디버깅용)
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Data Collector**: http://localhost:8001
- **Statistics**: http://localhost:8002
- **ML Prediction**: http://localhost:8003
- **User Service**: http://localhost:8004

## 🔧 문제 해결

### Windows에서 hosts 파일이 저장되지 않는 경우
1. 바이러스 백신 프로그램에서 hosts 파일 보호 기능 확인
2. Windows Defender에서 제외 추가
3. 관리자 권한으로 실행 확인

### DNS 캐시 문제
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
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

### 브라우저 캐시 문제
- Ctrl + Shift + Delete로 캐시 삭제
- 또는 시크릿/프라이빗 모드로 테스트

## 📝 주의사항

1. hosts 파일 수정은 시스템 전체에 영향을 줍니다.
2. 개발 완료 후 추가한 라인을 삭제하거나 주석 처리하세요.
3. 프로덕션 환경에서는 실제 도메인과 DNS를 사용하세요.
