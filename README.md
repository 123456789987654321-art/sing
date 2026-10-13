# 诗出有名

米色纸张风格的诗词闯关小游戏。直接用浏览器打开 `index.html` 即可，无需安装依赖或构建。

## 玩法

- 在中间输入完整古诗词句，点击「以诗出招」或按 Enter；Shift + Enter 换行。
- 右侧的唐诗、宋词、元曲锦囊可点击填入，并随关卡主题和已用诗句更新。
- 每字造成 6 点伤害，连续两句额外加 15 点，关卡主题字额外加 20 点，连击最多加 25 点。
- 每关已使用的诗句不能重复；未收录的句子不会扣血。
- 有效攻击后，尚未被击败的怪物反击 8 点元气；击败怪物恢复 25 点。
- 共五关。支持重新开始、音效开关、玩法弹窗与手机布局。

## 文件

- `index.html`：页面结构
- `style.css`：响应式布局、纸张风格、CSS 小妖和动画
- `game.js`：诗库、识别、战斗和关卡逻辑

采用本地诗库匹配，非 AI 语义识别。可在 `game.js` 的 `POEMS` 数组中扩充诗句。无需网络即可游戏；在线时会尝试加载 Noto Serif SC 字体，离线时使用系统宋体。刷新页面会重新开始。

## GitHub + Render 公网部署

1. 将本文件夹中的 `index.html`、`style.css`、`game.js`、`render.yaml`、`.gitignore` 和 `README.md` 提交到自己的 GitHub `sing` 仓库根目录。
2. 登录 <https://dashboard.render.com/>，选择 **New → Blueprint**，授权 GitHub 并选择 `sing` 仓库。
3. Render 会读取 `render.yaml`，创建名为 `sing` 的 Static Site，确认部署。
4. 部署成功后，使用 Render 显示的 `https://….onrender.com` 地址访问。实际子域名由 Render 分配，不一定是 `sing.onrender.com`。

也可以选择 **New → Static Site** 手动连接仓库：Build Command 填 `echo "Static site ready"`，Publish Directory 填 `.`，Root Directory 留空，开启 Auto-Deploy。

站点由 Render 托管，不需要本机保持开机、开放端口或配置局域网。后续推送 GitHub 会自动更新。公网访问仍取决于访问者网络能否连接 Render，并不保证所有地区或网络均可访问。
