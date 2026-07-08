const CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";
const BIBLE_TE_URL = "https://raw.githubusercontent.com/godlytalias/Bible-Database/master/Telugu/bible.json";
const BIBLE_EN_URL = "https://bolls.life/get-chapter/KJV/1/1/";
const API_HEALTH_URL = "https://dahinchu-agni.onrender.com/api/healthz";
const API_VIDEOS_URL = "https://dahinchu-agni.onrender.com/api/youtube/videos";

async function checkUrl(name, url) {
    try {
        const res = await fetch(url);
        if (res.ok) {
            console.log(`✅ ${name}: OK (${res.status})`);
            return true;
        } else {
            console.log(`❌ ${name}: FAILED (${res.status}) - ${url}`);
            return false;
        }
    } catch (e) {
        console.log(`❌ ${name}: ERROR - ${e.message}`);
        return false;
    }
}

async function checkYouTubeRSS() {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.log(`❌ YouTube RSS: FAILED (${res.status})`);
            return false;
        }
        const xml = await res.text();
        const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];
        if (entries.length > 0) {
            console.log(`✅ YouTube RSS: OK (${entries.length} videos found)`);
            return true;
        } else {
            console.log(`❌ YouTube RSS: OK, but NO VIDEOS found.`);
            return false;
        }
    } catch (e) {
        console.log(`❌ YouTube RSS: ERROR - ${e.message}`);
        return false;
    }
}

async function checkApiVideos() {
    try {
        const res = await fetch(API_VIDEOS_URL);
        if (!res.ok) {
            console.log(`❌ API Videos: FAILED (${res.status})`);
            return false;
        }
        const data = await res.json();
        if (data.videos && data.videos.length > 0) {
            console.log(`✅ API Videos: OK (${data.videos.length} videos found)`);
            return true;
        } else {
            console.log(`❌ API Videos: OK, but NO VIDEOS found.`);
            return false;
        }
    } catch (e) {
        console.log(`❌ API Videos: ERROR - ${e.message}`);
        return false;
    }
}

async function main() {
    console.log("--- Verifying App Content Sources ---");
    const results = await Promise.all([
        checkYouTubeRSS(),
        checkApiVideos(),
        checkUrl("Telugu Bible", BIBLE_TE_URL),
        checkUrl("English Bible", BIBLE_EN_URL),
        checkUrl("API Server Health", API_HEALTH_URL)
    ]);

    const allOk = results.every(r => r === true);
    if (allOk) {
        console.log("\nSummary: All content sources are loading correctly.");
    } else {
        console.log("\nSummary: Some content sources failed to load.");
    }
}

main();
