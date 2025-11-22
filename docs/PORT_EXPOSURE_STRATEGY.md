# 服务端口暴露策略

## 📋 概述

本文档说明了 TGO 部署中的服务端口暴露策略。所有外部请求都通过 Nginx 反向代理转发，其他服务不再直接暴露端口到宿主机。

## 🎯 核心原则

### 端口暴露策略
- **仅 Nginx 暴露端口**：只有 nginx 服务暴露端口到宿主机
  - HTTP: 80 端口（或 `${NGINX_PORT:-80}`）
  - HTTPS: 443 端口（或 `${NGINX_SSL_PORT:-443}`）

- **其他服务不暴露端口**：以下服务不再暴露端口到宿主机
  - tgo-api（内部 8000）
  - tgo-web（内部 80）
  - tgo-widget-app（内部 80）

### 服务间通信
- 所有服务在同一个 Docker 网络中
- 服务间通信使用内部网络（例如 `http://tgo-api:8000`）
- 不受端口暴露策略影响

## 🔄 请求流程

### 外部请求流程
```
外部客户端
    ↓
Nginx (80/443)
    ↓
    ├─→ tgo-web:80 (根路径 /)
    ├─→ tgo-widget-app:80 (路径 /widget)
    └─→ tgo-api:8000 (路径 /api)
```

### 内部服务通信
```
tgo-web → tgo-api:8000 (内部网络)
tgo-widget-app → tgo-api:8000 (内部网络)
```

## 📝 配置说明

### docker-compose.yml 变化
- ✅ 移除了 tgo-api 的 `ports` 配置
- ✅ 移除了 tgo-web 的 `ports` 配置
- ✅ 移除了 tgo-widget-app 的 `ports` 配置
- ✅ 保留了 nginx 的 `ports` 配置

### 环境变量变化
- `API_BASE_URL` 改为 `http://tgo-api:8000`（内部网络）
- `VITE_WIDGET_PREVIEW_URL` 改为 `http://tgo-widget-app:80`（内部网络）
- `NGINX_PORT` 和 `NGINX_SSL_PORT` 保持不变

## 🚀 使用场景

### 场景 1: 未配置域名（开发环境）
```bash
# 访问 Web 前端
curl http://localhost/

# 访问 Widget
curl http://localhost/widget

# 访问 API
curl http://localhost/api/health
```

### 场景 2: 已配置域名（生产环境）
```bash
# 配置域名
./tgo.sh config web_domain www.talkgo.cn
./tgo.sh config widget_domain widget.talkgo.cn
./tgo.sh config api_domain api.talkgo.cn

# 访问
curl https://www.talkgo.cn/
curl https://widget.talkgo.cn/
curl https://api.talkgo.cn/health
```

## 🔧 Nginx 反向代理规则

### 基于路径的路由（无 SSL）
- `/api/*` → `http://tgo-api:8000`
- `/widget/*` → `http://tgo-widget-app:80`
- `/` → `http://tgo-web:80`

### 基于域名的路由（有 SSL）
- `www.talkgo.cn` → `http://tgo-web:80`
- `widget.talkgo.cn` → `http://tgo-widget-app:80`
- `api.talkgo.cn` → `http://tgo-api:8000`

## ✅ 优势

1. **安全性提升**
   - 内部服务不直接暴露到宿主机
   - 所有流量都通过 Nginx 转发

2. **灵活的路由**
   - 支持基于路径的路由
   - 支持基于域名的路由
   - 支持 SSL/TLS 终止

3. **易于维护**
   - 统一的入口点
   - 集中的日志和监控
   - 简化的防火墙规则

4. **向后兼容**
   - 现有的域名配置功能保持不变
   - SSL 证书管理功能保持不变
   - 用户无需修改现有配置

## 📚 相关文档

- 域名配置: `docs/DOMAIN_CONFIG_GUIDE.md`
- SSL 管理: `docs/SSL_AUTO_RENEWAL_SETUP.md`
- Nginx 配置: `scripts/generate-nginx-config.sh`

