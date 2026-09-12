# Asteria 2.0 Acceptance Mode — Fixed Public URL Refresh Contract

日期：2026-09-12
状态：在 Asteria 2.0 最终人工验收期间生效。

## 目标

用户当前通过固定公网入口验收 Asteria：

```text
https://asteria.httpwwwcardiacnexus-ukb.com/
```

因此，在最终验收结束前，任何会改变用户可见 Web 行为、样式、导航、模型内容或交互的提交，都必须把**同一 fixed public URL**刷新到当前提交并完成远端验收检查。不能只在 localhost、Playwright 临时 server 或截图中验证后就通知用户。

## 强制规则

每个 acceptance fix / RC commit 完成后，必须：

1. 普通 push 到现有 `origin/main`；
2. 确认 `HEAD == origin/main` 且 worktree clean；
3. 确认 `/home/yuukias/code/Asteria` 的 fixed shared server 正在从当前 worktree 提供页面；
4. 若现有 shared server 不能确定已加载当前 source，按 `AGENTS.md` 的 frozen command 安全重启同一个 server；
5. 若 `asteria-local` cloudflared connector 已健康，**不要重启 tunnel**；只有 connector 不存在或 fixed URL 出现 1033/不可达时，才按 `AGENTS.md` 恢复同一个 fixed tunnel；
6. 验证：
   - `http://127.0.0.1:5174/api/asteria/status`
   - `https://asteria.httpwwwcardiacnexus-ukb.com/api/asteria/status`
   - `https://asteria.httpwwwcardiacnexus-ukb.com/`
7. 使用现有 Playwright Chromium（或 Browser tool 若当前环境可用）直接访问**公网 fixed URL**，至少确认：
   - 页面加载成功且无 framework overlay；
   - 页面显示当前预期 version；
   - 本轮修改的用户可见行为已经在公网页面出现；
   - 没有意外回到旧 Asteria 1.x 启动流；
8. 在 result/final response 中明确写：

```text
PUBLIC_ACCEPTANCE_URL = https://asteria.httpwwwcardiacnexus-ukb.com/
PUBLIC_ACCEPTANCE_URL_REFRESHED = YES/NO
PUBLIC_ROOT_CHECK = PASS/FAIL
PUBLIC_STATUS_CHECK = PASS/FAIL
PUBLIC_BROWSER_SMOKE = PASS/FAIL
PUBLIC_VERSION = <observed version>
```

只要 `PUBLIC_ACCEPTANCE_URL_REFRESHED != YES`，就不能声称当前 acceptance fix 已经交付给用户验收。

## 禁止

- 不创建 quick tunnel / trycloudflare URL；
- 不创建新的 hostname、deployment project 或 alternate public link；
- 不把流量改经 VPS；
- 不修改 DNS / Cloudflare tunnel identity / fixed public URL；
- 不把 localhost-only PASS 当作 public acceptance PASS；
- 不为了刷新页面重写部署架构。

## 验收结束后的处理

该 contract 可以继续保留作为 public RC / release smoke 规范；是否在 stable 后降低为“每个 release commit 必须刷新”由后续任务决定。