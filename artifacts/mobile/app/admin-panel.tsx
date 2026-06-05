import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Announcement,
  LiveStream,
  VideoItem,
  useContent,
} from "@/contexts/ContentContext";
import { useColors } from "@/hooks/useColors";

type Section = "videos" | "live" | "announcements" | "passcode";

export default function AdminPanelScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const content = useContent();

  const [section, setSection] = useState<Section>("videos");

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: "#E05A1F" },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSub}>Manage your app content</Text>
        </View>
        <View style={[styles.shieldBadge]}>
          <Feather name="shield" size={20} color="#FFFFFF" />
        </View>
      </View>

      {/* Tab Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        contentContainerStyle={styles.tabBarContent}
      >
        {(["videos", "live", "announcements", "passcode"] as Section[]).map(
          (s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.tab,
                section === s && {
                  borderBottomColor: colors.accent,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setSection(s)}
            >
              <Feather
                name={
                  s === "videos"
                    ? "play-circle"
                    : s === "live"
                    ? "radio"
                    : s === "announcements"
                    ? "bell"
                    : "lock"
                }
                size={16}
                color={section === s ? colors.accent : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color:
                      section === s ? colors.accent : colors.mutedForeground,
                  },
                ]}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.bodyContent,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {section === "videos" && <VideosAdmin />}
        {section === "live" && <LiveAdmin />}
        {section === "announcements" && <AnnouncementsAdmin />}
        {section === "passcode" && <PasscodeAdmin />}
      </ScrollView>
    </View>
  );
}

/* ─── VIDEOS ADMIN ─── */
function VideosAdmin() {
  const colors = useColors();
  const { videos, addVideo, updateVideo, removeVideo } = useContent();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<VideoItem | null>(null);

  const [title, setTitle] = useState("");
  const [videoId, setVideoId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const openAdd = () => {
    setEditItem(null);
    setTitle(""); setVideoId(""); setDescription(""); setDate(new Date().toISOString().split("T")[0]);
    setShowForm(true);
  };

  const openEdit = (item: VideoItem) => {
    setEditItem(item);
    setTitle(item.title); setVideoId(item.videoId); setDescription(item.description); setDate(item.date);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !videoId.trim()) return;
    if (editItem) {
      await updateVideo(editItem.id, { title: title.trim(), videoId: videoId.trim(), description: description.trim(), date });
    } else {
      await addVideo({ title: title.trim(), videoId: videoId.trim(), description: description.trim(), date });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowForm(false);
  };

  const handleDelete = (item: VideoItem) => {
    Alert.alert("Remove Video", `Remove "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: () => removeVideo(item.id),
      },
    ]);
  };

  return (
    <View style={styles.adminSection}>
      <SectionHeader
        title="Videos"
        count={videos.length}
        onAdd={openAdd}
        colors={colors}
      />
      {videos.map((v) => (
        <ItemCard
          key={v.id}
          title={v.title}
          subtitle={`ID: ${v.videoId}`}
          icon="play-circle"
          colors={colors}
          onEdit={() => openEdit(v)}
          onDelete={() => handleDelete(v)}
        />
      ))}
      {videos.length === 0 && <EmptyState label="No videos yet" colors={colors} />}

      <FormModal
        visible={showForm}
        title={editItem ? "Edit Video" : "Add Video"}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        canSave={!!title.trim() && !!videoId.trim()}
        colors={colors}
      >
        <InputField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Sunday Message" colors={colors} />
        <InputField
          label="YouTube Video ID"
          value={videoId}
          onChangeText={setVideoId}
          placeholder="e.g. mUdRgQT63cc"
          hint="The part after ?v= in the YouTube URL"
          colors={colors}
        />
        <InputField label="Description (optional)" value={description} onChangeText={setDescription} placeholder="Short description" colors={colors} />
        <InputField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" colors={colors} />
      </FormModal>
    </View>
  );
}

/* ─── LIVE ADMIN ─── */
function LiveAdmin() {
  const colors = useColors();
  const { liveStreams, addLiveStream, updateLiveStream, removeLiveStream } = useContent();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<LiveStream | null>(null);

  const [title, setTitle] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const openAdd = () => {
    setEditItem(null);
    setTitle(""); setEmbedUrl(""); setIsActive(true);
    setShowForm(true);
  };

  const openEdit = (item: LiveStream) => {
    setEditItem(item);
    setTitle(item.title); setEmbedUrl(item.embedUrl); setIsActive(item.isActive);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !embedUrl.trim()) return;
    if (editItem) {
      await updateLiveStream(editItem.id, { title: title.trim(), embedUrl: embedUrl.trim(), isActive });
    } else {
      await addLiveStream({ title: title.trim(), embedUrl: embedUrl.trim(), isActive });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowForm(false);
  };

  const handleDelete = (item: LiveStream) => {
    Alert.alert("Remove Stream", `Remove "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeLiveStream(item.id) },
    ]);
  };

  return (
    <View style={styles.adminSection}>
      <SectionHeader title="Live Streams" count={liveStreams.length} onAdd={openAdd} colors={colors} />
      {liveStreams.map((l) => (
        <ItemCard
          key={l.id}
          title={l.title}
          subtitle={l.isActive ? "Active" : "Inactive"}
          icon="radio"
          colors={colors}
          onEdit={() => openEdit(l)}
          onDelete={() => handleDelete(l)}
        />
      ))}
      {liveStreams.length === 0 && <EmptyState label="No live streams yet" colors={colors} />}

      <FormModal
        visible={showForm}
        title={editItem ? "Edit Stream" : "Add Live Stream"}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        canSave={!!title.trim() && !!embedUrl.trim()}
        colors={colors}
      >
        <InputField label="Stream Name" value={title} onChangeText={setTitle} placeholder="e.g. Sunday Service Live" colors={colors} />
        <InputField
          label="Embed URL"
          value={embedUrl}
          onChangeText={setEmbedUrl}
          placeholder="https://www.youtube.com/embed/..."
          hint="Use a YouTube embed URL for reliable playback"
          colors={colors}
        />
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.foreground }]}>Currently Active</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </View>
      </FormModal>
    </View>
  );
}

/* ─── ANNOUNCEMENTS ADMIN ─── */
function AnnouncementsAdmin() {
  const colors = useColors();
  const { announcements, addAnnouncement, updateAnnouncement, removeAnnouncement } = useContent();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [text, setText] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const openAdd = () => {
    setEditItem(null); setText(""); setDate(new Date().toISOString().split("T")[0]);
    setShowForm(true);
  };
  const openEdit = (item: Announcement) => {
    setEditItem(item); setText(item.text); setDate(item.date);
    setShowForm(true);
  };
  const handleSave = async () => {
    if (!text.trim()) return;
    if (editItem) {
      await updateAnnouncement(editItem.id, { text: text.trim(), date });
    } else {
      await addAnnouncement({ text: text.trim(), date });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowForm(false);
  };
  const handleDelete = (item: Announcement) => {
    Alert.alert("Remove Announcement", "Remove this announcement?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeAnnouncement(item.id) },
    ]);
  };

  return (
    <View style={styles.adminSection}>
      <SectionHeader title="Announcements" count={announcements.length} onAdd={openAdd} colors={colors} />
      {announcements.map((a) => (
        <ItemCard
          key={a.id}
          title={a.text}
          subtitle={a.date}
          icon="bell"
          colors={colors}
          onEdit={() => openEdit(a)}
          onDelete={() => handleDelete(a)}
        />
      ))}
      {announcements.length === 0 && <EmptyState label="No announcements yet" colors={colors} />}

      <FormModal
        visible={showForm}
        title={editItem ? "Edit Announcement" : "Add Announcement"}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        canSave={!!text.trim()}
        colors={colors}
      >
        <InputField label="Message" value={text} onChangeText={setText} placeholder="Type your announcement..." colors={colors} multiline />
        <InputField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" colors={colors} />
      </FormModal>
    </View>
  );
}

/* ─── PASSCODE ADMIN ─── */
function PasscodeAdmin() {
  const colors = useColors();
  const { adminPasscode, changePasscode } = useContent();
  const [current, setCurrent] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  const handleChange = async () => {
    if (current !== adminPasscode) { setMsg("Current passcode is wrong."); return; }
    if (newCode.length < 4) { setMsg("New passcode must be at least 4 digits."); return; }
    if (newCode !== confirm) { setMsg("Passcodes don't match."); return; }
    await changePasscode(newCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMsg("Passcode changed successfully!");
    setCurrent(""); setNewCode(""); setConfirm("");
  };

  return (
    <View style={styles.adminSection}>
      <Text style={[styles.subSectionTitle, { color: colors.foreground }]}>
        Change Admin Passcode
      </Text>
      <Text style={[styles.subSectionHint, { color: colors.mutedForeground }]}>
        Current passcode: {adminPasscode.replace(/./g, "•")}
      </Text>

      <View style={[styles.passcodeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <InputField label="Current Passcode" value={current} onChangeText={setCurrent} placeholder="Enter current passcode" colors={colors} secureTextEntry />
        <InputField label="New Passcode" value={newCode} onChangeText={setNewCode} placeholder="At least 4 digits" colors={colors} secureTextEntry keyboardType="numeric" />
        <InputField label="Confirm New Passcode" value={confirm} onChangeText={setConfirm} placeholder="Type again" colors={colors} secureTextEntry keyboardType="numeric" />

        {msg ? (
          <Text style={[styles.passMsg, { color: msg.includes("success") ? "#22C55E" : "#EF4444" }]}>
            {msg}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: colors.primary, opacity: current && newCode && confirm ? 1 : 0.5 },
          ]}
          onPress={handleChange}
          disabled={!current || !newCode || !confirm}
        >
          <Text style={styles.saveBtnText}>Update Passcode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── SHARED SUB-COMPONENTS ─── */
function SectionHeader({ title, count, onAdd, colors }: any) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View>
        <Text style={[styles.subSectionTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.subSectionHint, { color: colors.mutedForeground }]}>{count} item{count !== 1 ? "s" : ""}</Text>
      </View>
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: colors.primary }]}
        onPress={onAdd}
      >
        <Feather name="plus" size={16} color="#FFFFFF" />
        <Text style={styles.addBtnText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

function ItemCard({ title, subtitle, icon, colors, onEdit, onDelete }: any) {
  return (
    <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.itemIcon, { backgroundColor: colors.muted }]}>
        <Feather name={icon} size={16} color={colors.mutedForeground} />
      </View>
      <View style={styles.itemMeta}>
        <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={[styles.itemSub, { color: colors.mutedForeground }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Feather name="edit-2" size={15} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Feather name="trash-2" size={15} color={colors.destructive} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmptyState({ label, colors }: any) {
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function FormModal({ visible, title, onClose, onSave, canSave, colors, children }: any) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>{title}</Text>
          <TouchableOpacity
            onPress={onSave}
            disabled={!canSave}
            style={[styles.modalSaveBtn, { backgroundColor: canSave ? colors.primary : colors.muted }]}
          >
            <Text style={[styles.modalSaveBtnText, { color: canSave ? "#FFFFFF" : colors.mutedForeground }]}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
          <View style={styles.modalBodyContent}>{children}</View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function InputField({ label, value, onChangeText, placeholder, hint, colors, multiline, secureTextEntry, keyboardType }: any) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.foreground,
            height: multiline ? 80 : 48,
            textAlignVertical: multiline ? "top" : "center",
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {hint ? <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerText: { flex: 1 },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  shieldBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    maxHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBarContent: {
    paddingHorizontal: 16,
    gap: 4,
    alignItems: "center",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  body: { flex: 1 },
  bodyContent: { padding: 20, gap: 12 },
  adminSection: { gap: 12 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  subSectionHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
  itemCard: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  itemMeta: { flex: 1, gap: 3 },
  itemTitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 19,
  },
  itemSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  itemActions: {
    flexDirection: "row",
    gap: 4,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  passcodeCard: {
    borderRadius: 14,
    padding: 18,
    gap: 14,
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  passMsg: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  modalSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  modalBody: { flex: 1 },
  modalBodyContent: {
    padding: 20,
    gap: 16,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  fieldHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
