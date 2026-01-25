# Mô phỏng Lỗ hổng CVE-2025-1094: PostgreSQL Invalid UTF-8 SQL Injection

Dự án này là môi trường giả lập an toàn (Proof of Concept) để nghiên cứu lỗ hổng CVE-2025-1094. Lỗ hổng này cho phép kẻ tấn công thực hiện SQL Injection bằng cách sử dụng các chuỗi byte UTF-8 không hợp lệ để đánh lừa cơ chế escaping của cơ sở dữ liệu/driver.

## 🛠 Yêu cầu hệ thống
- **Docker** và **Docker Compose**.

## 🚀 Hướng dẫn chạy (Docker A-Z)

1.  **Cài đặt Docker:**
    - Nếu chưa có, tải Docker Desktop tại: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) và cài đặt.
    - Mở terminal, gõ `docker --version` để kiểm tra.

2.  **Khởi chạy Lab:**
    - Mở terminal tại thư mục chứa file này (`cve-2025-1094-lab`).
    - Chạy lệnh sau để build và bật server:
      ```bash
      docker-compose up --build
      ```
    - Chờ đến khi thấy dòng chữ: `Server running on port 3000` và `database system is ready to accept connections`.

3.  **lệnh cơ bản của lab**
    - update lại container: docker-compose up -d
    - xóa toàn bộ volume: docker-compose down -v

## 📂 Giải thích cấu trúc file

* **`docker-compose.yml`**: File cấu hình để bật 2 container: `db` (PostgreSQL 16.1 - phiên bản lỗi) và `app` (Node.js server).
* **`init.sql`**: Script chạy tự động khi database khởi tạo lần đầu. Nó tạo bảng `users` và thêm 8 tài khoản (bao gồm `admin` và `user`).
* **`server.js`**: Backend xử lý logic.
    * Chứa hàm `vulnerableEscape()`: Mô phỏng logic sai lầm của lỗ hổng. Khi gặp byte `0xBF`, nó bỏ qua việc escape ký tự tiếp theo.
    * Endpoint `/login`: Nhận chuỗi Hex từ client, giải mã, chạy qua hàm lỗi và thực thi SQL.
* **`index.html`**: Giao diện test. Chứa script gửi mã Hex độc hại (`attackLogin`).

## 🎯 Hướng dẫn Mô phỏng Tấn công

### Nguyên lý lỗ hổng (CVE-2025-1094)
### - kí tự lỗi: ¿
Bình thường, để chống SQL Injection, chúng ta escape dấu nháy đơn `'` thành `''`.
Tuy nhiên, CVE-2025-1094 lợi dụng việc xử lý sai các byte UTF-8 không hợp lệ.
- Kẻ tấn công gửi byte `0xBF` (một byte rác trong UTF-8) ngay trước dấu `'`.
- Cơ chế escape nhìn thấy `0xBF`, nghĩ rằng đó là byte đầu của một ký tự đa byte (multibyte character), nên nó "nuốt" luôn byte tiếp theo (là dấu `'`) và coi cả tổ hợp `0xBF + '` là một ký tự lạ.
- Kết quả: Dấu `'` KHÔNG bị biến thành `''`. Khi vào câu SQL, database lại tách `0xBF` ra (vì nó invalid) và nhìn thấy dấu `'` trần trụi -> **SQL Injection**.

### Các bước thực hiện:

1.  Truy cập `http://localhost:3000`.
2.  **Thử nghiệm Normal Login:** Nhập `admin` -> Bấm Login. Kết quả sẽ báo sai vì thiếu password.
    - Log server sẽ thấy SQL an toàn: `... WHERE username = 'admin'`
3.  **Thử nghiệm Attack (Nút màu đỏ):**
    - Bấm nút **"Gửi Payload Tấn Công"**.
    - Script sẽ gửi chuỗi Hex tương ứng với: `admin` + `0xBF` + `' OR 1=1--`
    - **Kết quả:** Đăng nhập THÀNH CÔNG với quyền `admin` mà không cần password!
    - **Quan sát Log:** Bạn sẽ thấy câu query thực thi là:
      ```sql
      SELECT * FROM users WHERE username = 'admin¿' OR 1=1--'
      ```
      (Dấu `'` sau `admin¿` đã thoát ra khỏi chuỗi string và kích hoạt điều kiện `OR 1=1`).

---
**LƯU Ý:** Đây là bài thực hành giáo dục trong môi trường Docker cách ly. Tuyệt đối không áp dụng kỹ thuật này vào hệ thống thực tế.