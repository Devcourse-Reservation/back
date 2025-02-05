# 1. Node.js 최신 LTS 버전 사용
FROM node:20

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. package.json과 package-lock.json 복사
COPY package*.json ./

# 4. 패키지 설치 (npm ci 대신 npm install 사용)
RUN npm install

# 5. 모든 소스 코드 복사
COPY . .

# 6. 포트 설정 (Express 기본 포트)
EXPOSE 4000

# 7. 앱 실행
CMD ["node", "app.js"]
