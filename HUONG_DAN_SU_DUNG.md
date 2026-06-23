# 📖 Hướng dẫn sử dụng Confession Bot

Bot Discord quản lý confession ẩn danh, có hệ thống duyệt, thống kê, reaction emoji và lời chào mừng thành viên. Dữ liệu lưu trên **MongoDB**, chạy bằng **Docker**.

---

## 1. Yêu cầu

- [Docker](https://docs.docker.com/get-docker/) và Docker Compose
- Một **Discord Application + Bot** (tạo ở [Discord Developer Portal](https://discord.com/developers/applications))

> Không cần cài Node.js hay MongoDB thủ công — Docker lo hết.

---

## 2. Cấu hình Discord Developer Portal

Vào [Developer Portal](https://discord.com/developers/applications) → chọn application của bạn:

1. **Tab Bot:**
   - Bấm **Reset Token** → copy token (chỉ hiện 1 lần) → dùng cho `BOT_TOKEN`.
   - Mục **Authorization Flow** → **TẮT** `Requires OAuth2 Code Grant` → **Save Changes**.
     (Bật nhầm sẽ gây lỗi *"Integration requires code grant"* khi mời bot.)
   - Mục **Privileged Gateway Intents** → **BẬT** cả 2:
     - `Server Members Intent` (cần cho tính năng welcome)
     - `Message Content Intent` (**bắt buộc** để bot đọc được lệnh prefix `!...`)
2. **Tab General Information:** copy **Application ID** → dùng cho `CLIENT_ID`.

### Mời bot vào server (PHẢI kèm quyền slash command)
Dùng đúng link sau (thay `CLIENT_ID` bằng Application ID của bạn):

```
https://discord.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot%20applications.commands&permissions=277025508352
```

⚠️ **Bắt buộc có `scope=bot%20applications.commands`** (gồm 2 scope, cách nhau bởi `%20`):
- `bot` → thêm bot vào server.
- `applications.commands` → **uỷ quyền slash command**. **Thiếu scope này thì gõ `/` sẽ KHÔNG thấy lệnh nào**, dù đã deploy.

> Nếu trước đó lỡ mời bot bằng link thiếu `applications.commands` (ví dụ link chỉ có `?client_id=...`), **không cần kick bot** — chỉ cần mở lại đúng link trên để authorize lại, slash sẽ xuất hiện.

`permissions=277025508352` gồm: View Channels, Send Messages, Embed Links, Manage Messages, Create/Manage Threads, Add Reactions, Manage Roles.

**Cách chắc chắn nhất** để lấy link đúng: Developer Portal → **OAuth2 → URL Generator** → tick `bot` **và** `applications.commands` → chọn permissions ở bảng dưới → copy link tự sinh.

---

## 3. Tạo file `.env`

Tạo file `.env` ở thư mục gốc (có thể copy từ `env.example`):

```env
# Discord (bắt buộc)
BOT_TOKEN=token_bot_cua_ban
CLIENT_ID=application_id_cua_ban

# ID server để slash command hiện NGAY (tiện test). Bỏ trống = global (trễ tới ~1h).
GUILD_ID=

# MongoDB (docker-compose tự dựng MONGODB_URI từ các biến này)
MONGO_USERNAME=admin
MONGO_PASSWORD=password123
MONGO_DATABASE=confession_bot
MONGO_PORT=27017

NODE_ENV=production
```

> Lấy `GUILD_ID`: bật **Developer Mode** (User Settings → Advanced) → chuột phải icon server → **Copy Server ID**.

> ⚠️ Token viết thẳng, **không bọc nháy** `"..."`, không có khoảng trắng thừa.
> Khi chạy Docker **không cần** khai báo `MONGODB_URI` — compose tự dựng URI trỏ tới container `mongodb`.

---

## 4. Khởi động

```bash
# Build + chạy bot và MongoDB
docker compose up -d --build

# Đăng ký slash command lên Discord (chạy 1 lần, hoặc mỗi khi thêm/đổi lệnh)
# Nếu đã set GUILD_ID trong .env → lệnh hiện ngay; nếu không → đăng ký global (trễ tới ~1h)
docker compose exec bot npm run deploy

# Hoặc đăng ký ngay cho 1 server mà không cần sửa .env:
# docker compose exec -e GUILD_ID=<server_id> bot npm run deploy

# Xem log
docker compose logs -f bot
```

MongoDB và database được tạo **tự động** trong container, dữ liệu lưu ở volume `mongodb_data`.

Có thể dùng menu tiện lợi: `./docker-run.sh`

---

## 5. Thiết lập trong Discord

Sau khi bot online, một Admin chạy (chỉ cần 1 lần mỗi server):

| Việc cần làm | Slash command | Prefix command |
|---|---|---|
| Đặt kênh **đăng** confession đã duyệt | `/setconfess kenh:#kênh` (hoặc `/setconfessionchannel`) | `!setconfess` → chọn kênh trong menu |
| Đặt kênh **duyệt** (mod xem & bấm nút) | `/setreviewchannel` | `!setreview` → chọn kênh trong menu |
| Thiết lập nhanh bằng menu | `/confessionsetup` | `!confessionsetup` |
| Đăng **bảng nút** gửi confession | `/confesspanel` | — |

> Prefix mặc định là `!`. Các lệnh `!setconfess` / `!setreview` **không nhận `#kênh` trực tiếp** — chúng mở menu để bạn chọn kênh. Muốn đặt thẳng bằng tham số thì dùng slash `/setconfess` hoặc `/setconfessionchannel`.

---

## 6. Cách dùng

### Bảng nút "Đăng Confession" (khuyên dùng)
Admin chạy `/confesspanel` trong kênh muốn đặt nút → bot đăng một bảng có nút **📝 Đăng Confession**. Luồng cho người dùng:
1. Bấm nút **Đăng Confession** → hiện **form** nhập nội dung (tối đa **1000 ký tự**).
2. Gửi form → bot hiện riêng tư 2 nút **🕵️ Ẩn danh** / **👤 Hiện tên**.
3. Chọn 1 trong 2 → confession được gửi vào kênh duyệt như bình thường.

> Form (modal) của Discord chỉ chứa được ô nhập text nên việc chọn ẩn danh tách ra thành 2 nút ngay sau khi nhập — không ai khác thấy thao tác này.

### Gửi confession bằng lệnh (cách khác)
- **Slash:** `/confess noidung:<nội dung>`
- **Prefix:**
  - `!confess <nội dung>` — hiện tên người gửi
  - `!confess anon <nội dung>` — ẩn danh (cũng dùng được `anonymous` hoặc `ẩn`)

### Chế độ kiểm duyệt (linh động)
Mỗi server tự chọn:
- **BẬT** (mặc định): confession vào kênh duyệt, mod bấm **✅ Duyệt** mới đăng. Cần `/setreviewchannel`.
- **TẮT**: confession **đăng thẳng** vào kênh confession, không qua duyệt. Chỉ cần `/setconfess`.

Đổi bằng `/reviewmode bat:true` (bật) hoặc `/reviewmode bat:false` (tắt). Áp dụng cho mọi cách gửi (panel, `/confess`, `!confess`). Xem trạng thái hiện tại trong `/confessionconfig`.

Confession sẽ vào **kênh duyệt** trước (khi bật kiểm duyệt). Mod bấm nút **✅ Duyệt** / **❌ Từ chối**. Khi duyệt:
- Confession được đăng vào kênh hiển thị với số thứ tự,
- Tạo thread bình luận,
- Có nút emoji để mọi người thả cảm xúc,
- Người gửi nhận DM thông báo.

### Lệnh quản lý (mod/admin)
| Chức năng | Slash | Prefix |
|---|---|---|
| Xem cấu hình | `/confessionconfig` | `!confessionconfig` |
| Xem thống kê (confession/reaction/comment) | `/confessionstats` | `!confessionstats` |
| Danh sách confession chờ duyệt | `/pendingconfessions` | — |
| **Bật/tắt kiểm duyệt** | `/reviewmode bat:true/false` | — |

### Lệnh tiện ích
| Chức năng | Slash | Prefix |
|---|---|---|
| Trợ giúp | `/help` | `!help` (alias: `!h`, `!commands`) |
| Độ trễ | — | `!ping` |
| Thời gian hoạt động | — | `!uptime` |

### Welcome (chào mừng thành viên mới)
- `/setwelcome channel:#kênh [role] [message] [color] [banner]` — bật & cấu hình.
- `/testwelcome` — gửi thử tin chào mừng.
- Trong `message` dùng biến: `{user}`, `{server}`, `{memberCount}`.

---

## 7. Quản lý container

```bash
docker compose up -d                 # Khởi động
docker compose up -d --force-recreate # Áp dụng .env mới
docker compose restart bot           # Khởi động lại bot (KHÔNG nạp lại .env)
docker compose logs -f bot           # Xem log
docker compose down                  # Dừng
docker compose down -v               # Dừng + XÓA dữ liệu (volume Mongo)
```

> **Sửa `.env` xong phải `docker compose up -d`** thì container mới nhận giá trị mới — `restart` không đọc lại `.env`.
> Đổi `MONGO_USERNAME/PASSWORD` sau khi DB đã tạo thì phải `down -v` (mất dữ liệu) mới có hiệu lực.

---

## 8. Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân & cách sửa |
|---|---|
| `TokenInvalid: An invalid token was provided` | Token sai/cũ, hoặc `.env` chưa nạp lại. Kiểm tra: `docker compose exec bot printenv BOT_TOKEN`. Lấy token mới ở Portal → `docker compose up -d --force-recreate`. |
| `Integration requires code grant` (khi mời bot) | Tắt `Requires OAuth2 Code Grant` ở tab Bot → Save. |
| Welcome không chạy | Chưa bật **Server Members Intent** ở Portal. |
| Slash command không hiện | (1) Bot mời thiếu scope `applications.commands` → mời lại bằng link đúng (mục 2). (2) Chưa chạy `npm run deploy`. (3) Đăng ký global thì chờ tới ~1h — set `GUILD_ID` để hiện ngay. Sau cùng reload Discord (Ctrl+R). |
| Lệnh prefix `!...` hoàn toàn không phản hồi | Chưa bật **Message Content Intent** ở Portal → bot không đọc được nội dung tin nhắn. Bật xong `docker compose up -d --force-recreate`. |
| Bot không phản hồi `!confess` (nhưng lệnh khác chạy) | Chưa thiết lập kênh duyệt (`!setreview` / `/setreviewchannel`), hoặc bot thiếu quyền trong kênh. |

---

## 9. Cấu trúc nhanh

```
src/
├── index.js              # Khởi động bot
├── commands/             # Slash commands (confession, welcome, utility)
├── message-commands/     # Prefix commands (!)
├── events/               # ready, messageCreate, interactionCreate (dispatcher), ...
├── interactions/         # buttonHandler, selectMenuHandler (được dispatcher gọi)
├── models/               # Mongoose: GuildSettings, Confession, Comment, Reaction
├── data/mongodb.js       # Lớp truy cập MongoDB duy nhất
├── utils/                # logger, emojiButtons, MessageCommandHandler
└── config/bot.js         # Cấu hình (độ dài confession, màu, emoji, messages)
```
