# 会话分类 / Session categories

为 Harness 左侧工作区提供独立的会话分类：工作区 → 分类 → 会话。分类属于显示与整理信息，不改变工作区成员、会话 cwd、日志或文件。

## 使用

- 顶部“进行中”列出正在运行的对话及数量；运行行用Harness原生StateDot同款转圈替代文字徽标（14px、1.5秒动画，支持减弱动态效果）。点击标题直接打开，不受工作区/分类折叠、搜索和归档开关影响。
- 后台生成结束且未查看的对话进入顶部“生成完成”列表，普通分类行显示绿色完成圆点及“生成完成”。打开对话或再次运行后消除提示。订阅原生 `useSessionStatus` 的 `completionUnread`，遵循原生当前客户端语义，不新增完成持久化或系统通知；刷新不保证保留此前未读状态。
- 工作区行 `+` 新建分类；`↗` 新建该工作区的会话，新会话默认未分类。
- 会话行 `⋯` → 移动到分类；选择“未分类”解除归类。
- 分类名称前的箭头折叠/展开；`✎` 重命名；`×` 删除分类，确认后其中会话回到未分类。
- 可将分类内的会话行拖到同工作区的目标分类（含折叠分类）或“未分类”，目标高亮，松开保存；不跨工作区移动。也可继续使用会话菜单下拉移动。分类右侧编辑/删除按钮常显，点击铅笔可重命名。
- 搜索按会话标题过滤，搜索时展开匹配列表；可勾选显示已归档会话。
- 顶部“原始列表”临时恢复原版管理界面，保留新增工作区、归档、置顶、分支、改会话名等操作。左下细线文件夹SVG按钮再切回分类视图；每次刷新/重新打开默认使用插件分类侧栏，忽略旧版原始列表偏好。
- 按钮统一为细线SVG，32px会话行、16px状态格、悬停/键盘聚焦显示行操作，运行区改为轻分隔线，使用客户端主题色。
- 每组先显示20条，可继续显示。分类数据在 Host 持久保存；工作区折叠状态保存在当前客户端。

## 实现

Host 使用 `storageDomain` 的 `session_categories` 域，`workspaces` 表，工作区ID作键。每条记录包括 categories 与 assignments；同一服务队列串行提交。删除分类与解除分配一次提交，保存失败不返回成功。分类名去除两端空白，1–100字符，同工作区不区分大小写唯一，最多200分类。

通用RPC `/api` / `session-categories` 与工具 `session_categories` 调用同一 `SessionCategories.execute`。RPC仅允许owner principal；工作区ID与session membership由Host再次校验。分类视图通过标准useWorkspaces/useSessions读取现有列表，通过uiWorkspace打开/新建会话，不更改其cwd。

客户端通过声明的 `sidebar.workspaces` 槽位注册可撤销的分类视图；`sidebar.footer.action` 提供恢复入口。无DOM劫持、无原版组件复制。分类视图以自己的分类菜单呈现；其他管理操作通过原始列表进行。其他窗口/工具更改在下次聚焦或15秒刷新后显示。

## 本地验证

使用已配置的Node执行：

```text
node --check client.js
node --check index.js
node --test --test-isolation=none model.test.js
```

测试包括生命周期与服务重建、删除回收、跨工作区隔离、错误成员拒绝、并发写、失败持久化恢复、输入校验和关闭。测试重建验证的是模型在现有表上的恢复；完整Host进程重启与实际画面以专项维护文档中的验收状态为准。

## 安装与回退

Download the release tarball from https://github.com/nuet9/dsh-session-categories/releases and install it with the Harness plugin manager. Package identity remains `@local/session-categories` for compatibility. Tested with Harness 0.2.1-rc.5; other versions are unverified. Disable the bundle to restore the original sidebar; stored categories are retained.
