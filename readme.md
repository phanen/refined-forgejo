# Refine Forgejo

> Browser extension that simplifies the Forgejo interface and adds useful features

基于 [Refined GitHub](https://github.com/refined-github/refined-github) 移植，适配 Codeberg/Forgejo。

## Legend / 图例

- [x] 已移植
- [ ] 待移植
- [+] Forgejo 已有原生功能，无需插件
- [-] Forgejo 无此概念

---

### Repositories

- [x] **ci-link** - 仓库名旁显示 CI/CD 构建状态图标
- [x] **more-dropdown-links** - 仓库导航下拉菜单添加工具链接
- [+] **swap-branches-on-compare** - 分支对比页添加交换分支链接
- [x] **repo-age** - 侧边栏显示仓库年龄
- [-] **show-open-prs-of-forks** - 在 fork 的仓库显示向原仓库的 PR 数量
- [-] **clean-repo-filelist-actions** - 压缩仓库文件列表按钮
- [+] **new-repo-disable-projects-and-wikis** - 创建仓库时自动禁用 projects 和 wikis
- [x] **sticky-sidebar** - 侧边栏滚动时固定
- [-] **link-to-github-io** - 从仓库跳转到用户的 github.io 页面
- [+] **github-actions-indicators** - 工作流侧边栏显示手动触发和下次执行时间
- [x] **quick-repo-deletion** - 简化仓库删除，0-star repos 添加删除 fork 按钮
- [x] **archive-forks-link** - 在归档仓库中查找 forks
- [-] **clean-repo-tabs** - 将 Security/Insights 移入仓库导航下拉菜单
- [+] **repo-avatars** - 公共仓库头部显示头像
- [x] **small-user-avatars** - issue/PR 列表中用户名旁显示小头像
- [+] **action-pr-link** - 显示运行 workflow 的 PR 链接
- [x] **repo-header-info** - 显示 fork 状态和 star 数量
- [x] **visit-tag** - 查看特定 tag 的文件时添加跳转到 release/tag 的链接
- [x] **actions-run-removal** - 更快地取消/删除 workflow runs
- [x] **rerun-workflow** - 展开单独的重跑按钮，添加键盘快捷键 r f

---

### File management

- [+] **download-folder-button** - 添加下载整个文件夹的按钮
- [x] **quick-file-edit** - 仓库文件列表添加编辑按钮
- [x] **repo-wide-file-finder** - 启用键盘快捷键 t 在整个仓库搜索文件
- [+] **show-associated-branch-prs-on-fork** - fork 仓库的分支上显示关联的 PR
- [ ] **html-preview-link** - 预览 HTML 文件的链接
- [x] **file-age-color** - 高亮最近修改的文件
- [ ] **previous-version** - 一键查看文件的上一版本

---

### Code

- [x] **linkify-code** - 代码中的 issue/PR 引用和 URL 可点击
- [x] **copy-on-y** - 增强 y 快捷键复制永久链接
- [x] **linkify-symbolic-links** - 符号链接文件可点击
- [-] **list-prs-for-file** - 当前文件被 PR 修改时提醒
- [+] **refined-github.css** - 将 tab 缩减为 4 空格
- [ ] **esc-to-deselect-line** - 添加 esc 快捷键取消选择行
- [ ] **vertical-front-matter** - 将 Markdown front matter 显示为垂直表格
- [ ] **list-prs-for-branch** - 分支提交列表显示关联的 PR

---

### Writing comments

- [+] **tab-to-indent** - 🔥 评论框启用 Tab/Shift+Tab 缩进
- [x] **collapsible-content-button** - 文本编辑器添加可折叠内容按钮
- [x] **fit-textareas** - 🔥 评论框自动调整高度
- [x] **quick-comment-edit** - 一键编辑评论
- [x] **one-key-formatting** - 按 Markdown 符号时替换选中文本而非包裹
- [x] **clean-rich-text-editor** - 隐藏不必要的评论编辑器提示和工具栏
- [x] **quick-mention** - 在 issue/PR 中添加 @mention 按钮
- [+] **table-input** - 文本编辑器添加插入表格按钮
- [x] **unfinished-comments** - 通知用户未完成的评论（在隐藏标签页中）
- [x] **quick-review-comment-deletion** - 一键删除编辑中的 review 评论
- [x] **avoid-accidental-submissions** - 禁用 enter 提交（commit/PR/issue 标题），改用 ctrl+enter
- [x] **no-self-reference** - 警告自我引用链接

---

### Reading comments

- [x] **reactions-avatars** - 🔥 显示评论反应者的头像
- [-] **embed-gist-inline** - 链接到单独行的短 gist 时内嵌显示
- [ ] **comments-time-machine-links** - 添加浏览仓库和文件的历史版本链接
- [ ] **show-names** - 用户名旁显示真实姓名
- [ ] **shorten-links** - 缩短 URL 为可读引用
- [ ] **preview-hidden-comments** - 🔥 悬停预览被折叠的评论
- [ ] **highest-rated-comment** - 🔥 高亮最有用的评论
- [ ] **hide-low-quality-comments** - 隐藏反应评论（「+1」「👍」等），维护者除外
- [x] **scrollable-areas** - 限制代码块和引用的高度
- [ ] **quick-comment-hiding** - 简化隐藏评论的 UI
- [x] **open-issue-to-latest-comment** - issue 列表的评论图标链接到最后一条评论
- [-] **expand-all-hidden-comments** - alt 点击「N hidden items」时加载更多评论（200条）
- [x] **keyboard-navigation** - 添加 j/k 快捷键导航，x 标记已读/未读
- [ ] **comment-excess** - 长 issue 头部显示隐藏评论数量，Cmd/Ctrl+F 时滚动到隐藏评论

---

### Conversations

- [x] **open-all-conversations** - 一键打开所有可见的 issue/PR
- [x] **sticky-conversation-list-toolbar** - issue/PR 列表筛选工具栏固定
- [x] **sticky-comment-header** - 滚动时评论头部固定
- [x] **conversation-authors** - 高亮你或协作者开的 issue/PR
- [x] **align-issue-labels** - issue/PR 列表中标签左对齐
- [x] **sort-conversations-by-update-time** - 🔥 默认排序改为「最近更新」
- [-] **global-conversation-list-filters** - 全局 PR 搜索添加「我的仓库」「我评论的」筛选
- [x] **clean-conversation-sidebar** - 🔥 隐藏 issue/PR 侧边栏空分区
- [x] **clean-conversation-filters** - 隐藏空的 Projects 筛选
- [-] **toggle-everything-with-alt** - alt+click 切换所有类似项目
- [-] **extend-conversation-status-filters** - 切换 is:open/is:closed/is:merged 筛选
- [ ] **bugs-tab** - 如果有「bug」标签的 issue，添加 Bugs 标签页
- [ ] **pinned-issues-update-time** - 置顶 issue 显示更新时间而非创建时间
- [x] **clean-pinned-issues** - 置顶 issue 布局从并排改为标准列表
- [ ] **quick-label-removal** - 一键移除 issue/PR 标签
- [ ] **clean-conversation-headers** - 移除 PR 头部的重复信息
- [x] **dim-bots** - 淡化 bot 的提交和 PR
- [x] **esc-to-cancel** - esc 取消编辑 PR 标题
- [ ] **no-duplicate-list-update-time** - 隐藏与开/关/合并时间相同的更新时间
- [ ] **linkify-user-labels** - 将「Contributor」「Member」等标签链接到作者提交
- [ ] **jump-to-conversation-close-event** - 跳转到 issue/PR 的最后关闭事件
- [ ] **close-as-unplanned** - 一键「close as unplanned」
- [ ] **locked-issue** - 在 locked issue/PR 上显示标签

---

### Viewing pull requests

- [+] **linkify-commit-sha** - PR commit 页面添加非 PR commit 链接
- [x] **pr-filters** - PR 列表添加 Checks 和 Draft PR 下拉筛选
- [x] **unclip-checks** - 展开 checks 面板时自动显示所有检查
- [x] **pr-approvals-count** - PR 列表显示颜色编码的审核计数
- [x] **highlight-non-default-base-branch** - 非默认分支作为 base 时高亮显示
- [ ] **hide-inactive-deployments** - 隐藏 PR 中不活跃的部署
- [+] **previous-next-commit-buttons** - Commits 标签页底部添加导航按钮
- [ ] **hidden-review-comments-indicator** - PR review 中有隐藏评论时显示指示器
- [x] **conflict-marker** - PR 列表中显示有冲突的 PR
- [ ] **pr-commit-lines-changed** - PR commits 添加差异统计
- [x] **cross-deleted-pr-branches** - 删除的分支添加删除线
- [ ] **batch-mark-files-as-viewed** - PR Files 标签页批量标记已查看
- [ ] **closing-remarks** - 🔥 显示 PR 合并到的第一个 tag，建议创建 release
- [ ] **pr-jump-to-first-non-viewed-file** - 点击进度条跳转到第一个未查看文件
- [ ] **jump-to-change-requested-comment** - 跳转到最新的「更改已请求」评论
- [ ] **view-last-pr-deployment** - PR 头部添加打开最新部署的链接
- [ ] **no-unnecessary-split-diff-view** - 文件 split diff 无用时始终使用 unified diffs
- [+] **emphasize-draft-pr-label** - 更容易区分列表中的 draft PR
- [ ] **clean-checks-list** - 优先显示失败和待定的检查，展开长的检查名称
- [ ] **mobile-tabs-pr** - PR 标签页适配移动端

---

### Editing pull requests

- [ ] **sync-pr-commit-title** - 🔥 用 PR 标题作为 squash commit 标题，并同步更新
- [ ] **update-pr-from-base-branch** - 每个 PR 添加「Update branch | Rebase」按钮
- [ ] **one-click-review-submission** - 一键审核（Approve/Reject）
- [x] **pull-request-hotkeys** - 添加快捷键循环切换 PR 标签页
- [ ] **pr-branch-auto-delete** - 合并 PR 后自动删除分支
- [-] **one-click-pr-or-gist** - 一键创建 draft PR 或 public gist
- [ ] **clear-pr-merge-commit-message** - 清理 PR 合并消息中的冗余信息
- [ ] **quick-review** - PR 侧边栏添加快速审核按钮
- [ ] **pr-first-commit-title** - 用第一个 commit 作为新 PR 的标题和描述

---

### Commits

- [x] **patch-diff-links** - commit 页面添加 .patch 和 .diff 文件链接
- [x] **more-file-links** - PR/commits 中添加查看 raw、blame、history 链接
- [x] **one-click-diff-options** - Compare 页面添加「Hide whitespace」按钮和快捷键 d w
- [x] **extend-diff-expander** - 加宽「Expand diff」按钮可点击区域
- [x] **hide-diff-signs** - 隐藏 diff 符号（已有颜色编码）
- [x] **suggest-commit-title-limit** - 建议 commit/PR 标题限制在 72 字符
- [+] **tags-on-commits-list** - 提交旁显示对应标签
- [+] **mark-merge-commits-in-list** - 标记提交列表中的合并提交
- [ ] **deep-reblame** - alt+click「Reblame」时先提取关联 PR 的提交
- [x] **new-or-deleted-file** - 图标指示 PR/commits 中文件的添加/删除状态
- [x] **easy-toggle-files** - 点击文件头部切换 diff
- [-] **same-branch-author-commits** - 查看某作者的所有提交时保留分支和路径
- [+] **easy-toggle-commit-messages** - 点击提交框切换提交消息
- [-] **link-to-compare-diff** - 「X files changed」文本可点击跳转到 diff
- [x] **conventional-commits** - 在提交消息前显示 conventional commit 类型标签

---

### Tags and releases

- [+] **release-download-count** - release 资源旁显示下载计数
- [x] **releases-tab** - 添加 Releases 标签页和快捷键 g r (in **navigation-hotkeys**)
- [+] **releases-dropdown** - release 页面添加标签下拉搜索
- [x] **create-release-shortcut** - Releases 页面添加快捷键 c 创建新 release
- [x] **tag-changes-link** - 🔥 每个 tag/release 添加「自上次 tag 以来的变更」链接
- [x] **convert-release-to-draft** - 添加将 release 转为 draft 的按钮
- [x] **confirm-release** - 发布 release 时添加确认对话框
- [x] **link-to-changelog-file** - Releases 页面添加查看 changelog 文件按钮

---

### Profiles

- [ ] **user-profile-follower-badge** - 显示用户是否关注你
- [-] **profile-gists-link** - 用户资料页添加公开 gists 链接
- [ ] **mark-private-orgs** - 在你的资料页标记私有组织
- [x] **profile-hotkey** - 添加快捷键 g m 访问自己资料页 (in **navigation-hotkeys**)
- [ ] **show-user-top-repositories** - 添加用户最多 star 的仓库链接
- [ ] **hide-user-forks** - 默认隐藏 fork 和归档的仓库
- [ ] **linkify-user-location** - hovercard 和资料页的用户位置可点击
- [ ] **conversation-links-on-repo-lists** - 用户资料仓库标签页和全局搜索添加工具链接

---

### Notifications

- [x] **open-all-notifications** - 通知页面添加一键打开所有未读通知
- [x] **unread-anywhere** - 🔥 全局 header 添加按钮在任何页面打开未读通知
- [-] **select-all-notifications-shortcut** - 快捷键 a 全选通知
- [-] **stop-redirecting-in-notification-bar** - 按住 alt 时阻止从通知栏重定向
- [-] **last-notification-page-button** - 添加到通知最后一页的链接
- [x] **pr-notification-link** - PR 通知指向 Conversation 标签而非 commits 页面
- [x] **sticky-notifications-actions** - 通知操作栏固定
- [-] **clean-notifications** - 按仓库分组时通知列表更紧凑

---

### Global

- [x] **useful-not-found-page** - 🔥 404 页面添加可能的相关页面和替代选项
- [x] **selection-in-new-tab** - j/k 导航时 shift+o 在新标签页打开选中文本
- [-] **close-out-of-view-modals** - 下拉菜单不可见时自动关闭
- [+] **parse-backticks** - GitHub 忘记添加可点击的 backtick 文本
- [-] **action-used-by-link** - 查看当前 Action 的使用者
- [x] **improve-shortcut-help** - 在帮助弹窗（?）中显示所有 Refined GitHub 快捷键 (in **help-modal**)
- [x] **clean-footer** - 淡化页脚
- [+] **night-not-found** - 404 页面添加深色模式
- [x] **monospace-textareas** - 提交消息等字段使用等宽字体

---

### Netiquette

- [ ] **netiquette** - 添加不显眼的网络礼仪提醒
- [ ] **warn-pr-from-master** - 从默认分支创建 PR 时警告
- [ ] **warning-for-disallow-edits** - 取消「Allow edits from maintainers」时警告

---

### Fixes for GitHub shortcomings

- [-] **github-bugs** - 应用各种 CSS 修复
- [x] **hide-navigation-hover-highlight** - 移除仓库文件浏览器的悬停效果
- [-] **clean-repo-sidebar** - 移除仓库侧边栏不必要的冗余信息 (TODO(revisit?): https://codeberg.org/forgejo/forgejo/issues/11914)
- [-] **linkify-branch-references** - 「Quick PR」页面中的分支引用可点击
- [x] **actionable-pr-view-file** - PR 的「View file」指向分支而非 commit
- [x] **reload-failed-proxied-images** - 重试失败的图片下载
- [-] **unwrap-unnecessary-dropdowns** - 将 2 步下拉菜单改为 1 步
- [-] **prevent-link-loss** - 建议修复被 GitHub 错误缩短的链接
- [-] **prevent-duplicate-pr-submission** - 防止重复创建 PR
- [-] **command-palette-navigation-shortcuts** - ctrl+n/p 选择命令面板项目
- [x] **prevent-comment-loss** - 编辑评论时 preview 链接在新标签页打开
- [-] **fix-no-pr-search** - 搜索不包含 is:pr 时重定向到仓库 issue 列表
- [-] **clean-readme-url** - 移除 repo URL 中冗余的 readme-ov-file 参数
- [-] **click-outside-modal** - 点击模态框外部关闭
- [-] **linkify-line-numbers** - GitHub 忘记添加行号链接的地方
- [-] **sidebar-focus-file** - 滚动文件树到当前文件
- [-] **no-modals** - 禁用降低用户体验的模态框
- [x] **same-page-links** - 不应该在 新标签页打开的链接
- [+] **linkify-text** - 使某些文本可点击，如 issue 标题中的引用
- [+] **new-milestone-button** - 里程碑页面添加「New Milestone」按钮
- [-] **mark-private-repos** - 私有仓库用不同颜色高亮
- [+] **tab-size** - 代码视图默认 tab 宽度从 8 减为 4
- [x] **sticky-file-header** - 滚动时文件头部固定
- [x] **sticky-csv-header** - CSV/TSV 预览第一列横向滚动时固定
- [x] **reactions-popup** - 改进评论反应弹窗为更小尺寸
- [x] **readable-title-change-events** - 将标题变更事件的新旧标题堆叠显示
- [-] **cmd-enter** - 修复关闭 PR 上提交评论的 cmd+enter

---

### Extra

- [x] **navigation-hotkeys** - 为 Forgejo 添加常用的 GitHub 导航快捷键 (`g h`, `g i`, `s` 等)
- [x] **help-modal** - 按 `?` 显示快捷键帮助菜单

---

## Customization

大部分功能可以禁用，CSS-only 功能可以通过扩展选项页覆盖。

## Links

- [Project page](https://codeberg.org/forgejo-contrib/refined-forgejo)
- [Report issues](https://codeberg.org/forgejo-contrib/refined-forgejo/issues)
