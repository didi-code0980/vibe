# Hướng dẫn cài đặt — Backend Code Standards Skill

Skill này tuân theo **chuẩn mở Agent Skills** (`agentskills.io`).
Hoạt động trên tất cả các công cụ tương thích: Claude Code, Claude.ai, Cursor, VS Code (GitHub Copilot) và nhiều hơn nữa.

---

## Bảng tóm tắt nhanh

| Công cụ | Thư mục cài skill | Phạm vi |
|---|---|---|
| Claude Code | `~/.claude/skills/` (toàn cục) hoặc `.claude/skills/` (dự án) | Cá nhân / Dự án |
| Claude.ai | Upload qua Settings > Features > Skills | Cá nhân |
| Cursor | `~/.cursor/skills/` (toàn cục) hoặc `.cursor/skills/` (dự án) | Cá nhân / Dự án |
| VS Code + Copilot | `~/.copilot/skills/` (toàn cục) hoặc `.github/skills/` (dự án) | Cá nhân / Dự án |
| Mọi công cụ | `~/.agents/skills/` | Cá nhân toàn cục |

---

## 1. Claude Code (CLI)

Claude Code hỗ trợ Agent Skills ngay trong core. Skills đặt trong `.claude/skills/` sẽ được tự động phát hiện và load khi cần thiết.

### Cài toàn cục (dùng được ở mọi project)

```bash
# Giải nén gói skill
unzip backend-code-standards.zip

# Copy vào thư mục skills cá nhân
cp -r backend-code-standards ~/.claude/skills/
```

Kiểm tra lại:
```bash
ls ~/.claude/skills/backend-code-standards/
# SKILL.md  references/
```

### Cài theo project (commit vào repo, chia sẻ với cả team)

```bash
mkdir -p .claude/skills
cp -r backend-code-standards .claude/skills/
```

Commit vào version control để cả team dùng chung bộ chuẩn:
```bash
git add .claude/skills/backend-code-standards
git commit -m "chore: add backend code standards skill"
```

### Cách skill tự kích hoạt

Claude Code đọc phần `description` trong `SKILL.md` lúc khởi động session. Skill sẽ tự load khi bạn:
- Yêu cầu Claude viết Java service, controller, hoặc repository
- Yêu cầu Claude review hoặc refactor code Java
- Gõ `/backend-code-standards` để gọi thủ công

> **Lưu ý:** Skills được load lúc khởi động session. Nếu bạn cài trong lúc đang dùng, hãy restart Claude Code để nhận skill mới.

---

## 2. Claude.ai (Web / Desktop / Mobile)

Claude.ai hỗ trợ upload skill tùy chỉnh cho các gói Pro, Max, Team và Enterprise.

### Upload qua Settings

1. Mở **Claude.ai** → click avatar → **Settings**
2. Vào **Features** → **Skills** (đảm bảo đã bật *Code execution and file creation*)
3. Click **Upload Skill**
4. Upload file `backend-code-standards.zip` trực tiếp
5. Bật toggle skill **on**

Skill sẽ tự động áp dụng trong mọi cuộc trò chuyện khi bạn làm việc với code Java/Spring Boot.

### Chia sẻ cho team / tổ chức (gói Team & Enterprise)

1. Vào **Settings** → **Skills** → mở skill vừa upload
2. Click **Share** → chọn:
   - **Specific people** — nhập email thành viên cần chia sẻ
   - **Entire organization** — đăng lên thư mục skill của cả tổ chức
3. Người nhận bật skill từ danh sách Skills của họ

> **Lưu ý:** Skill đã bật trong Claude.ai tự động áp dụng luôn trên app mobile Claude và các add-in Claude for Excel / Claude for PowerPoint — không cần cài thêm.

---

## 3. Cursor

Cursor hỗ trợ Agent Skills từ phiên bản 2.3+. Skills được định nghĩa trong file `SKILL.md` bên trong thư mục `.cursor/skills/`.

### Cài toàn cục (tất cả project)

```bash
mkdir -p ~/.cursor/skills
cp -r backend-code-standards ~/.cursor/skills/
```

### Cài theo project

```bash
mkdir -p .cursor/skills
cp -r backend-code-standards .cursor/skills/
```

### Qua giao diện Cursor Settings

1. Mở Cursor → **Settings** (⌘, / Ctrl+,)
2. Tìm **Skills** hoặc vào **Cursor Settings → Rules → Skills**
3. Thêm đường dẫn đến thư mục `backend-code-standards`

### Cách skill tự kích hoạt

Cursor đọc phần `description` trong frontmatter và load skill khi agent thấy phù hợp. Bạn cũng có thể gọi thủ công:

```
/backend-code-standards
```

> Skills khác với Rules: Rules luôn được load vào mọi cuộc trò chuyện; Skills chỉ load khi cần, giúp giữ context window gọn hơn. Dùng Skills cho các hướng dẫn kiểu "how-to" như bộ coding standards này.

---

## 4. VS Code — GitHub Copilot

VS Code + GitHub Copilot hỗ trợ Agent Skills từ VS Code 1.108+ (tháng 12/2025).

### Cài toàn cục (cá nhân, tất cả project)

```bash
mkdir -p ~/.copilot/skills
cp -r backend-code-standards ~/.copilot/skills/
```

Các đường dẫn toàn cục tương đương (Copilot nhận cả ba):
```bash
~/.claude/skills/backend-code-standards/    # Copilot cũng nhận path này
~/.agents/skills/backend-code-standards/    # path chuẩn mở, dùng được mọi nơi
```

### Cài theo project

```bash
mkdir -p .github/skills
cp -r backend-code-standards .github/skills/
```

### Qua giao diện VS Code Chat Customizations

1. Mở VS Code → Command Palette (`⌘⇧P` / `Ctrl+Shift+P`)
2. Chạy: **Chat: Open Chat Customizations**
3. Chọn tab **Skills** → click **+** để thêm thư mục skill
4. Trỏ đến thư mục `backend-code-standards`

Hoặc dùng shortcut AI — gõ vào Copilot chat:
```
/create-skill
```
rồi làm theo hướng dẫn.

### Cách skill tự kích hoạt

Copilot đọc frontmatter trong `SKILL.md`. Khi bạn yêu cầu Copilot viết hoặc review code Java/Spring Boot, skill tự động được load. Cũng có thể gọi trực tiếp:
```
/backend-code-standards
```

---

## 5. Đường dẫn toàn cục (dùng được mọi công cụ)

Nếu bạn dùng nhiều công cụ và muốn một chỗ cài duy nhất được nhận bởi tất cả:

```bash
mkdir -p ~/.agents/skills
cp -r backend-code-standards ~/.agents/skills/
```

`~/.agents/skills/` là một phần của chuẩn mở Agent Skills, được nhận bởi Claude Code, GitHub Copilot, Cursor và các agent tương thích khác.

---

## Cài dùng chung cho cả team (Khuyến nghị)

Skill này được lưu trên GitLab nội bộ tại:

```
https://gitlab.tma.com.vn/sw-products/program-27-agent-skills/backend-development-skills.git
```

Cấu trúc repository:
```
backend-development-skills/
└── backend-code-standards/
    ├── SKILL.md
    ├── INSTALLATION.md
    ├── INSTALLATION.vi.md
    └── references/
        └── examples.md
```

Mỗi developer cài một lần:
```bash
# Clone repo về
git clone https://gitlab.tma.com.vn/sw-products/program-27-agent-skills/backend-development-skills.git

# Cài vào công cụ đang dùng (chọn một)
cp -r backend-development-skills/backend-code-standards ~/.claude/skills/     # Claude Code
cp -r backend-development-skills/backend-code-standards ~/.cursor/skills/     # Cursor
cp -r backend-development-skills/backend-code-standards ~/.copilot/skills/    # VS Code Copilot
cp -r backend-development-skills/backend-code-standards ~/.agents/skills/     # Universal
```

Khi standards được cập nhật, pull về và cài lại:
```bash
cd backend-development-skills && git pull

# Cài lại (ví dụ cho Claude Code)
rm -rf ~/.claude/skills/backend-code-standards
cp -r backend-code-standards ~/.claude/skills/
```

---

## Cập nhật Skill

Khi có phiên bản mới được push lên GitLab:

```bash
# Pull về từ GitLab
cd backend-development-skills && git pull

# Xóa phiên bản cũ và cài lại
rm -rf ~/.claude/skills/backend-code-standards
cp -r backend-code-standards ~/.claude/skills/
```

Sau đó restart công cụ AI để load lại.

---

## Xử lý sự cố

**Skill không tự kích hoạt**
- Kiểm tra phần `description` trong `SKILL.md` — phải mô tả rõ khi nào dùng skill
- Thử gọi thủ công: `/backend-code-standards`
- Restart công cụ sau khi cài (skills load lúc khởi động session)

**Sai cấp thư mục**
Cấu trúc phải đúng như sau:
```
✅ ~/.claude/skills/backend-code-standards/SKILL.md
❌ ~/.claude/skills/backend-code-standards/backend-code-standards/SKILL.md
```

**Cài quá nhiều skill làm chậm**
Mỗi skill tiêu tốn khoảng ~100 token để Claude quét metadata lúc khởi động. Nên giữ dưới 15 skill để đảm bảo hiệu năng tốt nhất.
