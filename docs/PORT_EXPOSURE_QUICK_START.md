# 服务端口暴露策略 - 快速开始

## 🎯 核心概念

**只有 Nginx 暴露端口到宿主机，其他服务通过 Nginx 反向代理访问。**

```
外部请求 → Nginx (80/443) → 内部服务
```

## 📊 端口映射

| 服务 | 内部端口 | 暴露到宿主机 | 访问方式 |
|------|---------|-----------|---------|
| tgo-web | 80 | ❌ 否 | 通过 Nginx |
| tgo-widget-app | 80 | ❌ 否 | 通过 Nginx |
| tgo-api | 8000 | ❌ 否 | 通过 Nginx |
| nginx | 80/443 | ✅ 是 | 直接访问 |

## 🚀 快速开始

### 1. 基础部署（无域名）
```bash
# 启动服务
./tgo.sh install
docker compose up -d

# 访问
curl http://localhost/              # Web
curl http://localhost/widget        # Widget
curl http://localhost/api/health    # API
```

### 2. 配置域名（生产环境）
```bash
# 配置域名
./tgo.sh config web_domain www.talkgo.cn
./tgo.sh config widget_domain widget.talkgo.cn
./tgo.sh config api_domain api.talkgo.cn

# 配置 SSL
./tgo.sh config ssl_mode auto
./tgo.sh config ssl_email admin@talkgo.cn
./tgo.sh config setup_letsencrypt

# 启动服务
docker compose --profile ssl-auto up -d

# 访问
curl https://www.talkgo.cn/
curl https://widget.talkgo.cn/
curl https://api.talkgo.cn/health
```

## 🔄 请求路由

### 基于路径的路由（无域名）
```
http://localhost/              → tgo-web:80
http://localhost/widget        → tgo-widget-app:80
http://localhost/api/*         → tgo-api:8000
```

### 基于域名的路由（有域名）
```
https://www.talkgo.cn/         → tgo-web:80
https://widget.talkgo.cn/      → tgo-widget-app:80
https://api.talkgo.cn/         → tgo-api:8000
```

## 🔧 服务间通信

所有服务在同一 Docker 网络中，使用内部网络通信：

```bash
# tgo-web 调用 tgo-api
curl http://tgo-api:8000/api/health

# tgo-widget-app 调用 tgo-api
curl http://tgo-api:8000/api/health
```

## ✅ 验证配置

```bash
# 运行测试脚本
bash scripts/test-port-exposure.sh

# 检查 Nginx 配置
docker exec tgo-nginx nginx -t

# 查看 Nginx 日志
docker logs -f tgo-nginx
```

## 📝 常见问题

### Q: 为什么 tgo-api 不暴露端口？
A: 为了安全性，所有内部服务都不直接暴露到宿主机，只通过 Nginx 反向代理访问。

### Q: 如何访问 API？
A: 通过 Nginx 反向代理访问：
- 无域名：`http://localhost/api/health`
- 有域名：`https://api.talkgo.cn/health`

### Q: 服务间如何通信？
A: 使用内部网络地址：`http://tgo-api:8000`

### Q: 如何修改 Nginx 配置？
A: 修改 `scripts/generate-nginx-config.sh`，然后运行：
```bash
./scripts/generate-nginx-config.sh
docker restart tgo-nginx
```

## 📚 相关文档

- 详细说明: `docs/PORT_EXPOSURE_STRATEGY.md`
- 域名配置: `docs/DOMAIN_CONFIG_GUIDE.md`
- SSL 管理: `docs/SSL_AUTO_RENEWAL_SETUP.md`

