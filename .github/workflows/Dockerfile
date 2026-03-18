# 使用最新的 Node.js 环境
FROM node:20-slim

# 设置工作目录
WORKDIR /app

# 复制依赖列表并安装
COPY package*.json ./
RUN npm install

# 复制所有代码到容器里
COPY . .

# 暴露 3000 端口（云平台会访问这个端口）
EXPOSE 3000

# 启动命令（根据你之前的 package.json 修改）
CMD ["npx", "tsx", "server.ts"]

