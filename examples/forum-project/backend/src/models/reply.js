/**
 * Reply Model - 回复模型
 * 
 * 对应数据库表: replies
 * 支持楼中楼回复（嵌套回复）
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reply = sequelize.define('Reply', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '回复ID'
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'post_id',
      references: {
        model: 'posts',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: '所属帖子ID'
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
      comment: '回复者ID'
    },
    parentId: {
      type: DataTypes.INTEGER,
      field: 'parent_id',
      references: {
        model: 'replies',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: '父回复ID（楼中楼）'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '回复内容（Markdown格式）'
    },
    contentHtml: {
      type: DataTypes.TEXT,
      field: 'content_html',
      comment: '渲染后的HTML内容'
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'like_count',
      comment: '点赞数量'
    },
    floorNumber: {
      type: DataTypes.INTEGER,
      field: 'floor_number',
      comment: '楼层号'
    },
    status: {
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      validate: {
        isIn: [[0, 1]]
      },
      comment: '状态: 0-删除, 1-正常'
    }
  }, {
    tableName: 'replies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['post_id'] },
      { fields: ['user_id'] },
      { fields: ['parent_id'] },
      { fields: ['created_at'] },
      { fields: ['status'] }
    ],
    comment: '回复表'
  });

  // 实例方法
  Reply.prototype.isDeleted = function() {
    return this.status === 0;
  };

  Reply.prototype.isNested = function() {
    return this.parentId !== null;
  };

  // 类方法
  Reply.associate = (models) => {
    Reply.belongsTo(models.Post, {
      foreignKey: 'post_id',
      as: 'post',
      onDelete: 'CASCADE'
    });

    Reply.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'author',
      onDelete: 'CASCADE'
    });

    // 自关联：楼中楼回复
    Reply.belongsTo(Reply, {
      foreignKey: 'parent_id',
      as: 'parent',
      onDelete: 'CASCADE'
    });

    Reply.hasMany(Reply, {
      foreignKey: 'parent_id',
      as: 'children',
      onDelete: 'CASCADE'
    });
  };

  return Reply;
};
