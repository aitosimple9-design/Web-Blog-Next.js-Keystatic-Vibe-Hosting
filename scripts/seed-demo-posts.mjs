// Sinh bài MẪU (demo) để dựng và kiểm tra giao diện: content/posts/demo-*.md
// Chạy: node scripts/seed-demo-posts.mjs        (ghi đè các file demo-*.md)
// Xóa bài mẫu khi có bài thật: xóa các file content/posts/demo-*.md
// Nội dung là văn bản giữ chỗ do Claude viết, KHÔNG phải trích từ sách thật.
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = resolve(root, "content/posts");
mkdirSync(dir, { recursive: true });
for (const f of readdirSync(dir)) if (f.startsWith("demo-")) unlinkSync(resolve(dir, f));

const posts = [
  // [slug, chủ đề, tiêu đề, mô tả]
  ["demo-01-doc-it-nho-lau", "chu-de-1", "Đọc ít mà nhớ lâu: ba thói quen sau mỗi chương sách", "Sau mỗi chương, dừng lại ba phút để tự nhắc lại ý chính bằng lời của mình. Một thói quen nhỏ giúp kiến thức ở lại lâu hơn."],
  ["demo-02-ghi-chep-mot-trang", "chu-de-1", "Ghi chép gọn trong một trang giấy", "Cách rút một chương sách dài xuống còn một trang ghi chép, vừa đủ để xem lại sau vài tuần mà vẫn hiểu."],
  ["demo-03-cau-hoi-truoc-khi-doc", "chu-de-1", "Đặt câu hỏi trước khi mở sách", "Người đọc có câu hỏi sẵn thường tìm thấy câu trả lời nhanh hơn. Ba câu hỏi nên viết ra trước khi đọc."],
  ["demo-04-on-lai-sau-bay-ngay", "chu-de-1", "Ôn lại sau bảy ngày", "Một lần xem lại đúng lúc quan trọng hơn mười lần đọc lướt. Cách đặt lịch ôn nhẹ nhàng cho người bận."],
  ["demo-05-doc-song-song", "chu-de-1", "Đọc hai cuốn cùng lúc có hợp với bạn?", "Khi nào đọc song song giúp hiểu sâu hơn, và khi nào nó chỉ khiến cuốn nào cũng dang dở."],
  ["demo-06-danh-dau-sach", "chu-de-1", "Đánh dấu sách sao cho khỏi rối", "Một bộ ký hiệu đơn giản gồm ba loại dấu để lần sau mở lại, mắt tìm ra ý chính ngay."],
  ["demo-07-doc-cham", "chu-de-1", "Đọc chậm một đoạn khó", "Gặp đoạn khó, thay vì bỏ qua hãy thử bốn bước đọc chậm. Kết quả thường khiến cả chương trở nên dễ hiểu."],
  ["demo-08-thu-vien-nho", "chu-de-1", "Xây một thư viện nhỏ của riêng mình", "Không cần nhiều sách. Một kệ mười cuốn chọn kỹ có thể làm nền cho nhiều năm học."],
  ["demo-09-thoi-quen-nho", "chu-de-2", "Thói quen nhỏ, đổi thay lớn", "Vì sao hai phút mỗi ngày bền hơn một giờ cuối tuần, và cách chọn thói quen đầu tiên cho đúng."],
  ["demo-10-tap-trung-sau", "chu-de-2", "Làm việc sâu trong một thế giới nhiều thông báo", "Bốn việc nên làm trước khi bắt đầu một buổi làm việc cần tập trung, và một việc nên bỏ."],
  ["demo-11-quyet-dinh-chat", "chu-de-2", "Quyết định tốt cần dữ kiện hay cần thời gian?", "Hai sai lầm phổ biến khi ra quyết định và một câu hỏi đơn giản giúp tránh cả hai."],
  ["demo-12-nghi-nguoc", "chu-de-2", "Nghĩ ngược để thấy rõ rủi ro", "Thay vì hỏi làm sao để thành công, thử hỏi điều gì chắc chắn làm ta thất bại. Cách làm và ví dụ."],
  ["demo-13-so-tay-y-tuong", "chu-de-3", "Sổ tay ý tưởng không cần đẹp", "Một cuốn sổ tay luộm thuộm nhưng được dùng mỗi ngày hơn hẳn cuốn sổ đẹp để trong ngăn kéo."],
  ["demo-14-ke-chuyen-de-nho", "chu-de-3", "Kể chuyện để nhớ", "Khi một ý tưởng được kể thành chuyện, não bộ giữ lại dễ hơn. Ba cấu trúc kể chuyện gọn cho người mới."],
  ["demo-15-doc-bao-cao", "chu-de-3", "Đọc nhanh một bản báo cáo dài", "Cách đọc phần quan trọng trước, chi tiết sau, để nắm bản báo cáo ba mươi trang trong mười lăm phút."],
  ["demo-16-lam-viec-voi-nguoi-khac", "chu-de-3", "Làm việc cùng người khác mà không mất mình", "Giữ ranh giới rõ ràng nhưng vẫn hợp tác tốt: những câu nói giúp việc đó dễ hơn."],
  ["demo-17-tien-bac-co-ban", "chu-de-4", "Quản lý tiền bạc từ ba con số", "Ba con số cần biết mỗi tháng để nắm tình hình tài chính cá nhân, không cần bảng tính phức tạp."],
  ["demo-18-giac-ngu", "chu-de-4", "Ngủ đủ không phải là xa xỉ", "Những điều nên biết về giấc ngủ trước khi đổ lỗi cho ý chí của mình."],
  ["demo-19-van-dong-nhe", "chu-de-4", "Vận động nhẹ mỗi ngày cho người ngồi nhiều", "Một chuỗi động tác năm phút có thể làm giữa các buổi họp, kèm lý do nó có ích."],
  ["demo-20-viet-moi-ngay", "chu-de-5", "Viết mỗi ngày một đoạn", "Một đoạn văn mỗi ngày nghe nhỏ, nhưng sau ba tháng là cả một cuốn sổ ý nghĩ."],
  ["demo-21-nghe-sach-noi", "chu-de-5", "Sách nói có tính là đã đọc?", "So sánh việc nghe và đọc: khi nào nghe có ích, khi nào nên cầm sách giấy."],
];

// Bài mẫu KHÔNG có ảnh bìa (dùng hình sinh tự động); tải ảnh bìa thật trong Keystatic.

const intro = [
  "Bài này là bản mẫu dùng để dựng và kiểm tra giao diện. Nội dung do người viết giữ chỗ tự soạn, không trích từ cuốn sách nào, và sẽ được thay bằng bài thật khi blog chính thức ra mắt.",
  "Điều đáng giữ lại nằm ở cách đặt vấn đề: trước khi tìm giải pháp, hãy gọi đúng tên điều đang cản trở mình. Phần lớn thời gian ta mất đi không phải vì thiếu cách làm, mà vì chưa biết mình đang giải quyết chuyện gì.",
];
const ideas = [
  "Ý chính thứ nhất là nên bắt đầu từ việc nhỏ nhất có thể làm được ngay hôm nay. Việc nhỏ cho ta phản hồi nhanh, và phản hồi nhanh nuôi động lực tốt hơn mọi lời tự nhắc.",
  "Ý chính thứ hai là ghi lại. Một dòng ghi chú sau mỗi lần thử giúp ta thấy mình đang đi đâu, thay vì chỉ cảm thấy mình đang bận.",
  "Ý chính thứ ba là chấp nhận bản nháp. Bản nháp đầu tiên hiếm khi tốt, nhưng nó là thứ duy nhất có thể sửa được; trang giấy trắng thì không.",
];
const listItems = [
  "Chọn một việc đủ nhỏ để hoàn thành trong mười phút.",
  "Viết ra điều mình kỳ vọng xảy ra trước khi bắt đầu.",
  "Sau khi làm xong, ghi lại một điều đã học được.",
  "Xem lại ghi chép vào cuối tuần và chọn việc cho tuần sau.",
];
const example = [
  "Hãy hình dung một người đọc mỗi tối hai mươi trang sách nhưng sau một tháng không nhớ nổi mình đã đọc gì. Họ không thiếu thời gian hay ý chí; họ thiếu một khoảng dừng ngắn để biến trang sách thành điều của riêng mình.",
  "Khi họ thêm ba phút cuối buổi để viết lại ý chính bằng lời mình, cùng lượng sách ấy bỗng để lại nhiều hơn. Thứ thay đổi không phải số trang, mà là cách họ dùng khoảnh khắc sau khi đọc.",
];
const quote = "Điều ở lại không phải là điều ta đã đọc, mà là điều ta đã nghĩ lại.";
const apply = [
  "Để áp dụng, bạn không cần thay đổi cả ngày của mình. Hãy chọn đúng một thời điểm cố định, chẳng hạn ngay sau bữa tối, và gắn thói quen mới vào đó. Gắn vào một việc đã có sẵn dễ hơn nhiều so với tạo một mốc giờ mới.",
  "Nếu bỏ lỡ một ngày, đừng bù bằng hai ngày. Chỉ cần quay lại đúng nhịp cũ vào hôm sau. Thói quen bền không đến từ sự hoàn hảo mà từ việc trở lại nhanh sau mỗi lần gián đoạn.",
];
const wrap = [
  "Tóm lại, ba điều cần mang theo là việc nhỏ, ghi chép ngắn và sự kiên nhẫn với bản nháp. Chúng đủ đơn giản để bắt đầu ngay, và đủ sâu để dùng trong nhiều năm.",
];

const pick = (arr, i, n = arr.length) => arr.slice(i % arr.length).concat(arr.slice(0, i % arr.length)).slice(0, n);

posts.forEach(([slug, category, title, description], i) => {
  const date = new Date(Date.UTC(2026, 9, 3));
  date.setUTCDate(date.getUTCDate() - i * 4);
  const iso = date.toISOString().slice(0, 10);
  const book = `Sách mẫu ${(i % 7) + 1}`;
  const author = `Tác giả mẫu ${(i % 4) + 1}`;
  const body = [
    ...intro,
    "## Ý chính",
    ...pick(ideas, i, 2 + (i % 2)),
    "",
    ...listItems.map((x) => `- ${x}`),
    "",
    "## Một ví dụ",
    ...pick(example, 0, 2),
    `> ${quote}`,
    "## Cách áp dụng",
    ...pick(apply, i, 2),
    "## Tổng kết",
    ...wrap,
  ]
    .join("\n\n")
    .replace(/\n\n- /g, "\n- ")
    .replace(/(\n- [^\n]+)\n\n(?=- )/g, "$1\n");

  const fm = [
    "---",
    `title: "${title}"`,
    `slug: ${slug}`,
    `description: "${description}"`,
    `category: ${category}`,
    "subtopics:",
    `  - ${category}-con-${(i % 2) + 1}`, // chủ đề con mẫu (content/subtopics/<chủ đề>-con-1|2)
    `date: ${iso}`,
    "source:",
    `  book: "${book}"`,
    `  author: "${author}"`,
    "draft: false",
    "---",
    "",
  ].join("\n");
  writeFileSync(resolve(dir, `${slug}.md`), fm + body + "\n");
});

console.log(`Đã sinh ${posts.length} bài mẫu trong content/posts/ (demo-*.md)`);
