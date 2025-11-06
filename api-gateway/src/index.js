const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// 서비스 URL
const SERVICES = {
    dataCollector: process.env.DATA_COLLECTOR_URL || 'http://data-collector-service:8001',
    statistics: process.env.STATISTICS_URL || 'http://statistics-service:8002',
    mlPrediction: process.env.ML_PREDICTION_URL || 'http://ml-prediction-service:8003',
    userService: process.env.USER_SERVICE_URL || 'http://user-service:8004'
};

// 헬스 체크
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'api-gateway' });
});

// 인증 미들웨어 (간단한 버전)
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token && req.path.includes('/auth/')) {
        return next(); // 로그인/회원가입은 인증 불필요
    }
    
    // TODO: JWT 검증 로직
    // 현재는 모든 요청 허용 (개발 모드)
    next();
};

// 프록시 헬퍼 함수
const proxyRequest = async (req, res, serviceUrl, keepApiPrefix = false) => {
    try {
        // originalUrl 사용하여 전체 경로 확인
        const originalPath = req.originalUrl.split('?')[0]; // 쿼리 스트링 제거
        
        let targetPath;
        if (keepApiPrefix) {
            // User Service용: /api 경로 유지
            targetPath = originalPath;
        } else {
            // 다른 서비스용: /api/xxx/ 제거
            targetPath = originalPath.replace(/^\/api\/[^/]+/, '');
        }
        
        const targetUrl = `${serviceUrl}${targetPath}`;
        
        console.log(`[PROXY] ${req.method} ${originalPath} → ${targetUrl}`);
        
        // JWT에서 username 추출
        let username = 'guest';
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.decode(token);
                if (decoded && decoded.sub) {
                    username = decoded.sub;
                }
            } catch (err) {
                console.error('JWT 디코딩 실패:', err.message);
            }
        }
        
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.body,
            params: req.query,
            headers: {
                'Content-Type': 'application/json',
                // JWT 토큰 전달
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
                // username 헤더 추가
                'username': username
            }
        });
        
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`[PROXY ERROR] ${req.originalUrl} → ${error.message}`);
        
        if (error.response) {
            console.error(`[PROXY ERROR] Status: ${error.response.status}`);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({
                success: false,
                error: '서비스 연결 실패',
                message: error.message
            });
        }
    }
};

// 라우팅 (User Service는 /api 경로 유지)
app.use('/api/auth/*', authenticate, (req, res) => {
    proxyRequest(req, res, SERVICES.userService, true);
});

app.use('/api/predictions*', authenticate, (req, res) => {
    proxyRequest(req, res, SERVICES.userService, true);
});

app.use('/api/user/*', authenticate, (req, res) => {
    proxyRequest(req, res, SERVICES.userService, true);
});

// 다른 서비스는 /api 경로 제거
app.use('/api/data/*', authenticate, (req, res) => {
    proxyRequest(req, res, SERVICES.dataCollector, false);
});

app.use('/api/stats/*', authenticate, (req, res) => {
    proxyRequest(req, res, SERVICES.statistics, false);
});

app.use('/api/predict/*', authenticate, (req, res) => {
    proxyRequest(req, res, SERVICES.mlPrediction, false);
});

// 404 핸들러
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error('에러:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log('서비스 URL:');
    console.log(`  - Data Collector: ${SERVICES.dataCollector}`);
    console.log(`  - Statistics: ${SERVICES.statistics}`);
    console.log(`  - ML Prediction: ${SERVICES.mlPrediction}`);
    console.log(`  - User Service: ${SERVICES.userService}`);
});
