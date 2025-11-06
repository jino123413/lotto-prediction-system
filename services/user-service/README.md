# User Service (Spring Boot)

사용자 관리 및 인증을 담당하는 마이크로서비스입니다.

## 빌드 방법

```bash
# Maven을 사용하여 빌드
mvn clean package

# 또는 Docker를 사용
docker build -t user-service .
```

## 주요 기능

- 회원가입/로그인
- JWT 토큰 기반 인증
- Redis 세션 관리
- 예측 이력 관리
- 선호 번호 저장

## API 엔드포인트

- POST /auth/signup - 회원가입
- POST /auth/login - 로그인
- POST /auth/refresh - 토큰 갱신
- GET /user/profile - 프로필 조회
- PUT /user/profile - 프로필 수정
- GET /user/history - 예측 이력
- POST /user/favorite - 선호 번호 저장

## 주의사항

실제 구현을 위해서는 다음 파일들이 추가로 필요합니다:
- Controller, Service, Repository 클래스
- Entity 모델
- Security 설정
- JWT 유틸리티

자세한 구현은 Spring Boot 공식 문서를 참고하세요.
