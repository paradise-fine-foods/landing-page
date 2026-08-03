# Content Editor Real UI Manual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đồng bộ manual Content Editor sang frontend và bổ sung mười ảnh PNG chụp từ giao diện Directus thật bằng dữ liệu QA song ngữ có ý nghĩa.

**Architecture:** Directus giữ bản manual hiện có; frontend nhận cây tài liệu giống hệt. Controller tạo dữ liệu QA tạm, chụp Chrome dưới vai trò Content Editor, làm sạch ảnh, cập nhật manual, đồng bộ hai repo, rồi dùng Administrator xóa toàn bộ QA trước khi push.

**Tech Stack:** Markdown, SVG, PNG, Chrome, Directus Data Studio, Sharp, Git.

## Global Constraints

- Tài liệu, alt text và chú thích chỉ dùng tiếng Việt, trừ nhãn Directus cần nhận biết.
- Giữ tám SVG hiện có; thêm đúng mười PNG giao diện thật trong `docs/user-manuals/images/ui/`.
- Dữ liệu QA dùng nội dung matcha hữu cơ song ngữ có ý nghĩa; không dùng chữ mẫu hoặc ảnh giữ chỗ.
- Hai ảnh nội dung mới phải thể hiện sản phẩm matcha và cách bảo quản matcha.
- User QA chỉ có vai trò Content Editor; file QA chỉ nằm trong Public CMS.
- Mọi PNG hướng dẫn phải được chụp trong phiên đăng nhập của user QA Content Editor; không dùng phiên Administrator để chụp thay.
- PNG không chứa email, mật khẩu, token, ID, thông tin tài khoản hoặc mục quản trị ngoài quyền Content Editor.
- Không thay đổi code, schema, dependency hoặc dữ liệu production hiện có.
- Toàn bộ user, record, relation và file QA phải được xóa trước khi phát hành.
- Directus push trước; frontend push sau; mỗi lần push phải xác nhận remote main chưa tiến thêm.

---

### Task 1: Tạo hai ảnh nội dung QA

**Files:**
- Create temporarily: `.superpowers/manual-ui-qa/matcha-product.png`
- Create temporarily: `.superpowers/manual-ui-qa/matcha-storage.png`

**Interfaces:**
- Consumes: chủ đề QA matcha hữu cơ.
- Produces: hai PNG không chứa chữ, logo hoặc nhãn hiệu thật để Task 2 tải vào Public CMS.

- [ ] **Step 1: Tạo ảnh sản phẩm**

Dùng image generation với prompt: ảnh sản phẩm thương mại chân thực, một túi matcha hữu cơ không nhãn cạnh bát bột matcha xanh và chổi tre, ánh sáng tự nhiên, nền sáng sạch, bố cục ngang 4:3, không chữ, không logo, không watermark.

- [ ] **Step 2: Tạo ảnh bài viết**

Dùng image generation với prompt: ảnh biên tập chân thực về bảo quản matcha, hộp kín màu trung tính, thìa gỗ và bột matcha xanh đặt trong tủ bếp mát tối, ánh sáng mềm, bố cục ngang 16:9, không chữ, không logo, không watermark.

- [ ] **Step 3: Kiểm tra trực quan**

Mở từng PNG ở độ phân giải gốc. Expected: nội dung đúng chủ đề, không chữ/logo/watermark, không lỗi hình rõ ràng.

### Task 2: Tạo dữ liệu QA và chụp mười bước giao diện

**Files:**
- Create: `docs/user-manuals/images/ui/01-dieu-huong-content-editor.png`
- Create: `docs/user-manuals/images/ui/02-tao-ban-ghi.png`
- Create: `docs/user-manuals/images/ui/03-ban-dich-tieng-anh.png`
- Create: `docs/user-manuals/images/ui/04-ban-dich-tieng-viet.png`
- Create: `docs/user-manuals/images/ui/05-san-pham-thuong-hieu-hinh-loi-ich.png`
- Create: `docs/user-manuals/images/ui/06-san-pham-quan-he.png`
- Create: `docs/user-manuals/images/ui/07-tai-anh-public-cms.png`
- Create: `docs/user-manuals/images/ui/08-bai-viet-noi-dung-ngay-doc.png`
- Create: `docs/user-manuals/images/ui/09-xuat-ban.png`
- Create: `docs/user-manuals/images/ui/10-luu-tru-quan-he-phu-thuoc.png`

**Interfaces:**
- Consumes: hai ảnh Task 1, Content Editor role/policy hiện có.
- Produces: mười PNG đã cắt gọn, chỉ chứa giao diện editor và dữ liệu QA.

- [ ] **Step 1: Tạo user QA**

Trong Administrator, tạo user có tên hiển thị `QA Manual Editor`, email tạm không xuất hiện trong ảnh, mật khẩu ngẫu nhiên, role duy nhất **Content Editor**. Không cấp Administrator hoặc policy khác.

- [ ] **Step 2: Tạo taxonomy QA**

Tạo và Published các record song ngữ:

- Brand: `[QA] Aozora Organic Foods` / `[QA] Thực phẩm hữu cơ Aozora`.
- Category: `[QA] Tea & Botanical Powders` / `[QA] Bột trà và thực vật`.
- Application: `[QA] Beverage and Bakery Preparation` / `[QA] Pha chế và làm bánh`.
- Audience Channel: `[QA] Cafés, Hotels and Bakeries` / `[QA] Quán cà phê, khách sạn và tiệm bánh`.

Mỗi bản dịch có slug chữ thường, mô tả đầy đủ và ảnh/mô tả ảnh khi validation yêu cầu.

- [ ] **Step 3: Tải hai ảnh vào Public CMS**

Đặt tên `qa-manual-organic-matcha` và `qa-manual-matcha-storage`. Xác nhận thư mục là **Public CMS**, MIME là image và preview hiển thị đúng.

- [ ] **Step 4: Tạo Product QA song ngữ**

EN: `[QA] Organic Culinary Matcha`; VI: `[QA] Bột matcha hữu cơ dùng cho chế biến`. Điền slug, mô tả, Uji–Kyoto làm xuất xứ, túi 500 g có khóa kéo, bảo quản kín ở nơi mát tối, nhiệt độ 5–20°C, ảnh + alt, Brand, ba taxonomy và benefits ngắn về màu xanh, vị umami và khả năng hòa trộn.

- [ ] **Step 5: Tạo Blog Post QA song ngữ**

EN: `[QA] How to Store Matcha for Fresh Colour and Aroma`; VI: `[QA] Cách bảo quản matcha để giữ màu và hương thơm`. Body có ba phần: tránh ánh sáng/nhiệt, dùng hộp kín, để trở về nhiệt độ phòng trước khi mở. Điền excerpt, category, slug, ảnh + alt, Published At là ngày QA và Reading Minutes là `4`.

- [ ] **Step 6: Dùng phiên Content Editor**

Mở phiên Chrome tách biệt nếu được hỗ trợ. Đăng nhập user QA; xác nhận tài khoản chỉ có role **Content Editor**, sidebar chỉ có phạm vi editor, và các mục Users, Settings, Teams, policies, schema, Flows, Languages không dùng được. Nếu không thể tách phiên mà không làm mất Administrator session, dừng và xin phép trước khi đăng xuất.

- [ ] **Step 7: Chụp mười ảnh**

Trong phiên user QA Content Editor, chụp đúng các trạng thái theo tên file. Với ảnh 09, Product QA ở Published. Với ảnh 10, thử Archived một taxonomy đang được Product Published dùng để hiện thông báo phụ thuộc, rồi giữ taxonomy Published. Không chụp từ phiên Administrator; không chụp email/user menu/URL có ID.

- [ ] **Step 8: Cắt và rà ảnh**

Cắt quanh vùng thao tác, giữ nhãn collection/field/nút. Dùng Sharp đã cài trong workspace nếu cần. Expected: cạnh dài tối thiểu 1200 px, chữ đọc được, không dữ liệu nhạy cảm, không vùng Administrator.

### Task 3: Cập nhật manual Directus và đồng bộ frontend

**Files:**
- Modify: Directus `docs/user-manuals/content-editor-vi.md`
- Create: Directus `docs/user-manuals/images/ui/*.png`
- Create: Frontend `docs/user-manuals/content-editor-vi.md`
- Create: Frontend `docs/user-manuals/images/*.svg`
- Create: Frontend `docs/user-manuals/images/ui/*.png`

**Interfaces:**
- Consumes: mười PNG Task 2 và manual đã review tại Directus commit `b0b39ab`.
- Produces: hai cây `docs/user-manuals/` giống nhau.

- [ ] **Step 1: Chèn ảnh vào manual**

Đặt mỗi PNG ngay sau thao tác tương ứng. Mỗi ảnh có alt text mô tả mục đích và chú thích `*Ảnh giao diện N — ...*`. Không lặp đoạn hướng dẫn đã có.

- [ ] **Step 2: Kiểm tra liên kết Directus**

Run:

```powershell
$doc = Get-Content -Raw -Encoding UTF8 docs/user-manuals/content-editor-vi.md
$ui = [regex]::Matches($doc, '!\[[^\]]+\]\((images/ui/[^)]+\.png)\)')
if ($ui.Count -ne 10) { throw "Expected 10 UI images, found $($ui.Count)" }
foreach ($m in $ui) { if (-not (Test-Path (Join-Path docs/user-manuals $m.Groups[1].Value))) { throw "Missing $($m.Groups[1].Value)" } }
```

Expected: exit code 0.

- [ ] **Step 3: Đồng bộ sang frontend**

Sao chép toàn bộ `docs/user-manuals/` từ Directus worktree sang frontend worktree. Không sao chép `.superpowers` hoặc file QA tạm.

- [ ] **Step 4: So sánh hash hai repo**

Tạo danh sách đường dẫn tương đối + SHA-256 cho hai cây. Expected: danh sách giống hệt, gồm một Markdown, tám SVG và mười PNG.

- [ ] **Step 5: Commit Directus**

```powershell
git add docs/user-manuals
git commit -m "docs: add real UI editor walkthrough"
```

- [ ] **Step 6: Commit frontend**

```powershell
git add docs/superpowers/specs/2026-08-03-content-editor-real-ui-manual-design.md docs/superpowers/plans/2026-08-03-content-editor-real-ui-manual.md docs/user-manuals
git commit -m "docs: add Content Editor user manual"
```

### Task 4: Xóa QA và phát hành

**Files:**
- Delete temporary: `.superpowers/manual-ui-qa/*.png`
- No production file changes beyond docs commits.

**Interfaces:**
- Consumes: ảnh và manual đã commit.
- Produces: production không còn user/record/file QA; Directus và frontend main chứa manual giống nhau.

- [ ] **Step 1: Xóa dữ liệu phụ thuộc theo thứ tự**

Dùng Administrator: archive rồi xóa Product QA và Blog Post QA; xóa quan hệ junction; xóa Category, Application, Audience Channel và Brand QA; xóa hai file QA; cuối cùng xóa user QA.

- [ ] **Step 2: Xác nhận cleanup**

Tìm tiền tố `[QA]`, tên file `qa-manual-` và user `QA Manual Editor`. Expected: không còn kết quả; nội dung production khác không đổi.

- [ ] **Step 3: Chạy kiểm tra repo**

Trong cả hai worktree:

```powershell
git diff --check
git status --short
```

Expected: không lỗi whitespace; không file QA tạm hoặc thay đổi ngoài docs.

- [ ] **Step 4: Review độc lập**

Reviewer kiểm manual, mười PNG, dữ liệu nhạy cảm, quyền, status, dependency, đồng bộ hash và bằng chứng cleanup. Critical/Important phải sửa trước push.

- [ ] **Step 5: Push Directus**

Xác nhận `git ls-remote origin refs/heads/main` khớp base trước khi chạy:

```powershell
git push origin HEAD:main
```

- [ ] **Step 6: Push frontend**

Xác nhận `git ls-remote origin refs/heads/main` khớp base trước khi chạy:

```powershell
git push origin HEAD:main
```

- [ ] **Step 7: Xác nhận remote**

Chạy `git ls-remote` cho cả hai repo. Expected: Directus main và frontend main trỏ đúng hai HEAD đã push.
