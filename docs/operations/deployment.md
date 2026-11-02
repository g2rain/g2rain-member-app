# 构建与部署

## 前端构建

```bash
npm ci
npm run build
```

产物位于 `dist`，包含启动时可替换的 `env-config.js`。`dist` 已被 Git 忽略，不应提交。

## 本地容器镜像构建

```bash
./build.sh --image ghcr.io/g2rain/g2rain-member-app --tag 1.0.0 --build-mode production
```

本地脚本和 CI 都复用根目录 `Dockerfile`，使用同一 Node 22 Alpine 构建阶段、OpenResty Alpine 运行阶段、`VITE_BUILD_MODE`、OCI 构建参数和 `/docker-entrypoint.sh` 入口。运行阶段从仓库 tar 包离线安装 luaossl，声明端口 `8080`。本地构建需要 Docker daemon，但不会推送镜像。

## 容器镜像发布（GHCR）

镜像地址为 `ghcr.io/g2rain/g2rain-member-app:<tag>`。`.github/workflows/image.yml` 只在推送精确格式的稳定 Git tag（例如 `v1.0.0`）时触发；普通分支推送、Pull Request 和手动触发都不会发布。它会检查 tag 格式、tag 提交属于 `origin/main` 历史、`docs/releases/v1.0.0.md` 在该 tag 提交中非空，以及 `package.json` 版本与 tag 一致。

随后工作流配置 Node 22，执行 `npm ci` 和现有完整验证命令 `npm run build`，再通过 `GITHUB_TOKEN` 登录 GHCR。它只声明 `contents: read` 和 `packages: write`，不使用 PAT Secret。工作流复用 `build.sh` 和 Dockerfile，然后推送：

```text
ghcr.io/g2rain/g2rain-member-app:<版本>
ghcr.io/g2rain/g2rain-member-app:sha-<完整提交 SHA>
```

只有两个标签均推送成功后才在 Actions Summary 显示完整镜像地址。登录成功、镜像构建成功或部分 layer 上传不表示发布成功；工作流不会创建 GitHub Release、部署服务或更新 `latest`。

本仓没有独立 unit、E2E、lint 或容器测试脚本，所以 CI 的自动验证实际仅覆盖依赖安装、Vue/TypeScript 类型检查和 Vite 打包；容器构建、容器启动、GHCR 推送、匿名拉取、在线演示和实际部署验证都是独立事项。

发布顺序是：按 `feature/* → develop → main` 合入发布改动、工作流和同名说明，在验证过的 `main` 提交创建并推送 `v1.0.0`，确认摘要中的两个标签后再按环境部署指定版本。首次成功推送后，如需匿名拉取，在 GitHub Packages 的 **Package settings → Change visibility → Public** 将包设为 Public；若组织管理员禁止修改，请联系管理员。已有 GHCR 包可能还需在 **Package settings → Actions access** 授予 `g2rain/g2rain-member-app` 写权限。出现 `denied` 时优先检查这项与组织 Packages 策略，不能只凭 `packages: write` 认定权限足够。

公开后才可匿名拉取：

```bash
docker pull ghcr.io/g2rain/g2rain-member-app:1.0.0
```

私有包需要具备 `read:packages` 权限的凭据。

## 启动示例

```bash
docker run --rm -p 8080:8080 \
  -e SERVER_PORT=8080 \
  -e CONTEXT_PATH=/member \
  -e GATEWAY_HOST=gateway \
  -e GATEWAY_PORT=8080 \
  -e IAM_HOST=iam \
  -e IAM_PORT=8080 \
  -e SSO_BASE_URL=https://platform.example.com \
  ghcr.io/g2rain/g2rain-member-app:1.0.0
```

生产部署通过 Secret/Volume 挂载 Lua/IAM 密钥文件到 `/usr/local/openresty/nginx/lua/keys/`，不在镜像或仓库保存真实私钥。最终镜像仅复制 `lua/sign.lua`、`lua/sign_api.lua`、`lua/config.lua`，并创建空的 `lua/keys/` 目录；`private-key.der`、`public-key.der` 以及可选 `iam-key-id.txt`、`iam-public-key.pem` 均须由运行环境提供。

## Nginx 路径

- `${CONTEXT_PATH}/api/` → Gateway 根路径。
- `${CONTEXT_PATH}/auth/` → IAM `/auth/`。
- `${CONTEXT_PATH}/doc/` → Gateway。
- `${CONTEXT_PATH}/lua/sign_code` → Lua 签名处理。
- 其他路径 → 静态资源和 SPA `index.html` 回退。

修改代理规则时验证 Context Path rewrite 后的实际上游路径，避免多删或多加一段服务前缀。

## 部署前检查

- `npm run build` 通过。
- 镜像可以在目标架构构建，luaossl 加载成功。
- `SERVER_PORT` 与 Service/Ingress 健康检查端口一致。
- `VITE_CONTEXT_PATH`、`CONTEXT_PATH`、main-shell entry/activeRule 一致。
- Gateway/IAM DNS、端口、网络策略和证书正确。
- SSO Redirect URI 与公开域名一致。
- 资源配置已导入，应用编码与 `VITE_APPLICATION_CODE` 一致。
- 静态资源、刷新路由、独立登录、qiankun mount/update/unmount 均验证。
- 日志和镜像层不包含 Token、Client 私钥或生产密钥。

## 镜像内容与敏感配置

最终镜像包含 Vite `dist/`、OpenResty/Nginx 模板、入口脚本、Lua 签名代码和 luaossl 运行时；不包含仓库源代码、文档、`.git` 或 `lua/keys/` 内容。`.dockerignore` 会从构建上下文排除 `.env`、Markdown 文档和 `lua/keys/README.md`，但已跟踪的 `.env.production` 会进入构建阶段供 Vite 读取；它目前只含公开的运行时占位配置，且不会被复制到最终镜像。维护者在首次公开推送前必须复核它、Docker 构建日志和最终镜像，确保没有新增的 Token、私有地址或凭据。`.dockerignore` 不能治理 Git 历史或已经打包的内容。

不要把生产秘密放入 `VITE_*`、`env-config.js` 或 Docker build args；它们会暴露给浏览器用户或镜像检查者。通过部署平台 Secret、受控 Volume 或环境配置注入真实密钥、Gateway/IAM 地址和 SSO 配置。

## 回滚

镜像使用不可变版本 Tag，保留上一个可用镜像和对应资源配置。模板升级可能同时改变前端产物与平台资源，回滚前确认两者兼容，不能只回滚镜像而保留不兼容的页面/权限配置。
