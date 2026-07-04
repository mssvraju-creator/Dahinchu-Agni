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
  "bible-study": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  devotional: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  training: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  prayer: "bg-primary/20 text-primary border-primary/30",
  pdf: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  discipleship: "bg-green-500/20 text-green-400 border-green-500/30",
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
  const [audioPlaying, setAudioPlaying] = useState(false);

  const isLocal = isUploadedFile(r.url);
  const isAudio = r.type === "audio";
  const isVideo = r.type === "video";

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-2xl bg-card border border-white/10"
      data-testid={`resource-card-${r.id}`}
    >
      <div className="flex items-start gap-2 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[r.category]}`}>
          {CATEGORY_LABELS[r.category]}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-white/40 uppercase tracking-wide">
          {TYPE_ICONS[r.type]} {r.type}
        </span>
        {r.isFree && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Free</span>
        )}
      </div>

      <div>
        <p className="font-bold text-white text-sm leading-snug">{r.title}</p>
        {r.author && <p className="text-xs text-white/40 mt-0.5">by {r.author}</p>}
      </div>

      <p className="text-white/60 text-xs leading-relaxed">{r.description}</p>

      {/* Inline audio player for uploaded audio files */}
      {r.url && isLocal && isAudio && (
        <div className="flex flex-col gap-2">
          <audio
            controls
            className="w-full h-10 rounded-lg"
            style={{ accentColor: "#E84C1E" }}
            onPlay={() => setAudioPlaying(true)}
            onPause={() => setAudioPlaying(false)}
          >
            <source src={r.url} />
          </audio>
          <a
            href={r.url}
            download
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-white/60 border border-white/10 font-medium text-xs hover:bg-white/10 transition-colors"
          >
            <Download size={12} /> Download audio
          </a>
        </div>
      )}

      {/* Inline video player for uploaded video files */}
      {r.url && isLocal && isVideo && (
        <div className="flex flex-col gap-2">
          <video
            controls
            className="w-full rounded-xl max-h-64 object-contain bg-black"
          >
            <source src={r.url} />
          </video>
          <a
            href={r.url}
            download
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-white/60 border border-white/10 font-medium text-xs hover:bg-white/10 transition-colors"
          >
            <Download size={12} /> Download video
          </a>
        </div>
      )}

      {/* Download button for other uploaded files */}
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

      {/* External link for non-uploaded resources */}
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
      {/* Filters */}
      <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeCategory === cat ? "bg-primary text-white border-primary" : "bg-card text-white/60 border-white/10"
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
          <div className="flex flex-col items-center gap-2 py-16 text-white/40">
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
