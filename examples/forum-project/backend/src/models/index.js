/**
 * Models Index - 模型入口文件
 * 
 * 负责：
 * 1. Sequelize 初始化
 * 2. 数据库连接配置
 * 3. 加载所有模型
 * 4. 定义模型关联关系
 */

const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

// 数据库配置
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'forum_v2',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    // 全局默认配置
    freezeTableName: true,  // 不使用复数表名
    underscored: true,      // 使用下划线命名
    timestamps: true        // 默认添加时间戳
  }
};

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
    define: config.define
  }
);

// 模型缓存对象
const db = {};

/**
 * 加载所有模型文件
 */
function loadModels() {
  const modelsDir = __dirname;
  
  // 读取当前目录下所有 .js 文件（排除 index.js）
  const modelFiles = fs
    .readdirSync(modelsDir)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 &&
        file !== 'index.js' &&
        file.slice(-3) === '.js'
      );
    });

  // 加载模型
  modelFiles.forEach(file => {
    const modelPath = path.join(modelsDir, file);
    const modelFactory = require(modelPath);
    
    if (typeof modelFactory === 'function') {
      const model = modelFactory(sequelize, DataTypes);
      db[model.name] = model;
    }
  });
}

/**
 * 建立模型关联关系
 */
function setupAssociations() {
  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
}

// 初始化
loadModels();
setupAssociations();

// 导出
module.exports = {
  sequelize,    // Sequelize 实例
  Sequelize,    // Sequelize 类
  ...db         // 所有模型
};

// 模型清单：
// - User: 用户模型
// - Board: 版块模型
// - Post: 帖子模型
// - Reply: 回复模型
