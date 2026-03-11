# 论坛系统架构设计

## 1. 系统架构
[待补充]

## 2. 数据库设计

### 2.1 数据库选型
- 主数据库：PostgreSQL 14+
- 缓存：Redis 6+
- 搜索引擎：Elasticsearch（可选，用于全文搜索）

### 2.2 表结构详细定义

#### 2.2.1 users 表（用户表）
```sql
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    nickname        VARCHAR(50),
    avatar_url      VARCHAR(255),
    bio             TEXT,
    status          SMALLINT DEFAULT 1 COMMENT '0-禁用, 1-正常, 2-未激活',
    role            SMALLINT DEFAULT 1 COMMENT '0-管理员, 1-普通用户, 2-版主',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at   TIMESTAMP
);

-- 索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 2.2.2 boards 表（版块表）
```sql
CREATE TABLE boards (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    slug            VARCHAR(50) NOT NULL UNIQUE COMMENT 'URL友好的标识',
    description     TEXT,
    icon_url        VARCHAR(255),
    parent_id       INTEGER REFERENCES boards(id) ON DELETE SET NULL,
    sort_order      INTEGER DEFAULT 0,
    post_count      INTEGER DEFAULT 0,
    status          SMALLINT DEFAULT 1 COMMENT '0-隐藏, 1-正常',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_boards_slug ON boards(slug);
CREATE INDEX idx_boards_parent_id ON boards(parent_id);
CREATE INDEX idx_boards_status ON boards(status);
CREATE INDEX idx_boards_sort_order ON boards(sort_order);
```

#### 2.2.3 posts 表（帖子表）
```sql
CREATE TABLE posts (
    id              SERIAL PRIMARY KEY,
    board_id        INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    content_html    TEXT COMMENT '渲染后的HTML内容',
    view_count      INTEGER DEFAULT 0,
    reply_count     INTEGER DEFAULT 0,
    like_count      INTEGER DEFAULT 0,
    is_pinned       BOOLEAN DEFAULT FALSE,
    is_essence      BOOLEAN DEFAULT FALSE COMMENT '是否精华帖',
    status          SMALLINT DEFAULT 1 COMMENT '0-删除, 1-正常, 2-待审核',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_reply_at   TIMESTAMP
);

-- 索引
CREATE INDEX idx_posts_board_id ON posts(board_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_last_reply_at ON posts(last_reply_at DESC);
CREATE INDEX idx_posts_is_pinned ON posts(is_pinned) WHERE is_pinned = TRUE;
```

#### 2.2.4 replies 表（回复表）
```sql
CREATE TABLE replies (
    id              SERIAL PRIMARY KEY,
    post_id         INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id       INTEGER REFERENCES replies(id) ON DELETE CASCADE COMMENT '楼中楼回复',
    content         TEXT NOT NULL,
    content_html    TEXT COMMENT '渲染后的HTML内容',
    like_count      INTEGER DEFAULT 0,
    floor_number    INTEGER COMMENT '楼层号',
    status          SMALLINT DEFAULT 1 COMMENT '0-删除, 1-正常',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_replies_post_id ON replies(post_id);
CREATE INDEX idx_replies_user_id ON replies(user_id);
CREATE INDEX idx_replies_parent_id ON replies(parent_id);
CREATE INDEX idx_replies_created_at ON replies(created_at);
CREATE INDEX idx_replies_status ON replies(status);
```

### 2.3 数据库设计说明

#### 2.3.1 设计原则
1. **主键策略**：使用自增整数（SERIAL），简单高效
2. **软删除**：使用status字段实现软删除，保留数据可追溯性
3. **时间戳**：所有表包含created_at和updated_at，便于审计和排序
4. **外键约束**：建立外键关系并设置级联删除，保证数据一致性

#### 2.3.2 性能优化
1. **索引设计**：高频查询字段建立索引，避免全表扫描
2. **分区策略**：posts表可按created_at进行分区（数据量大时）
3. **读写分离**：主库写，从库读，提升并发能力

#### 2.3.3 扩展预留
1. **JSON字段**：预留metadata JSON字段用于灵活扩展
2. **分库分表**：用户ID和帖子ID可支持分布式ID生成

## 3. API设计
[待补充]

## 4. 部署架构
[待补充]
