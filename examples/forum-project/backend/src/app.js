const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');

// 路由导入
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const boardsRoutes = require('./routes/boards');

const app = express();
const PORT = process.env.PORT || 3000;

// 基础中间件
app.use(helmet()); // 安全头部
app.use(cors());   // 跨域支持
app.use(morgan('dev')); // 请求日志
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码解析

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/boards', boardsRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: '请求的资源不存在' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || '服务器内部错误'
  });
});

// 数据库连接并启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 同步模型（开发环境使用，生产环境建议使用迁移）
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库模型同步完成');
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📋 API文档: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error.message);
    process.exit(1);
  }
};

// 启动
startServer();

module.exports = app;
