# Refine Forgejo

> Browser extension that simplifies the Forgejo interface and adds useful features

基于 [Refined GitHub](https://github.com/refined-github/refined-github) 移植，适配 Codeberg/Forgejo。

## Legend / 图例

- `[done]` 已完成
- `[N/A]` 不适用于 Forgejo（如 GitHub 特有功能）
- `[todo]` 待移植
- `[doing]` 正在进行

---

## Highlights 🔥

- `[done]` **reactions-avatars** - 在评论的 reactions 旁边显示用户头像
- `[done]` **sort-conversations-by-update-time** - 将 issue/PR 列表默认排序改为「最近更新」
- `[done]` **tab-to-indent** - 评论框启用 Tab 缩进
- `[done]` **fit-textareas** - 评论框自动调整高度

---

### Repositories

- `[todo]` **ci-link** - 仓库名旁显示 CI/CD 构建状态图标
- `[todo]` **more-dropdown-links** - 仓库导航下拉菜单添加工具链接
- `[todo]` **swap-branches-on-compare** - 分支对比页添加交换分支链接
- `[todo]` **repo-age** - 侧边栏显示仓库年龄
- `[todo]` **show-open-prs-of-forks** - 在 fork 的仓库显示向原仓库的 PR 数量
- `[todo]` **clean-repo-filelist-actions** - 压缩仓库文件列表按钮
- `[todo]` **new-repo-disable-projects-and-wikis** - 创建仓库时自动禁用 projects 和 wikis
- `[todo]` **sticky-sidebar** - 侧边栏滚动时固定
- `[todo]` **link-to-github-io** - 从仓库跳转到用户的 github.io 页面
- `[todo]` **github-actions-indicators** - 工作流侧边栏显示手动触发和下次执行时间
- `[todo]` **quick-repo-deletion** - 简化仓库删除，0-star repos 添加删除 fork 按钮
- `[todo]` **archive-forks-link** - 在归档仓库中查找 forks
- `[todo]` **clean-repo-tabs** - 将 Security/Insights 移入仓库导航下拉菜单
- `[todo]` **repo-avatars** - 公共仓库头部显示头像
- `[todo]` **small-user-avatars** - issue/PR 列表中用户名旁显示小头像
- `[todo]` **action-pr-link** - 显示运行 workflow 的 PR 链接
- `[todo]` **repo-header-info** - 显示 fork 状态和 star 数量
- `[todo]` **visit-tag** - 查看特定 tag 的文件时添加跳转到 release/tag 的链接
- `[todo]` **actions-run-removal** - 更快地取消/删除 workflow runs
- `[todo]` **rerun-workflow** - 展开单独的重跑按钮，添加键盘快捷键 r f

---

### File management

- `[todo]` **download-folder-button** - 添加下载整个文件夹的按钮
- `[todo]` **quick-file-edit** - 仓库文件列表添加编辑按钮
- `[todo]` **repo-wide-file-finder** - 启用键盘快捷键 t 在整个仓库搜索文件
- `[todo]` **show-associated-branch-prs-on-fork** - fork 仓库的分支上显示关联的 PR
- `[todo]` **html-preview-link** - 预览 HTML 文件的链接
- `[todo]` **file-age-color** - 高亮最近修改的文件
- `[todo]` **previous-version** - 一键查看文件的上一版本

---

### Code

- `[todo]` **linkify-code** - 代码中的 issue/PR 引用和 URL 可点击
- `[todo]` **copy-on-y** - 增强 y 快捷键复制永久链接
- `[todo]` **linkify-symbolic-links** - 符号链接文件可点击
- `[todo]` **list-prs-for-file** - 当前文件被 PR 修改时提醒
- `[todo]` **refined-github.css** - 将 tab 缩减为 4 空格
- `[todo]` **esc-to-deselect-line** - 添加 esc 快捷键取消选择行
- `[todo]` **vertical-front-matter** - 将 Markdown front matter 显示为垂直表格
- `[todo]` **list-prs-for-branch** - 分支提交列表显示关联的 PR

---

### Writing comments

- `[todo]` **tab-to-indent** - 🔥 评论框启用 Tab/Shift+Tab 缩进
- `[todo]` **collapsible-content-button** - 文本编辑器添加可折叠内容按钮
- `[todo]` **fit-textareas** - 🔥 评论框自动调整高度
- `[todo]` **quick-comment-edit** - 一键编辑评论
- `[todo]` **one-key-formatting** - 按 Markdown 符号时替换选中文本而非包裹
- `[todo]` **clean-rich-text-editor** - 隐藏不必要的评论编辑器提示和工具栏
- `[todo]` **quick-mention** - 在 issue/PR 中添加 @mention 按钮
- `[todo]` **table-input** - 文本编辑器添加插入表格按钮
- `[todo]` **unfinished-comments** - 通知用户未完成的评论（在隐藏标签页中）
- `[todo]` **quick-review-comment-deletion** - 一键删除编辑中的 review 评论
- `[todo]` **avoid-accidental-submissions** - 禁用 enter 提交（commit/PR/issue 标题），改用 ctrl+enter
- `[todo]` **no-self-reference** - 警告自我引用链接

---

### Reading comments

- `[done]` **reactions-avatars** - 🔥 显示评论反应者的头像
- `[todo]` **embed-gist-inline** - 链接到单独行的短 gist 时内嵌显示
- `[todo]` **comments-time-machine-links** - 添加浏览仓库和文件的历史版本链接
- `[todo]` **show-names** - 用户名旁显示真实姓名
- `[todo]` **shorten-links** - 缩短 URL 为可读引用
- `[todo]` **preview-hidden-comments** - 🔥 悬停预览被折叠的评论
- `[todo]` **highest-rated-comment** - 🔥 高亮最有用的评论
- `[todo]` **hide-low-quality-comments** - 隐藏反应评论（「+1」「👍」等），维护者除外
- `[todo]` **scrollable-areas** - 限制代码块和引用的高度
- `[todo]` **quick-comment-hiding** - 简化隐藏评论的 UI
- `[todo]` **open-issue-to-latest-comment** - issue 列表的评论图标链接到最后一条评论
- `[todo]` **expand-all-hidden-comments** - alt 点击「N hidden items」时加载更多评论（200条）
- `[todo]` **keyboard-navigation** - 添加 j/k 快捷键导航，x 标记已读/未读
- `[todo]` **comment-excess** - 长 issue 头部显示隐藏评论数量，Cmd/Ctrl+F 时滚动到隐藏评论

---

### Conversations

- `[todo]` **open-all-conversations** - 一键打开所有可见的 issue/PR
- `[todo]` **sticky-conversation-list-toolbar** - issue/PR 列表筛选工具栏固定
- `[todo]` **sticky-comment-header** - 滚动时评论头部固定
- `[todo]` **conversation-authors** - 高亮你或协作者开的 issue/PR
- `[todo]` **align-issue-labels** - issue/PR 列表中标签左对齐
- `[todo]` **sort-conversations-by-update-time** - 🔥 默认排序改为「最近更新」
- `[todo]` **global-conversation-list-filters** - 全局 PR 搜索添加「我的仓库」「我评论的」筛选
- `[todo]` **clean-conversation-sidebar** - 🔥 隐藏 issue/PR 侧边栏空分区
- `[todo]` **clean-conversation-filters** - 隐藏空的 Projects 筛选
- `[todo]` **toggle-everything-with-alt** - alt+click 切换所有类似项目
- `[todo]` **extend-conversation-status-filters** - 切换 is:open/is:closed/is:merged 筛选
- `[todo]` **bugs-tab** - 如果有「bug」标签的 issue，添加 Bugs 标签页
- `[todo]` **pinned-issues-update-time** - 置顶 issue 显示更新时间而非创建时间
- `[todo]` **clean-pinned-issues** - 置顶 issue 布局从并排改为标准列表
- `[todo]` **quick-label-removal** - 一键移除 issue/PR 标签
- `[todo]` **clean-conversation-headers** - 移除 PR 头部的重复信息
- `[todo]` **dim-bots** - 淡化 bot 的提交和 PR
- `[todo]` **esc-to-cancel** - esc 取消编辑 PR 标题
- `[todo]` **no-duplicate-list-update-time** - 隐藏与开/关/合并时间相同的更新时间
- `[todo]` **linkify-user-labels** - 将「Contributor」「Member」等标签链接到作者提交
- `[todo]` **jump-to-conversation-close-event** - 跳转到 issue/PR 的最后关闭事件
- `[todo]` **close-as-unplanned** - 一键「close as unplanned」
- `[todo]` **locked-issue** - 在 locked issue/PR 上显示标签

---

### Viewing pull requests

- `[todo]` **linkify-commit-sha** - PR commit 页面添加非 PR commit 链接
- `[todo]` **pr-filters** - PR 列表添加 Checks 和 Draft PR 下拉筛选
- `[todo]` **unclip-checks** - 展开 checks 面板时自动显示所有检查
- `[todo]` **pr-approvals-count** - PR 列表显示颜色编码的审核计数
- `[todo]` **highlight-non-default-base-branch** - 非默认分支作为 base 时高亮显示
- `[todo]` **hide-inactive-deployments** - 隐藏 PR 中不活跃的部署
- `[todo]` **previous-next-commit-buttons** - Commits 标签页底部添加导航按钮
- `[todo]` **hidden-review-comments-indicator** - PR review 中有隐藏评论时显示指示器
- `[todo]` **conflict-marker** - PR 列表中显示有冲突的 PR
- `[todo]` **pr-commit-lines-changed** - PR commits 添加差异统计
- `[todo]` **cross-deleted-pr-branches** - 删除的分支添加删除线
- `[todo]` **batch-mark-files-as-viewed** - PR Files 标签页批量标记已查看
- `[todo]` **closing-remarks** - 🔥 显示 PR 合并到的第一个 tag，建议创建 release
- `[todo]` **pr-jump-to-first-non-viewed-file** - 点击进度条跳转到第一个未查看文件
- `[todo]` **jump-to-change-requested-comment** - 跳转到最新的「更改已请求」评论
- `[todo]` **view-last-pr-deployment** - PR 头部添加打开最新部署的链接
- `[todo]` **no-unnecessary-split-diff-view** - 文件 split diff 无用时始终使用 unified diffs
- `[todo]` **emphasize-draft-pr-label** - 更容易区分列表中的 draft PR
- `[todo]` **clean-checks-list** - 优先显示失败和待定的检查，展开长的检查名称
- `[todo]` **mobile-tabs-pr** - PR 标签页适配移动端

---

### Editing pull requests

- `[todo]` **sync-pr-commit-title** - 🔥 用 PR 标题作为 squash commit 标题，并同步更新
- `[todo]` **update-pr-from-base-branch** - 每个 PR 添加「Update branch | Rebase」按钮
- `[todo]` **one-click-review-submission** - 一键审核（Approve/Reject）
- `[todo]` **pull-request-hotkeys** - 添加快捷键循环切换 PR 标签页
- `[todo]` **pr-branch-auto-delete** - 合并 PR 后自动删除分支
- `[todo]` **one-click-pr-or-gist** - 一键创建 draft PR 或 public gist
- `[todo]` **clear-pr-merge-commit-message** - 清理 PR 合并消息中的冗余信息
- `[todo]` **quick-review** - PR 侧边栏添加快速审核按钮
- `[todo]` **pr-first-commit-title** - 用第一个 commit 作为新 PR 的标题和描述

---

### Commits

- `[todo]` **patch-diff-links** - commit 页面添加 .patch 和 .diff 文件链接
- `[todo]` **more-file-links** - PR/commits 中添加查看 raw、blame、history 链接
- `[todo]` **one-click-diff-options** - Compare 页面添加「Hide whitespace」按钮和快捷键 d w
- `[todo]` **extend-diff-expander** - 加宽「Expand diff」按钮可点击区域
- `[todo]` **hide-diff-signs** - 隐藏 diff 符号（已有颜色编码）
- `[todo]` **suggest-commit-title-limit** - 建议 commit/PR 标题限制在 72 字符
- `[todo]` **tags-on-commits-list** - 提交旁显示对应标签
- `[todo]` **mark-merge-commits-in-list** - 标记提交列表中的合并提交
- `[todo]` **deep-reblame** - alt+click「Reblame」时先提取关联 PR 的提交
- `[todo]` **new-or-deleted-file** - 图标指示 PR/commits 中文件的添加/删除状态
- `[todo]` **easy-toggle-files** - 点击文件头部切换 diff
- `[todo]` **same-branch-author-commits** - 查看某作者的所有提交时保留分支和路径
- `[todo]` **easy-toggle-commit-messages** - 点击提交框切换提交消息
- `[todo]` **link-to-compare-diff** - 「X files changed」文本可点击跳转到 diff
- `[todo]` **conventional-commits** - 在提交消息前显示 conventional commit 类型标签

---

### Tags and releases

- `[todo]` **release-download-count** - release 资源旁显示下载计数
- `[todo]` **releases-tab** - 添加 Releases 标签页和快捷键 g r
- `[todo]` **releases-dropdown** - release 页面添加标签下拉搜索
- `[todo]` **create-release-shortcut** - Releases 页面添加快捷键 c 创建新 release
- `[todo]` **tag-changes-link** - 🔥 每个 tag/release 添加「自上次 tag 以来的变更」链接
- `[todo]` **convert-release-to-draft** - 添加将 release 转为 draft 的按钮
- `[todo]` **confirm-release** - 发布 release 时添加确认对话框
- `[todo]` **link-to-changelog-file** - Releases 页面添加查看 changelog 文件按钮

---

### Profiles

- `[todo]` **user-profile-follower-badge** - 显示用户是否关注你
- `[todo]` **profile-gists-link** - 用户资料页添加公开 gists 链接
- `[todo]` **mark-private-orgs** - 在你的资料页标记私有组织
- `[todo]` **profile-hotkey** - 添加快捷键 g m 访问自己资料页
- `[todo]` **show-user-top-repositories** - 添加用户最多 star 的仓库链接
- `[todo]` **hide-user-forks** - 默认隐藏 fork 和归档的仓库
- `[todo]` **linkify-user-location** - hovercard 和资料页的用户位置可点击
- `[todo]` **conversation-links-on-repo-lists** - 用户资料仓库标签页和全局搜索添加工具链接

---

### Notifications

- `[todo]` **open-all-notifications** - 通知页面添加一键打开所有未读通知
- `[todo]` **unread-anywhere** - 🔥 全局 header 添加按钮在任何页面打开未读通知
- `[todo]` **select-all-notifications-shortcut** - 快捷键 a 全选通知
- `[todo]` **stop-redirecting-in-notification-bar** - 按住 alt 时阻止从通知栏重定向
- `[todo]` **last-notification-page-button** - 添加到通知最后一页的链接
- `[todo]` **pr-notification-link** - PR 通知指向 Conversation 标签而非 commits 页面
- `[todo]` **sticky-notifications-actions** - 通知操作栏固定
- `[todo]` **clean-notifications** - 按仓库分组时通知列表更紧凑

---

### Global

- `[todo]` **useful-not-found-page** - 🔥 404 页面添加可能的相关页面和替代选项
- `[todo]` **selection-in-new-tab** - j/k 导航时 shift+o 在新标签页打开选中文本
- `[todo]` **close-out-of-view-modals** - 下拉菜单不可见时自动关闭
- `[todo]` **parse-backticks** - GitHub 忘记添加可点击的 backtick 文本
- `[todo]` **action-used-by-link** - 查看当前 Action 的使用者
- `[todo]` **improve-shortcut-help** - 在帮助弹窗（?）中显示所有 Refined GitHub 快捷键
- `[todo]` **clean-footer** - 淡化页脚
- `[todo]` **night-not-found** - 404 页面添加深色模式
- `[todo]` **monospace-textareas** - 提交消息等字段使用等宽字体

---

### Netiquette

- `[todo]` **netiquette** - 添加不显眼的网络礼仪提醒
- `[todo]` **warn-pr-from-master** - 从默认分支创建 PR 时警告
- `[todo]` **warning-for-disallow-edits** - 取消「Allow edits from maintainers」时警告

---

### Fixes for GitHub shortcomings

- `[todo]` **github-bugs** - 应用各种 CSS 修复
- `[todo]` **hide-navigation-hover-highlight** - 移除仓库文件浏览器的悬停效果
- `[todo]` **clean-repo-sidebar** - 移除仓库侧边栏不必要的冗余信息
- `[todo]` **linkify-branch-references** - 「Quick PR」页面中的分支引用可点击
- `[todo]` **actionable-pr-view-file** - PR 的「View file」指向分支而非 commit
- `[todo]` **reload-failed-proxied-images** - 重试失败的图片下载
- `[todo]` **unwrap-unnecessary-dropdowns** - 将 2 步下拉菜单改为 1 步
- `[todo]` **prevent-link-loss** - 建议修复被 GitHub 错误缩短的链接
- `[todo]` **prevent-duplicate-pr-submission** - 防止重复创建 PR
- `[todo]` **command-palette-navigation-shortcuts** - ctrl+n/p 选择命令面板项目
- `[todo]` **prevent-comment-loss** - 编辑评论时 preview 链接在新标签页打开
- `[todo]` **fix-no-pr-search** - 搜索不包含 is:pr 时重定向到仓库 issue 列表
- `[todo]` **clean-readme-url** - 移除 repo URL 中冗余的 readme-ov-file 参数
- `[todo]` **click-outside-modal** - 点击模态框外部关闭
- `[todo]` **linkify-line-numbers** - GitHub 忘记添加行号链接的地方
- `[todo]` **sidebar-focus-file** - 滚动文件树到当前文件
- `[todo]` **no-modals** - 禁用降低用户体验的模态框
- `[todo]` **same-page-links** - 不应该在 新标签页打开的链接
- `[todo]` **linkify-text** - 使某些文本可点击，如 issue 标题中的引用
- `[todo]` **new-milestone-button** - 里程碑页面添加「New Milestone」按钮
- `[todo]` **mark-private-repos** - 私有仓库用不同颜色高亮
- `[todo]` **tab-size** - 代码视图默认 tab 宽度从 8 减为 4
- `[todo]` **sticky-file-header** - 滚动时文件头部固定
- `[todo]` **sticky-csv-header** - CSV/TSV 预览第一列横向滚动时固定
- `[todo]` **reactions-popup** - 改进评论反应弹窗为更小尺寸
- `[todo]` **readable-title-change-events** - 将标题变更事件的新旧标题堆叠显示
- `[todo]` **cmd-enter** - 修复关闭 PR 上提交评论的 cmd+enter

---

## Customization

大部分功能可以禁用，CSS-only 功能可以通过扩展选项页覆盖。

## Links

- [Project page](https://codeberg.org/forgejo-contrib/refined-forgejo)
- [Report issues](https://codeberg.org/forgejo-contrib/refined-forgejo/issues)
