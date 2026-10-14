# 诗出有名

米色纸张风格的选字拼诗闯关小游戏。直接用浏览器打开 `index.html` 即可，无需安装依赖或构建。

## 玩法

- 根据诗名、作者和相邻一句，从 18 个打乱的文字块中按顺序拼出缺失的诗句。
- 每个字一个块，目标句长为 4—7 字，混入干扰字；重复字会提供足够数量的独立块。
- 拼对后点击「以诗出招」。伤害 =（诗句字数 − 本句帮助补字数）× 2，无其他伤害加成。
- 「帮助」每次补正一个字，并固定该位置。补出的字不计伤害；撤回、重选不会退回帮助消耗。
- 「床前明月光」不使用帮助为 10 点伤害，帮助一次为 8 点，全部帮助为 0 点。
- 点已选的字可撤回；「重选」清除手动选择。拼错可重试，不扣元气。
- 拼对后，存活的怪物反击 4 点元气（包括 0 伤害攻击）；击败怪物恢复 20 点。
- 怪物血量依次为 24、30、36、42、50。每次拼对后换题，帮助消耗随新题重置。
- 共五关。支持重新开始、音效开关、玩法弹窗与手机布局。

## 文件

- `index.html`：页面结构
- `style.css`：响应式布局、纸张风格、CSS 小妖和动画
- `layout.css`：桌面宽屏与场景布局
- `tiles.css`：文字块、拼句槽、帮助面板及紧凑布局
- `poems.js`：唐诗、宋词、元曲诗库
- `game.js`：出题、选字、帮助扣伤害、战斗和关卡逻辑

题目来自本地诗库。可在 `poems.js` 的 `POEMS` 数组中扩充诗句。无需网络即可游戏；在线时会尝试加载 Noto Serif SC 字体，离线时使用系统宋体。刷新页面会重新开始。

## GitHub + Render 公网部署

1. 将本文件夹中的 `index.html`、`style.css`、`layout.css`、`tiles.css`、`poems.js`、`game.js`、`render.yaml`、`.gitignore` 和 `README.md` 提交到自己的 GitHub `sing` 仓库根目录。
2. 登录 <https://dashboard.render.com/>，选择 **New → Blueprint**，授权 GitHub 并选择 `sing` 仓库。
3. Render 会读取 `render.yaml`，创建名为 `sing` 的 Static Site，确认部署。
4. 部署成功后，使用 Render 显示的 `https://….onrender.com` 地址访问。实际子域名由 Render 分配，不一定是 `sing.onrender.com`。

也可以选择 **New → Static Site** 手动连接仓库：Build Command 填 `echo "Static site ready"`，Publish Directory 填 `.`，Root Directory 留空，开启 Auto-Deploy。

站点由 Render 托管，不需要本机保持开机、开放端口或配置局域网。后续推送 GitHub 会自动更新。公网访问仍取决于访问者网络能否连接 Render，并不保证所有地区或网络均可访问。
