/**
 * Post Model - 帖子模型
 * 
 * 对应数据库表: posts
 * 关联用户和版块，支持置顶、精华等功能
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '帖子ID'
    },
    boardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'board_id',
      references: {
        model: 'boards',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: '所属版块ID'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: '作者ID'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255]
      },
      comment: '帖子标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '帖子内容（Markdown格式）'
    },
    contentHtml: {
      type: DataTypes.TEXT,
      field: 'content_html',
      comment: '渲染后的HTML内容'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'view_count',
      comment: '浏览次数'
    },
    replyCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'reply_count',
      comment: '回复数量'
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'like_count',
      comment: '点赞数量'
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_pinned',
      comment: '是否置顶'
    },
    isEssence: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_essence',
      comment: '是否精华帖'
    },
    status: {
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      validate: {
        isIn: [[0, 1, 2]]
      },
      comment: '状态: 0-删除, 1-正常, 2-待审核'
    },
    lastReplyAt: {
      type: DataTypes.DATE,
      field: 'last_reply_at',
      comment: '最后回复时间'
    }
  }, {
    tableName: 'posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['board_id'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
      { fields: ['last_reply_at'] },
      { 
        fields: ['is_pinned'],
        where: { is_pinned: true }
      }
    ],
    comment: '帖子表'
  });

  // 实例方法
  Post.prototype.isDeleted = function() {
    return this.status === 0;
  };

  Post.prototype.isPending = function() {
    return this.status === 2;
  };

  Post.prototype.incrementView = function() {
    this.viewCount += 1;
    return this.save({ fields: ['view_count'] });
  };

  // 类方法
  Post.associate = (models) => {
    Post.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'author',
      onDelete: 'CASCADE'
    });

    Post.belongsTo(models.Board, {
      foreignKey: 'board_id',
      as: 'board',
      onDelete: 'CASCADE'
    });

    Post.hasMany(models.Reply, {
      foreignKey: 'post_id',
      as: 'replies',
      onDelete: 'CASCADE'
    });
  };

  return Post;
};
