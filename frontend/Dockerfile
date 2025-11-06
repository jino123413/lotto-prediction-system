# Multi-stage build for production
FROM nginx:alpine

# Nginx 설정 파일 제거
RUN rm /etc/nginx/conf.d/default.conf

# 커스텀 Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/

# 빌드된 파일 복사
COPY dist/ /usr/share/nginx/html/

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
