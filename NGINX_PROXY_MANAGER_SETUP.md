# Nginx Proxy Manager 설정 가이드

## 🎯 Nginx Proxy Manager란?

웹 기반 GUI를 통해 Nginx 역방향 프록시를 쉽게 관리할 수 있는 도구입니다.

**주요 기능:**
- ✅ 웹 GUI로 쉬운 관리
- ✅ SSL 인증서 자동 발급 (Let's Encrypt)
- ✅ 실시간 로그 확인
- ✅ Access List (접근 제어)
- ✅ Custom Nginx 설정 추가 가능

## 📦 설치 방법

### 1. 기존 Nginx 중지

```bash
cd /home/jh/lotto-prediction-system
docker stop nginx-proxy
docker rm nginx-proxy
```

### 2. Nginx Proxy Manager로 전환

```bash
# 기존 docker-compose.yml 백업
cp docker-compose.yml docker-compose-old.yml

# 새로운 설정으로 교체
cp docker-compose-with-npm.yml docker-compose.yml

# 실행
docker-compose up -d nginx-proxy-manager
```

### 3. 관리 페이지 접속

브라우저에서:
```
http://192.168.44.128:81
```

**기본 로그인 정보:**
- Email: `admin@example.com`
- Password: `changeme`

⚠️ **첫 로그인 후 반드시 비밀번호를 변경하세요!**

## ⚙️ 프록시 호스트 설정

### Frontend 설정

1. **Dashboard** → **Proxy Hosts** → **Add Proxy Host**

2. **Details 탭:**
   - Domain Names: `lotto.local`, `192.168.44.128`
   - Scheme: `http`
   - Forward Hostname / IP: `frontend-app`
   - Forward Port: `80`
   - ✅ Cache Assets
   - ✅ Block Common Exploits
   - ✅ Websockets Support

3. **Save** 클릭

### API Gateway 설정 (Location 추가)

Frontend 호스트 수정:

1. **Edit** (연필 아이콘)
2. **Custom locations** 탭
3. **Add location** 클릭:
   - Define location: `/api`
   - Scheme: `http`
   - Forward Hostname / IP: `api-gateway`
   - Forward Port: `8000`
   - ✅ Websockets Support

4. **Save** 클릭

### SSL 인증서 설정 (선택 사항)

실제 도메인이 있다면:

1. **SSL Certificates** → **Add SSL Certificate**
2. **Let's Encrypt** 선택
3. Domain Names 입력
4. Email 입력
5. ✅ I Agree to the Let's Encrypt Terms of Service
6. **Save**

## 🔧 고급 설정

### Custom Nginx Configuration

프록시 호스트 편집 → **Advanced** 탭:

```nginx
# API 타임아웃 증가
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

# 요청 크기 제한
client_max_body_size 10M;

# 압축 활성화
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### Access List 설정 (접근 제어)

특정 IP만 허용:

1. **Access Lists** → **Add Access List**
2. Name: `Internal Only`
3. **Authorization** 탭:
   - 만족 조건: Pass
   - Allow: `192.168.44.0/24`
4. **Save**

프록시 호스트에 적용:
- 프록시 호스트 편집 → **Access List** 선택

## 📊 로그 확인

프록시 호스트 목록에서 **View Logs** 아이콘 클릭
- 실시간 접속 로그
- 에러 로그

## 🔄 마이그레이션 체크리스트

기존 설정에서 Nginx Proxy Manager로 전환:

- [ ] 기존 nginx-proxy 컨테이너 중지
- [ ] Nginx Proxy Manager 시작
- [ ] Frontend 프록시 호스트 추가
- [ ] API Gateway location 추가
- [ ] 테스트: http://192.168.44.128
- [ ] 테스트: http://192.168.44.128/api/health
- [ ] 기본 비밀번호 변경
- [ ] (선택) SSL 인증서 설정

## 🧪 테스트

```bash
# 1. Frontend
curl http://192.168.44.128/

# 2. API
curl http://192.168.44.128/api/health

# 3. Data Collector
curl http://192.168.44.128/api/data/latest

# 4. Statistics
curl http://192.168.44.128/api/stats/frequency?limit=3
```

## ⚡ 빠른 시작 (전체 과정)

```bash
cd /home/jh/lotto-prediction-system

# 1. 기존 nginx 중지
docker stop nginx-proxy
docker rm nginx-proxy

# 2. Nginx Proxy Manager 시작
docker-compose -f docker-compose-with-npm.yml up -d nginx-proxy-manager

# 3. 관리 페이지 접속
# http://192.168.44.128:81
# Email: admin@example.com
# Password: changeme

# 4. 비밀번호 변경 후 프록시 호스트 설정
```

## 🎯 권장 사항

**현재 방식 유지:**
- 간단한 개발/테스트 환경
- 설정 파일로 관리하고 싶은 경우
- 가벼운 시스템 선호

**Nginx Proxy Manager 사용:**
- ✅ 프로덕션 환경
- ✅ SSL 인증서 필요
- ✅ 여러 도메인/호스트 관리
- ✅ 비개발자도 설정 수정 필요
- ✅ 웹 GUI 선호

## 🔗 참고 자료

- 공식 문서: https://nginxproxymanager.com/
- GitHub: https://github.com/NginxProxyManager/nginx-proxy-manager
- Docker Hub: https://hub.docker.com/r/jc21/nginx-proxy-manager
