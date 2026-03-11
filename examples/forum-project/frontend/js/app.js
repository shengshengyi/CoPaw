/**
 * 论坛前端应用
 */

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 模拟数据（后端API未就绪时使用）
const mockPosts = [
    {
        id: '1',
        title: '欢迎来到轻量级论坛！',
        content: '这是论坛的第一篇帖子，欢迎大家交流讨论！',
        authorName: '管理员',
        boardName: '公告通知',
        createdAt: new Date().toISOString(),
        viewCount: 128,
        replyCount: 5
    },
    {
        id: '2',
        title: '如何优化Node.js应用性能？',
        content: '分享一些Node.js性能优化的经验...',
        authorName: '技术达人',
        boardName: '技术交流',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        viewCount: 89,
        replyCount: 12
    },
    {
        id: '3',
        title: '新手求助：数据库设计问题',
        content: '我在设计用户表时遇到了一些问题...',
        authorName: '新手小白',
        boardName: '问答求助',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        viewCount: 45,
        replyCount: 3
    }
];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    setupEventListeners();
});

// 加载帖子列表
async function loadPosts() {
    const postList = document.getElementById('postList');
    
    try {
        // 尝试从API获取数据
        const response = await fetch(`${API_BASE_URL}/posts`);
        
        if (response.ok) {
            const data = await response.json();
            renderPosts(data.data || data.posts || []);
        } else {
            // API不可用，使用模拟数据
            console.log('API不可用，使用模拟数据');
            renderPosts(mockPosts);
        }
    } catch (error) {
        console.error('加载帖子失败:', error);
        // 使用模拟数据
        renderPosts(mockPosts);
    }
}

// 渲染帖子列表
function renderPosts(posts) {
    const postList = document.getElementById('postList');
    
    if (!posts || posts.length === 0) {
        postList.innerHTML = '<div class="loading">暂无帖子</div>';
        return;
    }
    
    postList.innerHTML = posts.map(post => `
        <div class="post-item" data-id="${post.id}">
            <div class="post-title">${escapeHtml(post.title)}</div>
            <div class="post-meta">
                <span>👤 ${escapeHtml(post.authorName || '匿名')}</span>
                <span>📁 ${escapeHtml(post.boardName || '综合讨论')}</span>
                <span>🕐 ${formatTime(post.createdAt)}</span>
                <span>👁️ ${post.viewCount || 0}</span>
                <span>💬 ${post.replyCount || 0}</span>
            </div>
        </div>
    `).join('');
    
    // 添加点击事件
    document.querySelectorAll('.post-item').forEach(item => {
        item.addEventListener('click', () => {
            const postId = item.getAttribute('data-id');
            alert(`查看帖子详情 ID: ${postId}\n（功能开发中）`);
        });
    });
}

// 设置事件监听
function setupEventListeners() {
    // 发布新帖按钮
    document.getElementById('newPostBtn').addEventListener('click', () => {
        alert('发布新帖功能开发中！');
    });
    
    // 版块链接
    document.querySelectorAll('.board-list a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const boardId = link.getAttribute('data-board');
            alert(`切换到版块 ${boardId}\n（功能开发中）`);
        });
    });
}

// 格式化时间
function formatTime(timeString) {
    const date = new Date(timeString);
    const now = new Date();
    const diff = now - date;
    
    // 小于1小时显示分钟
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
    }
    
    // 小于24小时显示小时
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}小时前`;
    }
    
    // 大于24小时显示日期
    return date.toLocaleDateString('zh-CN');
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('🚀 论坛前端已加载');
