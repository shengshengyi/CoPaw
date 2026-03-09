#!/bin/bash

# CoPaw Fork 自动同步脚本
# 每天凌晨1点和下午1点执行

PROJECT_DIR="/home/terrence/.copaw/workspaces/CoPaw-fork"
LOG_FILE="/home/terrence/.copaw/workspaces/CoPaw-fork/auto-sync.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] 开始自动同步..." >> $LOG_FILE

cd $PROJECT_DIR

# 1. 获取上游更新
echo "[$DATE] 获取上游更新..." >> $LOG_FILE
git fetch upstream 2>&1 >> $LOG_FILE

# 2. 切换到 main 分支并合并上游更新
echo "[$DATE] 同步 main 分支..." >> $LOG_FILE
git checkout main 2>&1 >> $LOG_FILE
git merge upstream/main -m "sync: 自动同步上游更新 [$DATE]" 2>&1 >> $LOG_FILE

# 3. 推送到自己的 Fork
echo "[$DATE] 推送 main 分支..." >> $LOG_FILE
git push origin main 2>&1 >> $LOG_FILE

# 4. 切换到 shengshengyi 分支并合并 main
echo "[$DATE] 同步 shengshengyi 分支..." >> $LOG_FILE
git checkout shengshengyi 2>&1 >> $LOG_FILE
git merge main -m "sync: 合并 main 分支更新 [$DATE]" 2>&1 >> $LOG_FILE

# 5. 推送到远程
echo "[$DATE] 推送 shengshengyi 分支..." >> $LOG_FILE
git push origin shengshengyi 2>&1 >> $LOG_FILE

if [ $? -eq 0 ]; then
    echo "[$DATE] ✅ 同步成功" >> $LOG_FILE
else
    echo "[$DATE] ❌ 同步失败" >> $LOG_FILE
fi

echo "[$DATE] 完成" >> $LOG_FILE
echo "---" >> $LOG_FILE
