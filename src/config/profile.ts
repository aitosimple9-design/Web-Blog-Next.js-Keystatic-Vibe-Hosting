// Hồ sơ cá nhân cho Trang chủ (thương hiệu cá nhân). NƠI DUY NHẤT sửa nội dung trang này.
// Mọi chữ dưới đây là NỘI DUNG MẪU (đánh dấu [mẫu]) chờ Lộc thay bằng nội dung thật; chỉ tên hiển thị là thật.
// Ảnh: tạm dùng ảnh minh họa trong public/images/stock (ghi nguồn ở public/images/CREDITS.md), thay bằng ảnh thật khi có.

export const profile = {
  name: "Trần Ngọc Hoàng Ni",
  /** Một câu định vị [mẫu] */
  positioning: "Mình ghi lại điều đọng lại sau mỗi cuốn sách.",
  /** Ảnh chân dung ĐÃ XÓA PHÔNG (PNG / WebP nền trong suốt, người ngồi quay thẳng, tỉ lệ ~ 0,69). Ảnh demo Pexels (Eugene Lisyuk), xem public/images/CREDITS.md */
  portrait: { src: "/images/profile/portrait-cutout.webp", alt: "Chân dung Trần Ngọc Hoàng Ni (ảnh minh họa)", width: 1100, height: 1587 },
  /** Ảnh thứ hai ở khối Câu chuyện */
  storyImage: { src: "/images/stock/vintage-book-sofa.jpg", alt: "Cuốn sách cũ đặt trên ghế sofa", position: "50% 50%" },
} as const;

/** Khối Câu chuyện [mẫu]: 4 đoạn ngắn */
export const story = {
  title: "Vì sao mình đọc và viết",
  paragraphs: [
    "[mẫu] Mình bắt đầu đọc nghiêm túc khi nhận ra mình đọc rất nhiều nhưng quên gần hết sau vài tuần.",
    "[mẫu] Từ đó mình tập ghi lại từng cuốn sách bằng lời của mình: ý chính là gì, có ví dụ nào làm mình nhớ, và mình đã thử áp dụng ra sao.",
    "[mẫu] Blog này là nơi mình giữ những ghi chép đó, để bạn đỡ phải đọc lại từ đầu và có thể bắt đầu thử ngay trong ngày.",
    "[mẫu] Mình không viết để thay thế cuốn sách. Mình viết để bạn biết cuốn nào đáng bỏ thời gian đọc trọn vẹn.",
  ],
} as const;

/** Khối "Cách mình đọc" [mẫu]: 4 nguyên tắc */
export const principles = {
  title: "Cách mình đọc",
  dek: "Bốn nguyên tắc mình giữ khi ghi chép một cuốn sách.",
  items: [
    { title: "Diễn giải bằng lời mới", text: "[mẫu] Không chép lại câu chữ của tác giả. Mình viết lại ý bằng cách nói của mình để chắc rằng mình đã hiểu." },
    { title: "Có ví dụ", text: "[mẫu] Mỗi ý chính đi kèm một ví dụ đời thường, để bạn hình dung được và thử được." },
    { title: "Ghi nguồn", text: "[mẫu] Mỗi bài đều ghi rõ tên sách và tác giả, để bạn tìm đọc bản gốc khi muốn đi sâu." },
    { title: "Thử rồi mới viết", text: "[mẫu] Mình chỉ kể cách áp dụng khi đã tự thử, và nói thật chỗ nào chưa hiệu quả." },
  ],
} as const;

/** Khối Tủ sách [mẫu]: tên sách phải có trong src/config/covers.ts để hiện bìa; `topic` là slug chủ đề bấm tới */
export const shelf = {
  title: "Tủ sách của mình",
  dek: "Những cuốn sách ảnh hưởng đến mình nhiều nhất. Bấm vào bìa để đọc các bài cùng chủ đề.",
  books: [
    { title: "Sách mẫu 1", topic: "chu-de-1" },
    { title: "Sách mẫu 2", topic: "chu-de-2" },
    { title: "Sách mẫu 3", topic: "chu-de-3" },
    { title: "Sách mẫu 4", topic: "chu-de-1" },
    { title: "Sách mẫu 5", topic: "chu-de-4" },
    { title: "Sách mẫu 6", topic: "chu-de-5" },
  ],
} as const;
