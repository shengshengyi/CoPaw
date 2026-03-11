const express = require('express');
const router = express.Router();

// 模拟帖子数据（实际应从数据库获取）
let mockPosts = [
  {
    id: '1',
    title: '欢迎来到论坛',
    content: '这是论坛的第一篇帖子，欢迎大家交流讨论！',
    authorId: '123456',
    authorName: 'testuser',
    boardId: '1',
    boardName: '综合讨论',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    viewCount: 100,
    replyCount: 5,
    isPinned: false,
    isLocked: false
  },
  {
    id: '2',
    title: '技术分享：如何优化代码',
    content: '分享一些代码优化的经验和技巧...',
    authorId: '789012',
    authorName: 'techuser',
    boardId: '2',
    boardName: '技术交流',
    createdAt: new Date('2024-01-16').toISOString(),
    updatedAt: new Date('2024-01-16').toISOString(),
    viewCount: 50,
    replyCount: 3,
    isPinned: true,
    isLocked: false
  },
  {
    id: '3',
    title: '新手求助',
    content: '请问如何发布新帖子？',
    authorId: '345678',
    authorName: 'newuser',
    boardId: '1',
    boardName: '综合讨论',
    createdAt: new Date('2024-01-17').toISOString(),
    updatedAt: new Date('2024-01-17').toISOString(),
    viewCount: 20,
    replyCount: 1,
    isPinned: false,
    isLocked: false
  }
];

/**
 * 认证中间件 - 验证用户是否登录
 * 从请求头中获取Authorization token
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '请先登录' });
  }

  const token = authHeader.substring(7);
  
  // TODO: 验证JWT token
  // const decoded = jwt.verify(token, JWT_SECRET);
  // req.user = decoded;
  
  // 模拟已登录用户
  req.user = {
    userId: '123456',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user' // user | admin
  };
  
  next();
};

/**
 * GET /api/posts - 获取帖子列表
 * 支持分页、排序
 * 查询参数:
 *   - page: 页码 (默认: 1)
 *   - limit: 每页数量 (默认: 10)
 *   - sort: 排序字段 (默认: createdAt)
 *   - order: 排序方向 asc|desc (默认: desc)
 *   - boardId: 版块ID筛选 (可选)
 *   - authorId: 作者ID筛选 (可选)
 *   - keyword: 关键词搜索 (可选)
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      boardId,
      authorId,
      keyword
    } = req.query;

    // 参数校验
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ message: '页码必须是正整数' });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ message: '每页数量必须在1-100之间' });
    }

    // 筛选数据
    let filteredPosts = [...mockPosts];

    if (boardId) {
      filteredPosts = filteredPosts.filter(p => p.boardId === boardId);
    }

    if (authorId) {
      filteredPosts = filteredPosts.filter(p => p.authorId === authorId);
    }

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filteredPosts = filteredPosts.filter(p =>
        p.title.toLowerCase().includes(lowerKeyword) ||
        p.content.toLowerCase().includes(lowerKeyword)
      );
    }

    // 排序
    const validSortFields = ['createdAt', 'updatedAt', 'viewCount', 'replyCount'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    filteredPosts.sort((a, b) => {
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        return sortOrder * (new Date(a[sortField]) - new Date(b[sortField]));
      }
      return sortOrder * (a[sortField] - b[sortField]);
    });

    // 置顶帖子排在最前面
    filteredPosts.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    // 分页
    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const posts = filteredPosts.slice(startIndex, endIndex);

    // 返回结果（不包含完整内容，减少传输）
    const postsSummary = posts.map(post => ({
      id: post.id,
      title: post.title,
      authorId: post.authorId,
      authorName: post.authorName,
      boardId: post.boardId,
      boardName: post.boardName,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      viewCount: post.viewCount,
      replyCount: post.replyCount,
      isPinned: post.isPinned,
      isLocked: post.isLocked,
      summary: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '')
    }));

    res.status(200).json({
      posts: postsSummary,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('获取帖子列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * GET /api/posts/:id - 获取帖子详情
 * 路径参数:
 *   - id: 帖子ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: 从数据库查询帖子
    const post = mockPosts.find(p => p.id === id);

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    // 增加浏览次数
    post.viewCount += 1;

    // TODO: 获取帖子的回复列表
    const mockReplies = [
      {
        id: '1',
        postId: id,
        content: '很好的帖子，支持！',
        authorId: '111111',
        authorName: 'user1',
        createdAt: new Date().toISOString()
      }
    ];

    res.status(200).json({
      post: {
        ...post,
        replies: mockReplies
      }
    });

  } catch (error) {
    console.error('获取帖子详情错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * POST /api/posts - 创建帖子
 * 需要登录
 * 请求体:
 *   - title: 帖子标题 (必填)
 *   - content: 帖子内容 (必填)
 *   - boardId: 版块ID (必填)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, boardId } = req.body;

    // 参数校验
    if (!title || !content || !boardId) {
      return res.status(400).json({
        message: '请提供标题、内容和版块ID'
      });
    }

    if (title.length < 2 || title.length > 100) {
      return res.status(400).json({
        message: '标题长度必须在2-100个字符之间'
      });
    }

    if (content.length < 10 || content.length > 10000) {
      return res.status(400).json({
        message: '内容长度必须在10-10000个字符之间'
      });
    }

    // TODO: 验证版块是否存在
    // const board = await Board.findById(boardId);
    // if (!board) {
    //   return res.status(404).json({ message: '版块不存在' });
    // }

    // TODO: 保存帖子到数据库
    const newPost = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      authorId: req.user.userId,
      authorName: req.user.username,
      boardId: boardId,
      boardName: '综合讨论', // TODO: 从版块获取
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      replyCount: 0,
      isPinned: false,
      isLocked: false
    };

    // 模拟保存
    mockPosts.unshift(newPost);

    res.status(201).json({
      message: '帖子创建成功',
      post: newPost
    });

  } catch (error) {
    console.error('创建帖子错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * PUT /api/posts/:id - 更新帖子
 * 需要登录，仅限作者
 * 路径参数:
 *   - id: 帖子ID
 * 请求体:
 *   - title: 帖子标题 (可选)
 *   - content: 帖子内容 (可选)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // TODO: 从数据库查询帖子
    const post = mockPosts.find(p => p.id === id);

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    // 权限检查：仅限作者
    if (post.authorId !== req.user.userId) {
      return res.status(403).json({ message: '无权修改此帖子' });
    }

    // 参数校验
    if (title !== undefined) {
      if (title.length < 2 || title.length > 100) {
        return res.status(400).json({
          message: '标题长度必须在2-100个字符之间'
        });
      }
      post.title = title.trim();
    }

    if (content !== undefined) {
      if (content.length < 10 || content.length > 10000) {
        return res.status(400).json({
          message: '内容长度必须在10-10000个字符之间'
        });
      }
      post.content = content.trim();
    }

    // 更新时间
    post.updatedAt = new Date().toISOString();

    // TODO: 保存到数据库
    // await post.save();

    res.status(200).json({
      message: '帖子更新成功',
      post
    });

  } catch (error) {
    console.error('更新帖子错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * DELETE /api/posts/:id - 删除帖子
 * 需要登录，仅限作者或管理员
 * 路径参数:
 *   - id: 帖子ID
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: 从数据库查询帖子
    const postIndex = mockPosts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    const post = mockPosts[postIndex];

    // 权限检查：仅限作者或管理员
    if (post.authorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除此帖子' });
    }

    // TODO: 从数据库删除
    // await Post.findByIdAndDelete(id);

    // 模拟删除
    mockPosts.splice(postIndex, 1);

    res.status(200).json({
      message: '帖子删除成功'
    });

  } catch (error) {
    console.error('删除帖子错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;
