import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSubmitBibleQuestion } from "@/hooks/useBibleQuestions";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
  verseRef: string;
  verseText: string;
  bookName: string;
  chapter: number;
}

export function QuestionModal({ visible, onClose, verseRef, verseText, bookName, chapter }: Props) {
  const colors = useColors();
  const { submit, submitting, error, success, reset } = useSubmitBibleQuestion();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [question, setQuestion] = React.useState("");

  const handleSubmit = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const ok = await submit({
      name: name.trim() || "Anonymous",
      email: email.trim(),
      question: question.trim(),
      verse: verseRef,
      verseText,
    });
    if (ok) {
      setName("");
      setEmail("");
      setQuestion("");
    }
  }, [name, email, question, verseRef, verseText, submit]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const inputStyle = {
    backgroundColor: colors.card,
    borderColor: colors.border,
    color: colors.foreground,
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Ask a Question</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.verseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.verseLabel, { color: "#E84C1E" }]}>About this verse</Text>
            <Text style={[styles.verseRef, { color: colors.foreground }]}>{verseRef}</Text>
            {verseText ? (
              <Text style={[styles.verseText, { color: colors.foreground }]}>"{verseText}"</Text>
            ) : null}
          </View>

          {success ? (
            <View style={styles.successWrap}>
              <View style={styles.successCircle}>
                <Feather name="check" size={28} color="#FFFFFF" />
              </View>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>Question Submitted!</Text>
              <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
                You'll be notified when it's answered. Check "My Questions" in the Bible header to see replies.
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.foreground }]}>Your Name</Text>
                <TextInput
                  style={[styles.input, inputStyle]}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.mutedForeground}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.foreground }]}>Email (optional)</Text>
                <TextInput
                  style={[styles.input, inputStyle]}
                  placeholder="For notification when answered"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.foreground }]}>Your Question</Text>
                <TextInput
                  style={[styles.input, styles.textArea, inputStyle]}
                  placeholder="What would you like to know about this verse?"
                  placeholderTextColor={colors.mutedForeground}
                  value={question}
                  onChangeText={setQuestion}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
                  <Feather name="alert-circle" size={14} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: "#E84C1E" }, (!question.trim()) && { opacity: 0.5 }]}
                onPress={handleSubmit}
                disabled={!question.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Question</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  verseCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  verseLabel: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  verseRef: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  verseText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  textArea: {
    minHeight: 100,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  successWrap: {
    alignItems: "center",
    paddingVertical: 50,
    gap: 14,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  successSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  doneBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#E84C1E",
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
