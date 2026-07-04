import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAdmin } from "@/context/AdminContext";
import { type MinistryResource } from "@/constants/ministry";
import { FileText, Video, Headphones, BookOpen, ExternalLink, Filter } from "lucide-react";

const CATEGORY_LABELS: Record<MinistryResource["category"], string> = {
  "bible-study": "Bible Study",
  devotional: "Devotional",
  training: "Training",
  prayer: "Prayer",
  pdf: "PDF",
  discipleship: "Discipleship",
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
  pdf: <FileText size={18} />,
  video: <Video size={18} />,
  audio: <Headphones size={18} />,
  article: <BookOpen size={18} />,
};

const ALL_CATEGORIES: Array<MinistryResource["category"] | "all"> = [
  "all", "bible-study", "devotional", "training", "prayer", "discipleship",
];

function ResourceCard({ resource }: { resource: MinistryResource }) {
  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-white/10 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(232,76,30,0.1)] transition-all"
      data-testid={`resource-card-${resource.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[resource.category]}`}>
              {CATEGORY_LABELS[resource.category]}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/40 uppercase tracking-wide">
              {TYPE_ICONS[resource.type]}
              {resource.type}
            </span>
            {resource.isFree && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                Free
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-lg leading-tight">{resource.title}</h3>
          {resource.author && (
            <p className="text-xs text-white/40">by {resource.author}</p>
          )}
        </div>
      </div>

      <p className="text-white/60 text-sm leading-relaxed flex-1">{resource.description}</p>

      {resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-semibold text-sm hover:bg-primary/20 transition-colors"
          data-testid={`btn-resource-${resource.id}`}
        >
          <ExternalLink size={14} />
          Access Resource
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
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-secondary/20 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="text-white">Ministry</span> <span className="fire-gradient-text">Resources</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Free Bible studies, devotionals, training manuals, and more — tools to equip you for ministry and deeper faith.
          </p>
        </div>
      </section>

      <div className="sticky top-20 z-10 bg-background/95 backdrop-blur-sm border-b border-white/10 py-3">
        <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
            <Filter size={14} className="text-white/40 shrink-0" />
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white border-primary"
                    : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"
                }`}
                data-testid={`filter-${cat}`}
              >
                {cat === "all" ? "All" : CATEGORY_LABELS[cat as MinistryResource["category"]]}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-1.5 rounded-full text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 w-full sm:w-52 transition-colors"
            data-testid="input-search"
          />
        </div>
      </div>

      <section className="py-12 flex-1">
        <div className="container mx-auto px-4 md:px-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-white/40 gap-3">
              <BookOpen size={48} className="opacity-30" />
              <p className="text-lg">No resources found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
