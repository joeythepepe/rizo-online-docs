/**
 * Token smoke demo — verifies frozen print classes resolve.
 * Full templates / routes land in later PRs.
 */
export default function App() {
  return (
    <div className="min-h-screen bg-[#e8e8ed] p-8">
      <p className="no-print mb-4 text-sm text-ink-secondary">
        Print token smoke demo (screen chrome only)
      </p>

      <div className="a4-page bg-paper text-ink font-sans" data-page="a4">
        <div className="flex h-full min-h-0 flex-col p-mm-14 box-border">
          <p className="text-print-label text-ink-secondary">服务方案</p>
          <p className="text-print-en-label mt-mm-1 text-ink-tertiary">
            Service package
          </p>

          <h1 className="text-print-display mt-mm-4">英国本科申请一站式服务</h1>
          <p className="text-print-en-display mt-mm-1 text-ink-secondary">
            UK Undergraduate Application Package
          </p>

          <div className="mt-mm-12 border-t border-rule pt-mm-4">
            <h2 className="text-print-title">目标客户</h2>
            <p className="text-print-en-title mt-mm-1 text-ink-secondary">
              Target customer
            </p>
            <p className="text-print-body mt-mm-4">
              计划申请英国本科的高中生及家长，需要选校定位与材料指导。
            </p>
            <p className="text-print-en-body mt-mm-1 text-ink-secondary">
              High-school students and parents applying to UK undergraduate
              programs.
            </p>
          </div>

          <div className="mt-mm-8 rounded-none bg-soft p-mm-8">
            <p className="text-print-body-sm">
              Compact body token sample ·{" "}
              <span className="text-accent">accent</span>
            </p>
            <p className="text-print-meta mt-mm-2 text-ink-tertiary">
              Meta · v0.1 token scaffold
            </p>
            <p className="text-print-en-meta mt-mm-1 text-ink-tertiary">
              Meta EN sample
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
