# bootstrap_cn.sh 使用指南

## 概述

`bootstrap_cn.sh` 是专为中国境内网络环境优化的一键部署脚本，使用 Gitee 镜像仓库和阿里云容器镜像服务，显著提升部署速度。

## 主要特性

### 🚀 速度优化

| 操作 | bootstrap.sh (GitHub) | bootstrap_cn.sh (Gitee) | 提升 |
|------|----------------------|------------------------|------|
| Git 克隆 | ~5-15 分钟 | ~30-60 秒 | **10-15x** |
| 镜像拉取 | ~10-30 分钟 | ~2-5 分钟 | **5-10x** |
| 总部署时间 | ~15-45 分钟 | ~3-6 分钟 | **5-7x** |

### ✨ 自动化功能

- ✅ 自动检查并安装 Git
- ✅ 自动检查并安装 Docker
- ✅ 自动检查并安装 Docker Compose
- ✅ 自动克隆 TGO 仓库（使用 Gitee 镜像）
- ✅ 自动执行 `./tgo.sh install --cn`（使用阿里云 ACR 镜像）
- ✅ 支持 macOS、Linux（Debian/Ubuntu、RHEL/CentOS、Fedora、Arch）

### 🔧 与 bootstrap.sh 的区别

| 特性 | bootstrap.sh | bootstrap_cn.sh |
|------|-------------|-----------------|
| Git 仓库 | GitHub | Gitee |
| 默认 REPO | `https://github.com/tgoai/tgo.git` | `https://gitee.com/tgoai/tgo.git` |
| 部署命令 | `./tgo.sh install` | `./tgo.sh install --cn` |
| Docker 镜像源 | GHCR | 阿里云 ACR |
| 适用地区 | 海外 | 中国境内 |

## 使用方法

### 远程一键部署（推荐）

```bash
# 使用 Gitee Raw URL
curl -fsSL https://gitee.com/tgoai/tgo/raw/main/bootstrap_cn.sh | bash
```

### 指定版本部署

```bash
# 部署特定版本
REF=v1.0.0 curl -fsSL https://gitee.com/tgoai/tgo/raw/main/bootstrap_cn.sh | bash

# 部署特定分支
REF=develop curl -fsSL https://gitee.com/tgoai/tgo/raw/main/bootstrap_cn.sh | bash
```

### SSH 远程执行

```bash
# 在远程服务器上一键部署
ssh user@server 'curl -fsSL https://gitee.com/tgoai/tgo/raw/main/bootstrap_cn.sh | bash'

# 指定版本
ssh user@server 'REF=v1.0.0 curl -fsSL https://gitee.com/tgoai/tgo/raw/main/bootstrap_cn.sh | bash'
```

### 本地执行

```bash
# 如果已经下载了脚本
bash ./bootstrap_cn.sh

# 或者给予执行权限后直接运行
chmod +x bootstrap_cn.sh
./bootstrap_cn.sh
```

## 环境变量配置

### REPO - 仓库地址

```bash
# 默认值（Gitee 镜像）
REPO=https://gitee.com/tgoai/tgo.git

# 使用自定义仓库
REPO=https://your-git-server.com/tgo.git curl -fsSL https://gitee.com/tgoai/tgo/raw/main/bootstrap_cn.sh | bash
```

### DIR - 克隆目录

```bash
# 默认值
DIR=tgo

# 自定义目录名
DIR=my-tgo curl -fsSL https://gitee.com/tgoai/tgo/raw/main/bootstrap_cn.sh | bash
```

### REF - 分支/标签/提交

```bash
# 默认：使用仓库默认分支
REF=

# 指定标签
REF=v1.0.0 curl -fsSL https://gitee.com/tgoai/tgo/raw/main/bootstrap_cn.sh | bash

# 指定分支
REF=develop curl -fsSL https://gitee.com/tgoai/tgo/raw/main/bootstrap_cn.sh | bash

# 指定提交
REF=abc123def curl -fsSL https://gitee.com/tgoai/tgo/raw/main/bootstrap_cn.sh | bash
```

## 工作流程

1. **环境检查**
   - 检测操作系统类型和发行版
   - 检查 Git 是否已安装，未安装则提示安装
   - 检查 Docker 是否已安装，未安装则提示安装
   - 检查 Docker Compose 是否已安装，未安装则提示安装

2. **仓库克隆**
   - 如果当前目录已有 `tgo.sh` 和 `docker-compose.yml`，跳过克隆
   - 否则从 Gitee 克隆仓库到指定目录（默认 `./tgo`）
   - 如果指定了 REF，切换到对应的分支/标签/提交

3. **自动部署**
   - 执行 `./tgo.sh install --cn`
   - 使用阿里云 ACR 拉取 Docker 镜像
   - 启动所有服务

4. **完成提示**
   - 显示部署成功信息
   - 提示使用 `docker compose ps` 查看服务状态
   - 提示使用 `docker compose logs -f <service>` 查看日志

## 常见问题

### Q: 为什么需要 bootstrap_cn.sh？

A: 在中国境内网络环境下，访问 GitHub 和 GHCR 可能较慢或不稳定。`bootstrap_cn.sh` 使用 Gitee 和阿里云 ACR，可以将部署时间从 15-45 分钟缩短到 3-6 分钟。

### Q: bootstrap_cn.sh 和 bootstrap.sh 功能有区别吗？

A: 功能完全相同，唯一区别是：
- `bootstrap_cn.sh` 使用 Gitee 镜像仓库和阿里云 ACR
- `bootstrap.sh` 使用 GitHub 仓库和 GHCR

### Q: 可以在海外服务器使用 bootstrap_cn.sh 吗？

A: 可以，但不推荐。海外服务器访问 Gitee 和阿里云 ACR 可能比直接访问 GitHub 和 GHCR 更慢。

### Q: 如何验证脚本是否使用了中国镜像？

A: 脚本会在输出中显示：
- `[CLONE] https://gitee.com/tgoai/tgo.git -> tgo`
- `[RUN] (cd tgo && ./tgo.sh install --cn)`

### Q: Docker 安装后提示权限错误怎么办？

A: 在 Linux 上，脚本会自动将当前用户添加到 `docker` 组，但需要重新登录才能生效。按照脚本提示：
```bash
# 方式 1: 重新登录
logout
# 然后重新登录并运行 ./tgo.sh install --cn

# 方式 2: 使用 newgrp
newgrp docker
./tgo.sh install --cn
```

## 相关文档

- [中国境内网络环境部署指南](CN_MIRROR_GUIDE.md)
- [部署模式详解](DEPLOYMENT_MODES.md)
- [主 README](../README.md)

---

**创建日期**: 2024-11-21  
**版本**: v1.0

