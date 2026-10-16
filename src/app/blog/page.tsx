// /blog → chủ đề đầu tiên (wireframe không có tab "Tất cả"; Q13 sẽ chốt lại nếu cần).
import { permanentRedirect } from "next/navigation";
import { getTopics } from "@/lib/topics";

export default function BlogIndex() {
  permanentRedirect(`/blog/${getTopics()[0].slug}`);
}
