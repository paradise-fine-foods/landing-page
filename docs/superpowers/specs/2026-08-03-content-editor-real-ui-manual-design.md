# Thiết kế hướng dẫn Content Editor với ảnh giao diện thật

Ngày: 2026-08-03

## Mục tiêu

Đặt hướng dẫn Content Editor tiếng Việt trong cả frontend và Directus. Bổ sung ảnh giao diện Directus thật để người không chuyên kỹ thuật nhận biết đúng vị trí, trường và thao tác. Nội dung QA và ảnh minh họa phải có ý nghĩa; không dùng chữ mẫu hoặc ảnh giữ chỗ.

## Đầu ra

- Frontend: `docs/user-manuals/content-editor-vi.md` và `docs/user-manuals/images/`.
- Directus: giữ bản đồng bộ tại `docs/user-manuals/content-editor-vi.md` và `docs/user-manuals/images/`.
- Giữ tám SVG hiện có để giải thích luồng tổng thể.
- Thêm khoảng mười PNG giao diện thật trong `docs/user-manuals/images/ui/`.
- Hai bản manual và toàn bộ assets phải giống nhau sau khi hoàn tất.

## Dữ liệu QA

- Tạo một tài khoản tạm chỉ có vai trò **Content Editor**.
- Tạo bộ nội dung song ngữ có chủ đề matcha hữu cơ, gồm Product, Blog Post và các quan hệ cần thiết.
- Nội dung phải đọc tự nhiên, hữu ích và đầy đủ trường bắt buộc; tên bản ghi có dấu hiệu QA để tránh nhầm với nội dung thật.
- Tạo hai ảnh nội dung mới: ảnh sản phẩm matcha và ảnh bài viết về bảo quản matcha.
- Tải ảnh chỉ vào thư mục **Public CMS**.
- Có thể xuất bản nội dung QA trong thời gian ngắn để chụp trạng thái và kiểm tra, rồi lưu trữ và xóa sau khi hoàn tất.

## Bộ ảnh giao diện

Ảnh dự kiến:

1. Thanh điều hướng đúng với vai trò Content Editor.
2. Tạo bản ghi mới.
3. Nhập bản tiếng Anh.
4. Nhập bản tiếng Việt.
5. Product: Brand, ảnh và benefits.
6. Product: Categories, Applications và Audience Channels.
7. Tải hoặc chọn ảnh trong Public CMS.
8. Blog Post: rich text, ảnh, Published At và Reading Minutes.
9. Chuyển Draft sang Published và lưu.
10. Archived hoặc thông báo quan hệ phụ thuộc.

Mỗi PNG:

- Là ảnh chụp từ Directus production đang triển khai.
- Được cắt gọn quanh vùng thao tác; giữ đủ ngữ cảnh để tìm lại vị trí.
- Có thể thêm số bước, mũi tên hoặc khung nhấn tiếng Việt khi cần.
- Không chứa email, mật khẩu, token, ID, thông tin tài khoản hoặc mục quản trị ngoài quyền Content Editor.
- Có alt text mô tả mục đích và chú thích ngay dưới trong Markdown.
- Dùng tên ổn định dạng `01-dieu-huong-content-editor.png`.

## Cấu trúc manual

- Giữ nội dung nghiệp vụ đã được review: quyền, hai singleton, bảy nhóm lặp lại, song ngữ, hình ảnh, quan hệ, xuất bản, lưu trữ, lỗi và danh sách kiểm tra.
- Chèn ảnh thật ngay sau thao tác mà ảnh minh họa.
- Giữ SVG tại các đoạn cần hiểu luồng hoặc quan hệ tổng thể.
- Không lặp lại cùng hướng dẫn chỉ để đặt ảnh.
- Cảnh báo trước thao tác Published, Draft hoặc Archived có thể thay đổi nội dung công khai.

## Quy trình chụp an toàn

1. Dùng Administrator tạo user QA và dữ liệu nền cần thiết.
2. Dùng phiên Chrome tách biệt cho user QA nếu trình duyệt hỗ trợ.
3. Nếu không thể tách phiên mà không đăng xuất Administrator, dừng và xin phép trước khi thay đổi phiên đăng nhập hiện tại.
4. Chụp chỉ vùng giao diện Content Editor cần dùng.
5. Rà từng ảnh trước khi lưu vào repo; cắt hoặc che mọi thông tin ngoài phạm vi.
6. Xóa user QA, bản ghi, quan hệ và file QA bằng Administrator sau khi ảnh được xác nhận.

## Đồng bộ và phát hành

- Directus là nguồn nội dung manual hiện tại; frontend nhận bản sao đồng bộ.
- Sau khi thêm PNG và cập nhật Markdown, so sánh cây `docs/user-manuals/` giữa hai repo bằng hash nội dung.
- Commit riêng trong mỗi repo.
- Trước push, xác nhận remote `main` chưa tiến thêm.
- Push Directus trước, frontend sau.
- Không thay đổi code, schema, dependency hoặc dữ liệu production hiện có.

## Kiểm tra chất lượng

- Khoảng mười PNG giao diện thật tồn tại và hiển thị từ Markdown.
- Tám SVG hiện có vẫn hợp lệ và còn được tham chiếu.
- Mọi ảnh có alt text và chú thích tiếng Việt.
- Chữ trong PNG đọc được ở kích thước xem tài liệu thông thường; không tràn hoặc che nút quan trọng.
- Không có thông tin nhạy cảm hoặc dữ liệu production ngoài phạm vi QA.
- Product và Blog Post QA hoàn thành được theo manual bằng vai trò Content Editor.
- Hai repo có bản manual và assets giống nhau.
- Toàn bộ dữ liệu QA được xóa sau khi chụp; nội dung hiện có không đổi.
- `git diff --check` đạt trong cả hai repo.

## Ngoài phạm vi

- Thay đổi giao diện Directus hoặc frontend.
- Thêm extension, dependency hoặc công cụ tài liệu mới.
- Dùng GIF hoặc video trong phiên bản này.
- Giữ tài khoản, bản ghi hoặc file QA sau khi hoàn tất.
