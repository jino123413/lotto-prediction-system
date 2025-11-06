# 네트워크 접속 가이드

## 🌐 서버 정보

**서버 IP**: `192.168.44.128`  
**네트워크**: 192.168.44.0/24 (같은 네트워크 내 모든 기기 접속 가능)

## 📱 다양한 기기에서 접속하기

### 1. 직접 IP 접속 (hosts 설정 불필요)
```
http://192.168.44.128
```

모든 기기에서 바로 접속 가능!

### 2. 도메인 접속 (hosts 파일 설정 필요)
```
http://lotto.local
http://www.lotto.local
```

## 🖥️ Windows PC에서 접속

### 방법 1: IP 직접 사용 (간단)
브라우저에 입력:
```
http://192.168.44.128
```

### 방법 2: 도메인 사용 (hosts 파일 설정)
1. 관리자 권한으로 메모장 실행
2. `C:\Windows\System32\drivers\etc\hosts` 파일 열기
3. 맨 아래 추가:
   ```
   192.168.44.128 lotto.local
   192.168.44.128 www.lotto.local
   ```
4. 저장 후 DNS 캐시 초기화:
   ```cmd
   ipconfig /flushdns
   ```
5. 브라우저에서 접속:
   ```
   http://lotto.local
   ```

## 📱 스마트폰에서 접속

### Android / iPhone
1. 같은 WiFi 네트워크에 연결
2. 브라우저 열기
3. 주소창에 입력:
   ```
   http://192.168.44.128
   ```

## 🍎 macOS에서 접속

### 방법 1: IP 직접 사용
Safari 또는 Chrome에서:
```
http://192.168.44.128
```

### 방법 2: 도메인 사용 (hosts 파일 설정)
터미널에서:
```bash
sudo nano /etc/hosts
```

추가:
```
192.168.44.128 lotto.local
192.168.44.128 www.lotto.local
```

저장 후 (Ctrl+O, Enter, Ctrl+X):
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

## 🔥 방화벽 설정 (Linux 서버)

다른 기기에서 접속이 안 된다면:

```bash
# 포트 80 열기
sudo ufw allow 80/tcp

# 또는 특정 네트워크에서만 허용
sudo ufw allow from 192.168.44.0/24 to any port 80
```

## ✅ 접속 테스트

### 서버에서 테스트
```bash
# localhost
curl http://localhost/health

# 127.0.0.1
curl http://127.0.0.1/health

# 실제 IP
curl http://192.168.44.128/health

# 도메인 (hosts 설정 후)
curl http://lotto.local/health
```

모두 `healthy` 응답이 나와야 함!

### 다른 기기에서 테스트
브라우저에서:
```
http://192.168.44.128/health
```

`healthy` 텍스트가 표시되면 성공!

## 🌐 접속 URL 정리

| 용도 | URL | 설명 |
|------|-----|------|
| **Frontend** | http://192.168.44.128 | 메인 웹 페이지 |
| **API** | http://192.168.44.128/api/ | API 엔드포인트 |
| **Health** | http://192.168.44.128/health | 상태 확인 |

## 🔧 문제 해결

### 1. "사이트에 연결할 수 없음"
- 같은 WiFi/네트워크에 연결되어 있는지 확인
- 서버가 실행 중인지 확인: `docker ps`
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

## 📝 보안 참고사항

- 이 설정은 **로컬 네트워크 내에서만** 작동합니다
- 외부 인터넷에서는 접속할 수 없습니다 (안전)
- 프로덕션 배포 시에는 실제 도메인과 HTTPS를 사용하세요

## 🎯 권장 사용 방법

1. **개발/테스트 단계**: IP 직접 사용 (`192.168.44.128`)
   - 간단하고 빠름
   - 모든 기기에서 즉시 접속 가능

2. **데모/프레젠테이션**: 도메인 사용 (`lotto.local`)
   - 깔끔한 URL
   - 프로페셔널한 인상
   - hosts 파일 설정 필요
