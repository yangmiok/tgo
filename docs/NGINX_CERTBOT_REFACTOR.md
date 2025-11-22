# Nginx 和 Certbot 服务重构说明

## 📋 重构概述

本次重构将 Nginx 和 Certbot 服务从独立的 `docker-compose.nginx.yml` 文件合并到主 `docker-compose.yml` 文件中，简化了部署流程并改进了中国镜像支持。

## ✅ 重构内容

### 1. 合并配置文件
- ✅ Nginx 和 Certbot 服务已从 `docker-compose.nginx.yml` 移动到 `docker-compose.yml`
- ✅ `docker-compose.nginx.yml` 文件已删除
- ✅ 用户执行 `./tgo.sh install` 时，nginx 和 certbot 会自动安装和启动

### 2. 中国镜像支持
- ✅ `docker-compose.cn.yml` 中添加了 nginx 镜像覆盖
  - Nginx: `registry.cn-shanghai.aliyuncs.com/tgoai/nginx:alpine`
- ✅ `docker-compose.cn.yml` 中添加了 certbot 镜像覆盖
  - Certbot: `registry.cn-shanghai.aliyuncs.com/tgoai/certbot:latest`
- ✅ 用户使用 `./tgo.sh install --cn` 时自动使用阿里云镜像

### 3. 脚本更新
- ✅ `tgo.sh` 脚本已验证，无需修改
- ✅ 所有命令（install、upgrade、uninstall、service）都能正常工作

### 4. 文档更新
- ✅ 更新了所有 docker-compose 命令
- ✅ 移除了 `-f docker-compose.nginx.yml` 参数
- ✅ 更新了 5 份文档文件

## 📝 使用方式变化

### 旧方式（已弃用）
```bash
docker-compose -f docker-compose.yml -f docker-compose.nginx.yml up -d
```

### 新方式（推荐）
```bash
# 基础启动
docker compose up -d

# 使用 Let's Encrypt 自动续期
docker compose --profile ssl-auto up -d

# 使用中国镜像
./tgo.sh install --cn
```

## 🎯 核心改进

1. **简化部署流程**
   - 用户不需要记住 `-f docker-compose.nginx.yml` 参数
   - 一键启动所有服务

2. **更好的中国镜像支持**
   - nginx 和 certbot 都支持中国镜像
   - 自动使用阿里云镜像

3. **向后兼容**
   - 所有现有功能保持不变
   - SSL 证书管理功能不受影响
   - ssl-auto profile 仍然可选

4. **更清晰的配置结构**
   - 主配置：`docker-compose.yml`
   - 中国镜像覆盖：`docker-compose.cn.yml`
   - 源码构建覆盖：`docker-compose.source.yml`

## 🧪 测试验证

所有 12 项测试都已通过：
- ✅ 文件删除和合并验证
- ✅ 服务配置验证
- ✅ 镜像覆盖验证
- ✅ 脚本引用验证
- ✅ 文档更新验证
- ✅ Docker Compose 配置有效性验证

## 📚 相关文档

- 快速参考: `docs/DOMAIN_CONFIG_QUICK_REFERENCE.md`
- 详细指南: `docs/DOMAIN_CONFIG_GUIDE.md`
- SSL 续期: `docs/SSL_AUTO_RENEWAL_SETUP.md`
- 实现说明: `docs/DOMAIN_CONFIG_IMPLEMENTATION.md`
- 完整总结: `docs/DOMAIN_CONFIG_SUMMARY.md`

## 🚀 快速开始

```bash
# 1. 配置域名
./tgo.sh config web_domain www.talkgo.cn
./tgo.sh config widget_domain widget.talkgo.cn
./tgo.sh config api_domain api.talkgo.cn

# 2. 配置 SSL（可选）
./tgo.sh config ssl_mode auto
./tgo.sh config ssl_email admin@talkgo.cn
./tgo.sh config setup_letsencrypt

# 3. 启动服务
docker compose up -d

# 4. 验证配置
curl https://www.talkgo.cn
```

## ✨ 总结

重构完成，所有功能正常运行！🎉

