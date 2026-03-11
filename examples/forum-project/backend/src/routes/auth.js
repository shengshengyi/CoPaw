const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT密钥，生产环境应从环境变量读取
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * POST /register - 用户注册
 * 请求体: { username: string, email: string, password: string }
 * 返回: { message: string, user: { id, username, email } }
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 参数校验
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: '请提供用户名、邮箱和密码' 
      });
    }

    // 密码长度校验
    if (password.length < 6) {
      return res.status(400).json({ 
        message: '密码长度至少为6位' 
      });
    }

    // 邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: '邮箱格式不正确' 
      });
    }

    // TODO: 检查用户名和邮箱是否已存在（需要数据库连接）
    // const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    // if (existingUser) {
    //   return res.status(409).json({ message: '用户名或邮箱已存在' });
    // }

    // 使用bcryptjs加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // TODO: 保存用户到数据库
    // const newUser = new User({
    //   username,
    //   email,
    //   password: hashedPassword
    // });
    // await newUser.save();

    // 模拟创建成功，返回用户信息（不含密码）
    const user = {
      id: Date.now().toString(),
      username,
      email
    };

    res.status(201).json({
      message: '注册成功',
      user
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ 
      message: '服务器内部错误' 
    });
  }
});

/**
 * POST /login - 用户登录
 * 请求体: { email: string, password: string }
 * 返回: { message: string, token: string, user: { id, username, email } }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 参数校验
    if (!email || !password) {
      return res.status(400).json({ 
        message: '请提供邮箱和密码' 
      });
    }

    // TODO: 从数据库查找用户
    // const user = await User.findOne({ email });
    // if (!user) {
    //   return res.status(401).json({ message: '邮箱或密码错误' });
    // }

    // 模拟用户数据（实际应从数据库获取）
    const mockUser = {
      id: '123456',
      username: 'testuser',
      email: email,
      password: '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // 加密后的密码
    };

    // TODO: 验证密码
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   return res.status(401).json({ message: '邮箱或密码错误' });
    // }

    // 使用jsonwebtoken生成token
    const token = jwt.sign(
      { 
        userId: mockUser.id, 
        username: mockUser.username,
        email: mockUser.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' } // token有效期24小时
    );

    // 返回token和用户信息（不含密码）
    res.status(200).json({
      message: '登录成功',
      token,
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      message: '服务器内部错误' 
    });
  }
});

module.exports = router;
