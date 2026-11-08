# 会话分类 / Session categories

## 对话分组收纳，拖拽调整顺序

**新对话按创建时间排列，旧对话不因继续聊天而跳位；运行与待回答状态集中显示，减少翻找和来回切换。**

为 Harness 左侧工作区提供独立的会话分类：工作区 → 分类 → 会话。分类属于显示与整理信息，不改变工作区成员、会话 cwd、日志或文件。

## 功能亮点

- **添加工作区**：顶部“＋ 添加工作区”输入 Host 上已有文件夹的完整路径即可注册，无需切回原始列表。当前版本不提供目录选择弹窗，也不自动创建文件夹。
- **拖拽排序**：对话可拖入同工作区分类，通过细线落点插入排序；工作区也可拖动调整当前浏览器内的显示顺序。
- **稳定时间顺序**：未手动排序的对话按创建时间倒序，继续聊天不会改变位置；已手动排列的顺序保留。
- **未分类可收起**：普通分类、未分类和工作区均可折叠；未分类按工作区记住折叠状态，搜索时临时展开。
- **状态一眼可见**：运行转圈、等待回答/授权/计划确认、完成未读提示；刷新不保证保留完成未读状态。

## 使用

- 顶部“进行中”列出正在运行的对话及数量；运行行用Harness原生StateDot同款转圈替代文字徽标（14px、1.5秒动画，支持减弱动态效果）。点击标题直接打开，不受工作区/分类折叠、搜索和归档开关影响。
- 后台生成结束且未查看的对话进入顶部“生成完成”列表，普通分类行显示绿色完成圆点及“生成完成”。打开对话或再次运行后消除提示。订阅原生 `useSessionStatus` 的 `completionUnread`，遵循原生当前客户端语义，不新增完成持久化或系统通知；刷新不保证保留此前未读状态。
- 工作区行 `+` 新建分类；`↗` 新建该工作区的会话，新会话默认未分类。
- 会话行 `⋯` → 移动到分类；选择“未分类”解除归类。
- 分类名称前的箭头折叠/展开；`✎` 重命名；`×` 删除分类，确认后其中会话回到未分类。
- 可将分类内的会话行拖到同工作区的目标分类或“未分类”，通过行间细线指示插入位置，松开保存；不跨工作区移动。也可继续使用会话菜单下拉移动。
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
node --test --test-isolation=none model.test.js client-status.test.js
```

测试包括生命周期与服务重建、删除回收、跨工作区隔离、错误成员拒绝、并发写、失败持久化恢复、输入校验和关闭。测试重建验证的是模型在现有表上的恢复；完整Host进程重启持久化及全部视觉状态尚未独立验收。

## 安装与回退

Download the release tarball from https://github.com/nuet9/dsh-session-categories/releases and install it with the Harness plugin manager. Package identity remains `@local/session-categories` for compatibility. Tested with Harness 0.2.1-rc.5; other versions are unverified. Disable the bundle to restore the original sidebar; stored categories are retained.

## v1.0.1

修复外部客户端（包括 DeepPilot）新建会话时创建时间尚未同步导致暂时沉底的问题，并消除列表刷新请求竞争。保留手动排序；手机实际创建流程尚待验收。

## v1.0.2 — 分组排序修复

修复拖动一个分类时将整个工作区捕入手动顺序、使新会话追加到未分类底部的问题。手动排序现在按分组保存，其他分组的新会话继续按不可变创建时间排列。旧未分类全局顺序无法区分主动拖动和隐式追加，因此恢复创建时间倒序；旧记录保留，可由原版本读取。普通分类旧顺序保留。升级前可备份 Host 的 session_categories 存储。

本地语法检查与19项回归通过；已在Harness 0.2.2-rc.1启用，完整刷新后实际拖放及跨机器升级尚待验收。
