/**
 * 版块路由
 */

const express = require('express');
const router = express.Router();

// 模拟版块数据
const mockBoards = [
  { id: '1', name: '综合讨论', description: '论坛综合话题讨论区', icon: '💬', sortOrder: 1, postCount: 156 },
  { id: '2', name: '技术交流', description: '技术问题讨论和经验分享', icon: '💻', sortOrder: 2, postCount: 89 },
  { id: '3', name: '问答求助', description: '遇到问题可以在这里提问', icon: '❓', sortOrder: 3, postCount: 234 },
  { id: '4', name: '公告通知', description: '论坛官方公告和通知', icon: '📢', sortOrder: 0, postCount: 12 }
];

// 获取版块列表
router.get('/', (req, res) => {
  try {
    const boards = mockBoards.sort((a, b) => a.sortOrder - b.sortOrder);
    res.json({
      success: true,
      data: boards,
      total: boards.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取版块详情
router.get('/:id', (req, res) => {
  try {
    const board = mockBoards.find(b => b.id === req.params.id);
    if (!board) {
      return res.status(404).json({ success: false, error: '版块不存在' });
    }
    res.json({ success: true, data: board });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取版块下的帖子
router.get('/:id/posts', (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const boardId = req.params.id;
    
    // 这里应该从数据库查询，暂时返回模拟数据
    const mockPosts = [
      {
        id: '1',
        title: '欢迎来到' + mockBoards.find(b => b.id === boardId)?.name || '版块',
        content: '这是版块的第一篇帖子',
        authorId: '123456',
        authorName: 'testuser',
        boardId: boardId,
        createdAt: new Date().toISOString(),
        viewCount: 50,
        replyCount: 3
      }
    ];
    
    res.json({
      success: true,
      data: mockPosts,
      total: mockPosts.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
