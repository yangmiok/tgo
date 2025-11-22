# SSL 自动续期配置指南

本指南介绍如何配置 SSL 证书的自动续期。

## 自动续期方案

### 方案 1: Certbot 容器自动续期（推荐）

Certbot 容器已配置为自动续期证书。只需启动 Nginx 和 Certbot 容器：

```bash
docker compose --profile ssl-auto up -d
```

**工作原理**:
- Certbot 容器每 12 小时检查一次证书
- 如果证书即将过期（< 30 天），自动续期
- 续期后自动重新加载 Nginx

**优点**:
- 完全自动化
- 无需额外配置
- 容器化管理

### 方案 2: 主机 Cron 定时任务

如果不使用 Certbot 容器，可以在主机上配置 Cron 定时任务。

#### 步骤 1: 编辑 Crontab

```bash
crontab -e
```

#### 步骤 2: 添加续期任务

```bash
# 每天凌晨 2 点运行续期脚本
0 2 * * * /path/to/tgo-deploy/scripts/renew-ssl.sh >> /var/log/tgo-ssl-renew.log 2>&1

# 或者每周一次（推荐）
0 2 * * 0 /path/to/tgo-deploy/scripts/renew-ssl.sh >> /var/log/tgo-ssl-renew.log 2>&1
```

#### 步骤 3: 验证 Cron 任务

```bash
# 查看已配置的 Cron 任务
crontab -l

# 查看 Cron 日志
tail -f /var/log/tgo-ssl-renew.log
```

---

## 手动续期

如果需要立即续期证书：

```bash
bash ./scripts/renew-ssl.sh
```

---

## 续期脚本说明

续期脚本 (`scripts/renew-ssl.sh`) 执行以下操作：

1. 检查 SSL 模式是否为 `auto`
2. 运行 Certbot 续期命令
3. 复制更新的证书到 Nginx 目录
4. 重新加载 Nginx 配置

---

## 监控续期状态

### 查看 Certbot 日志

```bash
# 查看 Certbot 容器日志
docker logs tgo-certbot

# 查看 Certbot 日志文件
cat ./data/certbot/logs/letsencrypt.log
```

### 查看证书信息

```bash
# 查看证书过期时间
openssl x509 -in ./data/nginx/ssl/www.talkgo.cn/cert.pem -noout -dates

# 查看所有证书
for domain in www.talkgo.cn widget.talkgo.cn api.talkgo.cn; do
  echo "=== $domain ==="
  openssl x509 -in ./data/nginx/ssl/$domain/cert.pem -noout -dates
done
```

---

## 故障排除

### 问题: 续期失败

**检查清单**:

1. 检查 DNS 配置
   ```bash
   nslookup www.talkgo.cn
   ```

2. 检查端口 80 是否开放
   ```bash
   curl -I http://www.talkgo.cn/.well-known/acme-challenge/test
   ```

3. 查看 Certbot 日志
   ```bash
   docker logs tgo-certbot
   ```

4. 手动运行续期脚本
   ```bash
   bash ./scripts/renew-ssl.sh
   ```

### 问题: Nginx 无法重新加载

**解决**:

1. 检查 Nginx 配置
   ```bash
   docker exec tgo-nginx nginx -t
   ```

2. 手动重新加载
   ```bash
   docker exec tgo-nginx nginx -s reload
   ```

### 问题: 证书文件权限错误

**解决**:

```bash
# 修复权限
chmod -R 644 ./data/nginx/ssl/
chmod 755 ./data/nginx/ssl/*/
```

---

## 证书续期通知

Let's Encrypt 会在以下情况发送邮件通知：

- 证书即将过期（30 天前）
- 续期失败

确保在配置时使用有效的邮箱地址：

```bash
./tgo.sh config ssl_email admin@talkgo.cn
```

---

## 最佳实践

1. **定期检查证书状态**
   ```bash
   for domain in www.talkgo.cn widget.talkgo.cn api.talkgo.cn; do
     echo "=== $domain ==="
     openssl x509 -in ./data/nginx/ssl/$domain/cert.pem -noout -dates
   done
   ```

2. **保持 Certbot 容器运行**
   ```bash
   docker compose --profile ssl-auto up -d
   ```

3. **监控日志**
   ```bash
   docker logs -f tgo-certbot
   ```

4. **定期备份证书**
   ```bash
   tar -czf ./data/certbot-backup-$(date +%Y%m%d).tar.gz ./data/certbot/
   ```

5. **测试续期流程**
   ```bash
   # 在测试环境中使用 Let's Encrypt 测试服务器
   # 修改 setup-ssl.sh 中的 certbot 命令添加 --staging 参数
   ```

---

## 相关文件

- **续期脚本**: `./scripts/renew-ssl.sh`
- **设置脚本**: `./scripts/setup-ssl.sh`
- **Nginx 配置**: `./docker-compose.yml` (已集成 Nginx 和 Certbot)
- **中国镜像配置**: `./docker-compose.cn.yml`
- **域名配置**: `./data/.tgo-domain-config`
- **Certbot 数据**: `./data/certbot/`

---

## 更多帮助

查看域名配置指南：

```bash
cat docs/DOMAIN_CONFIG_GUIDE.md
```

查看 Certbot 官方文档：

https://certbot.eff.org/docs/

