# Sổ ghi lỗi của Claude

Mỗi khi Claude làm sai và được sửa, thêm 1 dòng theo mẫu:
`ngày | Issue | sai gì | vì sao | đã sửa thế nào`

Cuối mỗi giai đoạn: sai cùng kiểu từ 2 lần → đề xuất thêm vào CLAUDE.md / hook / skill (xem WORKFLOW.md mục 6).

---

2026-10-09 | chưa có Issue (nhánh feat/giao-dien-3-trang) | `PageShell` trả về 3 phần tử rời (header, main, footer) → bấm "Blog" hoặc chủ đề trong Hero thì trang nhảy xuống đáy (chỗ form Newsletter) | Sau khi chuyển trang Next.js gọi `scrollIntoView` trên từng phần tử gốc của trang mới, footer được cuộn tới trước; `scroll-behavior: smooth` trong globals.css làm lệnh đó chạy kịp nên các lệnh sau không kéo về đầu trang | Bọc ba phần tử trong một `<div>` gốc duy nhất ở `src/components/layout/PageShell.tsx`; luôn để mỗi trang/layout có MỘT thẻ gốc, giữ `scroll-behavior: smooth`

