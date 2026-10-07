# Nguồn ảnh minh họa (demo)

Ảnh trong `public/images/stock/` lấy từ Wikimedia Commons, chỉ chọn ảnh có giấy phép cho phép dùng lại. Nén về rộng tối đa 1600px.
Ảnh giấy phép **CC BY** BẮT BUỘC ghi công tác giả (bảng dưới) khi đăng lên web thật — cần trang/dòng ghi nguồn ở chân trang (xem PLAN.md Q14, trang pháp lý). Đây là ảnh DEMO; thay bằng ảnh của chính Lộc khi có.

| File | Tác giả | Giấy phép | Trang gốc |
|---|---|---|---|
| `journal-coffee.jpg` | Cathryn Lavery cathrynlavery | CC0 | https://commons.wikimedia.org/wiki/File:Writing_in_a_journal_(Unsplash).jpg |
| `notebook-wood.jpg` | David Schwarzenberg | CC0 | https://commons.wikimedia.org/wiki/File:A_journal_writing_book.jpg |
| `books-lamps.jpg` | chuttersnap chuttersnap | CC0 | https://commons.wikimedia.org/wiki/File:Books_in_stack_with_lamps_(Unsplash).jpg |
| `reading-room.jpg` | Carol M. Highsmith | Public domain | https://commons.wikimedia.org/wiki/File:LOC_Main_Reading_Room_Highsmith.jpg |
| `notes-laptop.jpg` | Shixart1985 | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Person_writing_in_notebook_while_using_laptop_at_a_modern_workspace.jpg |
| `desk-notes.jpg` | Shixart1985 | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Person_writing_in_a_notebook_while_sitting_at_a_desk.jpg |
| `feather-pen.jpg` | Shixart1985 | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Writing_in_a_notebook_with_a_feather_pen_while_enjoying_coffee_at_a_desk_surrounded_by_flowers.jpg |
| `vintage-book-sofa.jpg` | Shixart1985 | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Reading_a_vintage_book_while_relaxing_indoors.jpg |
| `yellow-book-couch.jpg` | Shixart1985 | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Reading_a_book_while_sitting_on_a_couch.jpg |
| `reading-bed-window.jpg` | Shixart1985 | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Person_reading_a_book_while_lying_on_a_bed_next_to_a_window_during_a_rainy_day.jpg |
| `woman-reading-sofa.jpg` | Julia Spranger | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:PediaPress_Book_Reading_2.jpg |
| `reading-couch-window.jpg` | Shixart1985 | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Older_woman_reading_a_book_while_lying_on_a_couch_near_a_window_during_the_day.jpg |

Ảnh chủ đề (`src/config/topics.ts`): chu-de-1 `books-lamps`, chu-de-2 `journal-coffee`, chu-de-3 `reading-room`, chu-de-4 `notes-laptop`, chu-de-5 `vintage-book-sofa`. `notes-laptop` và `vintage-book-sofa` là CC BY 2.0: phải ghi công khi đăng lên web thật.

Bìa sách demo (`public/images/covers/sach-mau-1..7.svg`) do dự án tự vẽ bằng `scripts/gen-demo-covers.mjs`, không có bản quyền bên thứ ba; thay bằng bìa thật khi có. Sách chưa có bìa trong `src/config/covers.ts` dùng hình học tự sinh (`CoverArt`).
