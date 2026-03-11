/**
 * 轻量级论坛系统 - 简化版后端（无数据库依赖）
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 模拟数据
const mockPosts = [
    {
        id: '1',
        title: '欢迎来到轻量级论坛！',
        content: '这是论坛的第一篇帖子，欢迎大家交流讨论！',
        authorId: '1',
        authorName: '管理员',
        boardId: '1',
        boardName: '公告通知',
        createdAt: new Date().toISOString(),
        viewCount: 128,
        replyCount: 5
    },
    {
        id: '2',
        title: '如何优化Node.js应用性能？',
        content: '分享一些Node.js性能优化的经验...',
        authorId: '2',
        authorName: '技术达人',
        boardId: '2',
        boardName: '技术交流',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        viewCount: 89,
        replyCount: 12
    }
];

const mockBoards = [
    { id: '1', name: '公告通知', description: '论坛官方公告和通知', icon: '📢', postCount: 12 },
    { id: '2', name: '技术交流', description: '技术问题讨论和经验分享', icon: '💻', postCount: 89 },
    { id: '3', name: '问答求助', description: '遇到问题可以在这里提问', icon: '❓', postCount: 234 },
    { id: '4', name: '综合讨论', description: '论坛综合话题讨论区', icon: '💬', postCount: 156 }
];

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 获取帖子列表
app.get('/api/posts', (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    res.json({
        success: true,
        data: mockPosts,
        total: mockPosts.length,
        page: parseInt(page),
        limit: parseInt(limit)
    });
});

// 获取帖子详情
app.get('/api/posts/:id', (req, res) => {
    const post = mockPosts.find(p => p.id === req.params.id);
    if (!post) {
        return res.status(404).json({ success: false, error: '帖子不存在' });
    }
    res.json({ success: true, data: post });
});

// 获取版块列表
app.get('/api/boards', (req, res) => {
    res.json({ success: true, data: mockBoards });
});

// 用户注册
app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    res.json({
        success: true,
        message: '注册成功',
        user: { id: '123', username, email }
    });
});

// 用户登录
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    res.json({
        success: true,
        message: '登录成功',
        token: 'mock-jwt-token',
        user: { id: '1', username: '管理员', email }
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
});

// 启动服务
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`💓 健康检查: http://localhost:${PORT}/health`);
    console.log(`📚 API: http://localhost:${PORT}/api/posts`);
});
