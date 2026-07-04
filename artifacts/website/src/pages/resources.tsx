import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAdmin } from "@/context/AdminContext";
import { type MinistryResource } from "@/constants/ministry";
import { FileText, Video, Headphones, BookOpen, ExternalLink, Play, Download } from "lucide-react";

const CATEGORY_LABELS: Record<MinistryResource["category"], string> = {
  "bible-study": "Bible Study", devotional: "Devotional", training: "Training",
  prayer: "Prayer", pdf: "PDF", discipleship: "Discipleship",
};

const CATEGORY_COLORS: Record<MinistryResource["category"], string> = {
  "bible-study": "bg-blue-100 text-blue-700 border-blue-200",
  devotional: "bg-purple-100 text-purple-700 border-purple-200",
  training: "bg-yellow-100 text-yellow-700 border-yellow-200",
  prayer: "bg-primary/10 text-primary border-primary/20",
  pdf: "bg-gray-100 text-gray-600 border-gray-200",
  discipleship: "bg-green-100 text-green-700 border-green-200",
};

const TYPE_ICONS: Record<MinistryResource["type"], React.ReactNode> = {
  pdf: <FileText size={13} />,
  video: <Video size={13} />,
  audio: <Headphones size={13} />,
  article: <BookOpen size={13} />,
};

const ALL_CATEGORIES: Array<MinistryResource["category"] | "all"> = [
  "all", "bible-study", "devotional", "training", "prayer", "discipleship",
];

function isUploadedFile(url?: string): boolean {
  return !!url && url.startsWith("/api/uploads/");
}

function ResourceCard({ r }: { r: MinistryResource }) {
  const isLocal = isUploadedFile(r.url);
  const isAudio = r.type === "audio";
  const isVideo = r.type === "video";

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border"
      data-testid={`resource-card-${r.id}`}
    >
      <div className="flex items-start gap-2 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[r.category]}`}>
          {CATEGORY_LABELS[r.category]}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wide">
          {TYPE_ICONS[r.type]} {r.type}
        </span>
        {r.isFree && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Free</span>
        )}
      </div>

      <div>
        <p className="font-bold text-foreground text-sm leading-snug">{r.title}</p>
        {r.author && <p className="text-xs text-muted-foreground mt-0.5">by {r.author}</p>}
      </div>

      <p className="text-foreground/60 text-xs leading-relaxed">{r.description}</p>

      {r.url && isLocal && isAudio && (
        <div className="flex flex-col gap-2">
          <audio controls className="w-full h-10 rounded-lg" style={{ accentColor: "#E84C1E" }}>
            <source src={r.url} />
          </audio>
          <a href={r.url} download className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted text-muted-foreground border border-border font-medium text-xs hover:bg-muted/80 transition-colors">
            <Download size={12} /> Download audio
          </a>
        </div>
      )}

      {r.url && isLocal && isVideo && (
        <div className="flex flex-col gap-2">
          <video controls className="w-full rounded-xl max-h-64 object-contain bg-black">
            <source src={r.url} />
          </video>
          <a href={r.url} download className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted text-muted-foreground border border-border font-medium text-xs hover:bg-muted/80 transition-colors">
            <Download size={12} /> Download video
          </a>
        </div>
      )}

      {r.url && isLocal && !isAudio && !isVideo && (
        <a
          href={r.url}
          download
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-semibold text-sm hover:bg-primary/20 transition-colors"
          data-testid={`btn-resource-${r.id}`}
        >
          <Download size={13} /> Download File
        </a>
      )}

      {r.url && !isLocal && (
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-semibold text-sm hover:bg-primary/20 transition-colors"
          data-testid={`btn-resource-${r.id}`}
        >
          {r.type === "video" ? <Play size={13} /> : <ExternalLink size={13} />}
          {r.type === "audio" ? "Listen" : r.type === "video" ? "Watch" : "Access Resource"}
        </a>
      )}
    </div>
  );
}

export default function Resources() {
  const { resources } = useAdmin();
  const [activeCategory, setActiveCategory] = useState<MinistryResource["category"] | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = resources.filter((r) => {
    const matchesCat = activeCategory === "all" || r.category === activeCategory;
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <AppShell subtitle="Resources">
      <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeCategory === cat ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border"
            }`}
            data-testid={`filter-${cat}`}
          >
            {cat === "all" ? "All" : CATEGORY_LABELS[cat as MinistryResource["category"]]}
          </button>
        ))}
      </div>

      <div className="px-4 pb-2">
        <input
          type="text"
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          data-testid="input-search"
        />
      </div>

      <div className="px-4 pb-4 flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <BookOpen size={40} className="opacity-30" />
            <p>No resources found</p>
          </div>
        ) : filtered.map((r) => (
          <ResourceCard key={r.id} r={r} />
        ))}
      </div>
    </AppShell>
  );
}
