/**
 * Board Model - 版块模型
 * 
 * 对应数据库表: boards
 * 支持层级结构，可包含子版块
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Board = sequelize.define('Board', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '版块ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '版块名称'
    },
    slug: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z0-9-]+$/i
      },
      comment: 'URL友好的标识'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '版块描述'
    },
    iconUrl: {
      type: DataTypes.STRING(255),
      field: 'icon_url',
      comment: '版块图标URL'
    },
    parentId: {
      type: DataTypes.INTEGER,
      field: 'parent_id',
      references: {
        model: 'boards',
        key: 'id'
      },
      onDelete: 'SET NULL',
      comment: '父版块ID'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
      comment: '排序权重'
    },
    postCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'post_count',
      comment: '帖子数量'
    },
    status: {
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      validate: {
        isIn: [[0, 1]]
      },
      comment: '状态: 0-隐藏, 1-正常'
    }
  }, {
    tableName: 'boards',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['slug'] },
      { fields: ['parent_id'] },
      { fields: ['status'] },
      { fields: ['sort_order'] }
    ],
    comment: '版块表'
  });

  // 实例方法
  Board.prototype.isRoot = function() {
    return this.parentId === null;
  };

  // 类方法
  Board.associate = (models) => {
    // 自关联：版块可以有子版块
    Board.hasMany(Board, {
      foreignKey: 'parent_id',
      as: 'children',
      onDelete: 'SET NULL'
    });
    
    Board.belongsTo(Board, {
      foreignKey: 'parent_id',
      as: 'parent',
      onDelete: 'SET NULL'
    });

    // 关联帖子
    Board.hasMany(models.Post, {
      foreignKey: 'board_id',
      as: 'posts',
      onDelete: 'CASCADE'
    });
  };

  return Board;
};
