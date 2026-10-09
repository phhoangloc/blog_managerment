import DOMPurify from "isomorphic-dompurify";

// The stored HTML is sanitized again before it is rendered
export default function Prose({ html }: { html: string }) {
  return <div className="prose-blog" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}
