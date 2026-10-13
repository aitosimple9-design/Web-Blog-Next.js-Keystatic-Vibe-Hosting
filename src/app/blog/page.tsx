// /blog → chủ đề đầu tiên (wireframe không có tab "Tất cả"; Q13 sẽ chốt lại nếu cần).
import { permanentRedirect } from "next/navigation";
import { topics } from "@/config/topics";

export default function BlogIndex() {
  permanentRedirect(`/blog/${topics[0].slug}`);
}
