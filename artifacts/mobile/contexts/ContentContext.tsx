import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface VideoItem {
  id: string;
  title: string;
  videoId: string;
  description: string;
  date: string;
}

export interface LiveStream {
  id: string;
  title: string;
  embedUrl: string;
  isActive: boolean;
}

export interface Announcement {
  id: string;
  text: string;
  date: string;
}

interface ContentState {
  videos: VideoItem[];
  liveStreams: LiveStream[];
  announcements: Announcement[];
  adminPasscode: string;
}

interface ContentContextValue extends ContentState {
  addVideo: (v: Omit<VideoItem, "id">) => Promise<void>;
  updateVideo: (id: string, v: Partial<VideoItem>) => Promise<void>;
  removeVideo: (id: string) => Promise<void>;
  addLiveStream: (l: Omit<LiveStream, "id">) => Promise<void>;
  updateLiveStream: (id: string, l: Partial<LiveStream>) => Promise<void>;
  removeLiveStream: (id: string) => Promise<void>;
  addAnnouncement: (a: Omit<Announcement, "id">) => Promise<void>;
  updateAnnouncement: (id: string, a: Partial<Announcement>) => Promise<void>;
  removeAnnouncement: (id: string) => Promise<void>;
  changePasscode: (newPasscode: string) => Promise<void>;
  isLoaded: boolean;
}

const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: "v1",
    title: "Fellowship with Holy Spirit – Dr. Thomas",
    videoId: "0B77R1GVdQs",
    description: "Telugu message by Dr. Thomas Dahinchu Agni Ministries",
    date: "2021-03-05",
  },
  {
    id: "v2",
    title: "Pastor's Fellowship Meeting",
    videoId: "mUdRgQT63cc",
    description: "Rajahmundry – Dr. Thomas Dahinchu Agni Ministries",
    date: "2021-01-26",
  },
  {
    id: "v3",
    title: "Calvary TV Live Program – Dr. Thomas",
    videoId: "X_oPnHoI48M",
    description: "Dahinchu Agni Ministries Rajahmundry",
    date: "2022-04-09",
  },
  {
    id: "v4",
    title: "Special Prayer Meeting",
    videoId: "cSeKiqgKoXQ",
    description: "Dr. Thomas Dahinchu Agni Ministries Rajahmundry",
    date: "2021-03-05",
  },
  {
    id: "v5",
    title: "Special Prayer with Dr. Thomas",
    videoId: "fclGnz0ld9s",
    description: "Dahinchu Agni Ministries",
    date: "2021-04-20",
  },
];

const DEFAULT_LIVE_STREAMS: LiveStream[] = [
  {
    id: "l1",
    title: "Dahinchu Agni Live",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UChxz3kSq1sw0pLD3Pg-Vj7w&autoplay=1",
    isActive: true,
  },
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    text: "Welcome to Dahinchu Agni Ministries app! Join us every Sunday for worship.",
    date: new Date().toISOString().split("T")[0],
  },
];

const STORAGE_KEY = "@dahinchuagni_content";

const ContentContext = createContext<ContentContextValue | null>(null);

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ContentState>({
    videos: DEFAULT_VIDEOS,
    liveStreams: DEFAULT_LIVE_STREAMS,
    announcements: DEFAULT_ANNOUNCEMENTS,
    adminPasscode: "7777",
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as ContentState;
          setState(parsed);
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  const save = useCallback(async (next: ContentState) => {
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addVideo = useCallback(
    async (v: Omit<VideoItem, "id">) => {
      const next = {
        ...state,
        videos: [...state.videos, { ...v, id: generateId() }],
      };
      await save(next);
    },
    [state, save]
  );

  const updateVideo = useCallback(
    async (id: string, v: Partial<VideoItem>) => {
      const next = {
        ...state,
        videos: state.videos.map((item) =>
          item.id === id ? { ...item, ...v } : item
        ),
      };
      await save(next);
    },
    [state, save]
  );

  const removeVideo = useCallback(
    async (id: string) => {
      const next = {
        ...state,
        videos: state.videos.filter((item) => item.id !== id),
      };
      await save(next);
    },
    [state, save]
  );

  const addLiveStream = useCallback(
    async (l: Omit<LiveStream, "id">) => {
      const next = {
        ...state,
        liveStreams: [...state.liveStreams, { ...l, id: generateId() }],
      };
      await save(next);
    },
    [state, save]
  );

  const updateLiveStream = useCallback(
    async (id: string, l: Partial<LiveStream>) => {
      const next = {
        ...state,
        liveStreams: state.liveStreams.map((item) =>
          item.id === id ? { ...item, ...l } : item
        ),
      };
      await save(next);
    },
    [state, save]
  );

  const removeLiveStream = useCallback(
    async (id: string) => {
      const next = {
        ...state,
        liveStreams: state.liveStreams.filter((item) => item.id !== id),
      };
      await save(next);
    },
    [state, save]
  );

  const addAnnouncement = useCallback(
    async (a: Omit<Announcement, "id">) => {
      const next = {
        ...state,
        announcements: [...state.announcements, { ...a, id: generateId() }],
      };
      await save(next);
    },
    [state, save]
  );

  const updateAnnouncement = useCallback(
    async (id: string, a: Partial<Announcement>) => {
      const next = {
        ...state,
        announcements: state.announcements.map((item) =>
          item.id === id ? { ...item, ...a } : item
        ),
      };
      await save(next);
    },
    [state, save]
  );

  const removeAnnouncement = useCallback(
    async (id: string) => {
      const next = {
        ...state,
        announcements: state.announcements.filter((item) => item.id !== id),
      };
      await save(next);
    },
    [state, save]
  );

  const changePasscode = useCallback(
    async (newPasscode: string) => {
      await save({ ...state, adminPasscode: newPasscode });
    },
    [state, save]
  );

  return (
    <ContentContext.Provider
      value={{
        ...state,
        addVideo,
        updateVideo,
        removeVideo,
        addLiveStream,
        updateLiveStream,
        removeLiveStream,
        addAnnouncement,
        updateAnnouncement,
        removeAnnouncement,
        changePasscode,
        isLoaded,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
