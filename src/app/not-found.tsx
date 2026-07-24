import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ui-background font-ui text-ui-foreground">
      <p className="text-sm font-medium">页面不存在</p>
      <Link
        href="/"
        className="text-sm text-ui-muted-foreground underline-offset-2 hover:text-ui-foreground hover:underline"
      >
        ← 返回方案库
      </Link>
    </div>
  );
}
