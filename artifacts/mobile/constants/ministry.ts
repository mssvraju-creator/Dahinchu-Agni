export const MINISTRY = {
  name: "Dahinchu Agni",
  fullName: "Dahinchu Agni Ministries International",
  tagline: "Consuming Fire — Igniting Nations",
  meaning: '"Consuming Fire" in Telugu (దహించు అగ్ని)',
  website: "https://dahinchuagni.org",
  websiteAlt: "http://www.dahinchuagni.in",
  email: "dahinchuagni@gmail.com",
  phone: "+91 88334 44009",
  youtubeChannelId: "UChxz3kSq1sw0pLD3Pg-Vj7w",
  youtubeHandle: "Dahinchuagni",
  youtubeChannelUrl: "https://www.youtube.com/channel/UChxz3kSq1sw0pLD3Pg-Vj7w",
  youtubeUserUrl: "https://www.youtube.com/Dahinchuagni",
  facebook: "https://www.facebook.com/DahinchuAgni",
  instagram: "https://www.instagram.com/dahinchu_agni",
  founded: "1994",
  founder: "Dr. Thomas",
  founderBirthday: "July 11, 1970",
  founderBirthplace: "Madurai, Tamil Nadu, India",
  churches: "530+",
  pastors: "1,800+",
  ministries: "17",
  bibleSchool: "School of Dunamis",
  prayerHours: "24hrs",
  primaryLanguage: "Telugu",
  logoUrl: "https://dahinchuagni.org/images/logo.png",
  address: {
    street: "Thummalova, Gokavaram Bus Stand Back Side",
    city: "Rajahmundry",
    state: "Andhra Pradesh",
    country: "India",
    pin: "533103",
    full: "Thummalova, Gokavaram Bus Stand Back Side, Rajahmundry, Andhra Pradesh 533103, India",
  },
  stats: [
    { number: "530+", label: "Churches" },
    { number: "1994", label: "Founded" },
    { number: "1,800+", label: "Pastors" },
    { number: "17", label: "Ministries" },
  ],
  ministriesInfo: [
    "Evangelism & Church Planting",
    "School of Dunamis (Bible School)",
    "Dunamis Training Program",
    "Healing & Fasting Prayer Crusades",
    "Calvary TV Ministry",
    "Pastors Fellowship",
    "Women's Ministry",
    "Youth Ministry",
    "Children's Ministry",
    "Prayer Ministry (24hr)",
    "Missions & Outreach",
    "Worship Ministry",
    "Medical / Social Ministry",
    "Discipleship Ministry",
    "Leadership Development",
    "Marriage & Family Ministry",
    "Literature / Publications",
  ],
  about: `Dahinchu Agni (దహించు అగ్ని) means "Consuming Fire" in Telugu — a reference to the transforming power of the Holy Spirit. Founded in 1994 by Dr. Thomas in Rajahmundry, Andhra Pradesh, India, this ministry was born out of a divine call to reach the unreached with the Gospel of Jesus Christ.

Dr. Thomas received a clear calling to ministry in 1992. As he waited upon the Lord, God spoke to him audibly, directing him to begin ministry work in Andhra Pradesh. Obeying immediately, he began as a missionary in Khammam district — even learning the Telugu language from scratch as an outsider.

Through unwavering faith and relentless prayer, Dahinchu Agni Ministries has grown from a single missionary to a vast movement of over 1,800 pastors serving across India. Dr. Thomas has planted 530 churches across Andhra Pradesh and other Indian states, and has traveled to many nations as an Ambassador of the Almighty.

Today, the ministry operates 17 distinct ministry departments, including the renowned School of Dunamis — a Bible school conducted three times a year — and the Calvary TV ministry reaching thousands through Christian broadcasting.`,
  vision: "To carry the Consuming Fire of God to every nation, planting churches and raising disciples who transform their communities.",
  mission: "To strengthen the Church in India and beyond by training national leaders through the Word of God, and proclaiming the Gospel with signs and wonders following.",
  serviceTimes: [
    { day: "Sunday", time: "10:00 AM & 6:00 PM", type: "Sunday Service" },
    { day: "Wednesday", time: "7:00 PM", type: "Prayer Night" },
    { day: "Friday", time: "7:30 PM", type: "Youth Service" },
  ],
};

export const ADMIN_PASSCODE = "DAFIRE94";

export const BIBLE_VERSES = [
  { text: "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap.", ref: "Luke 6:38" },
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "Call to me and I will answer you and tell you great and unsearchable things you do not know.", ref: "Jeremiah 33:3" },
  { text: "I can do all this through him who gives me strength.", ref: "Philippians 4:13" },
  { text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", ref: "Philippians 4:6" },
  { text: "Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.", ref: "Matthew 7:7" },
  { text: "The prayer of a righteous person is powerful and effective.", ref: "James 5:16" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5" },
  { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { text: "Jesus said to him, I am the way, and the truth, and the life.", ref: "John 14:6" },
  { text: "If my people, who are called by my name, will humble themselves and pray… I will hear from heaven.", ref: "2 Chronicles 7:14" },
  { text: "Blessed are those who mourn, for they will be comforted.", ref: "Matthew 5:4" },
  { text: "The Lord is my shepherd, I lack nothing.", ref: "Psalm 23:1" },
];

export interface MinistryEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  description: string;
  category: "service" | "prayer" | "conference" | "training" | "youth" | "special";
  isRecurring?: boolean;
  recurringPattern?: string;
  registrationUrl?: string;
}

export const DEFAULT_EVENTS: MinistryEvent[] = [
  {
    id: "sunday-service",
    title: "Sunday Service — ఆదివారపు ఆరాధన",
    date: "2026-06-08",
    time: "10:00 AM",
    endTime: "12:00 PM",
    location: "Dahinchu Agni HQ, Rajahmundry",
    description: "Join us for our weekly Sunday morning worship service. Come experience powerful Telugu worship, anointed preaching from Dr. Thomas, and the presence of God.",
    category: "service",
    isRecurring: true,
    recurringPattern: "Every Sunday",
  },
  {
    id: "sunday-evening",
    title: "Sunday Evening Service",
    date: "2026-06-08",
    time: "6:00 PM",
    endTime: "8:00 PM",
    location: "Dahinchu Agni HQ, Rajahmundry",
    description: "Evening worship service with prayer and the Word.",
    category: "service",
    isRecurring: true,
    recurringPattern: "Every Sunday",
  },
  {
    id: "prayer-night",
    title: "Wednesday Prayer Night",
    date: "2026-06-11",
    time: "7:00 PM",
    endTime: "9:00 PM",
    location: "Prayer Hall, Rajahmundry",
    description: "Corporate intercession, worship, and seeking the face of God. Come ready to pray for breakthroughs in your life, family, and nation.",
    category: "prayer",
    isRecurring: true,
    recurringPattern: "Every Wednesday",
  },
  {
    id: "friday-youth",
    title: "Friday Youth Service",
    date: "2026-06-13",
    time: "7:30 PM",
    endTime: "9:30 PM",
    location: "Youth Hall, Rajahmundry",
    description: "A dynamic service for young people featuring high-energy worship, relevant teaching, and prayer. Come and encounter the fire of God!",
    category: "youth",
    isRecurring: true,
    recurringPattern: "Every Friday",
  },
  {
    id: "calvary-tv-live",
    title: "Calvary TV Live Program",
    date: "2026-06-13",
    time: "8:00 AM",
    location: "Calvary TV (Live Broadcast)",
    description: "Watch the Calvary TV live program featuring worship, testimonies, and the Word of God. Stream live on our YouTube channel.",
    category: "special",
    isRecurring: true,
    recurringPattern: "Every Saturday",
  },
  {
    id: "dunamis-school",
    title: "School of Dunamis — Bible School",
    date: "2026-07-01",
    time: "9:00 AM",
    endTime: "5:00 PM",
    location: "Training Center, Rajahmundry",
    description: "The School of Dunamis equips believers with the Word of God, prayer, and practical ministry training. Conducted three times a year — register to secure your place.",
    category: "training",
    registrationUrl: "https://dahinchuagni.org",
  },
  {
    id: "pastors-fellowship",
    title: "Pastors Fellowship Meeting",
    date: "2026-07-25",
    time: "10:00 AM",
    location: "Rajahmundry",
    description: "Annual gathering of pastors serving under Dahinchu Agni Ministries. Time of teaching, prayer, fellowship, and vision casting from Dr. Thomas.",
    category: "conference",
  },
  {
    id: "healing-crusade",
    title: "Healing & Fasting Prayer Crusade",
    date: "2026-08-15",
    time: "6:00 PM",
    location: "Open Ground, Rajahmundry",
    description: "A powerful open-air crusade meeting with healing prayers, deliverance, and testimonies. Thousands gather to witness the miracle-working power of God.",
    category: "special",
  },
  {
    id: "youth-conference",
    title: "Youth Fire Conference",
    date: "2026-09-19",
    time: "9:00 AM",
    location: "Youth Center, Rajahmundry",
    description: "A conference for young people to encounter the fire of God — worship, word, and equipping for ministry.",
    category: "youth",
    registrationUrl: "https://dahinchuagni.org",
  },
  {
    id: "dunamis-school-2",
    title: "School of Dunamis — Session 2",
    date: "2026-10-05",
    time: "9:00 AM",
    endTime: "5:00 PM",
    location: "Training Center, Rajahmundry",
    description: "Second session of the School of Dunamis for 2026. Intensive Bible training, prayer, and equipping for ministry leaders across India.",
    category: "training",
    registrationUrl: "https://dahinchuagni.org",
  },
];

export interface MinistryResource {
  id: string;
  title: string;
  description: string;
  category: "bible-study" | "devotional" | "training" | "prayer" | "pdf" | "discipleship";
  type: "pdf" | "video" | "audio" | "article";
  url?: string;
  isFree: boolean;
  author?: string;
}

export const DEFAULT_RESOURCES: MinistryResource[] = [
  {
    id: "disc-manual",
    title: "Discipleship Manual",
    description: "A comprehensive guide for new believers covering foundational Christian truths, prayer, Bible study, and church involvement as taught in Dahinchu Agni Ministries.",
    category: "discipleship",
    type: "pdf",
    url: "https://dahinchuagni.org",
    isFree: true,
    author: "Dr. Thomas, Dahinchu Agni Ministries",
  },
  {
    id: "dunamis-training",
    title: "Dunamis Training Program Guide",
    description: "The official training manual used in the Dunamis Training Program — equipping thousands of pastors and leaders across India.",
    category: "training",
    type: "pdf",
    url: "https://dahinchuagni.org",
    isFree: true,
    author: "Dr. Thomas",
  },
  {
    id: "daily-devotional",
    title: "Daily Fire Devotional",
    description: "30-day devotional guide with daily Scripture readings, reflections, and prayer points to ignite your morning devotions with the consuming fire of God.",
    category: "devotional",
    type: "pdf",
    url: "https://dahinchuagni.org",
    isFree: true,
    author: "Dahinchu Agni Ministries",
  },
  {
    id: "acts-study",
    title: "Bible Study: Book of Acts",
    description: "In-depth study guide through the Book of Acts — exploring the early church, the Holy Spirit, and the power of prayer that changed the world.",
    category: "bible-study",
    type: "pdf",
    url: "https://dahinchuagni.org",
    isFree: true,
    author: "Dr. Thomas",
  },
  {
    id: "prayer-fasting",
    title: "Prayer & Fasting Guide",
    description: "Biblical principles and practical guidelines for a meaningful prayer and fasting experience. Includes a 21-day plan based on Dahinchu Agni's prayer ministry.",
    category: "prayer",
    type: "pdf",
    url: "https://dahinchuagni.org",
    isFree: true,
    author: "Dahinchu Agni Ministries",
  },
  {
    id: "healing-prayer",
    title: "Healing Prayer & Scriptural Confessions",
    description: "A collection of healing scriptures and confessions drawn from the healing crusades of Dr. Thomas across India.",
    category: "prayer",
    type: "pdf",
    url: "https://dahinchuagni.org",
    isFree: true,
    author: "Dr. Thomas",
  },
  {
    id: "evangelism-guide",
    title: "Personal Evangelism Guide",
    description: "Step-by-step guide for sharing your faith effectively. Practical tools and scripture references from Dahinchu Agni's evangelism ministry.",
    category: "training",
    type: "pdf",
    url: "https://dahinchuagni.org",
    isFree: true,
    author: "Dahinchu Agni Ministries",
  },
  {
    id: "church-planting",
    title: "Church Planting Manual",
    description: "Based on Dr. Thomas's experience planting 530+ churches — practical guidance for starting and growing local churches in any region.",
    category: "training",
    type: "pdf",
    url: "https://dahinchuagni.org",
    isFree: true,
    author: "Dr. Thomas",
  },
];
