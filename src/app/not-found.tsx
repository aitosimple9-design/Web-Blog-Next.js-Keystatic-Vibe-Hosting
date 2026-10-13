import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <PageShell tone="paper">
      <section className="wrap band-y max-w-2xl text-center">
        <p className="type-eyebrow uppercase text-ink-faint">Lỗi 404</p>
        <h1 className="type-display-lg mt-s3">Không tìm thấy trang này</h1>
        <p className="type-dek mt-s4 text-ink-soft">
          Đường dẫn có thể đã đổi hoặc bài viết chưa được đăng. Quay về Trang chủ hoặc xem các bài mới nhất.
        </p>
        <div className="mt-s6 flex flex-col items-stretch justify-center gap-s3 tablet:flex-row tablet:items-center">
          <Button href="/">Về Trang chủ</Button>
          <Button href="/blog" variant="secondary">
            Xem Blog
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
