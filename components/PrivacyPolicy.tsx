import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Props = {
  onClose?: () => void;
};

export function PrivacyPolicy({ onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
          Privacy Policy
        </Text>
        {onClose && (
          <Pressable onPress={onClose} hitSlop={12}>
            <Feather name="x" size={22} color={colors.foreground} />
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={[styles.updated, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
          Last updated: April 2025
        </Text>

        <Section title="Information We Collect" colors={colors}>
          We collect the following types of information to provide you with personalised wellness services:{"\n\n"}
          • <Text style={{ fontFamily: "Lato_700Bold" }}>Personal details:</Text> name, phone number, and email address{"\n"}
          • <Text style={{ fontFamily: "Lato_700Bold" }}>Location data:</Text> delivery or clinic address{"\n"}
          • <Text style={{ fontFamily: "Lato_700Bold" }}>Health inputs:</Text> wellness assessment responses, BMI data, sleep, hydration, and lifestyle data you choose to enter
        </Section>

        <Section title="How We Use Your Data" colors={colors}>
          Your information is used exclusively to:{"\n\n"}
          • Personalise treatment and product recommendations{"\n"}
          • Enable appointment booking and service management{"\n"}
          • Improve your in-app wellness journey experience{"\n"}
          • Communicate relevant offers and clinic updates (with your consent)
        </Section>

        <Section title="Data Sharing" colors={colors}>
          We do not sell, rent, or trade your personal data to any third parties.{"\n\n"}
          Data may be shared only with service providers who assist us in operating the app (e.g., booking systems), and only under strict confidentiality agreements.
        </Section>

        <Section title="Data Security" colors={colors}>
          We take reasonable technical and organisational measures to protect your personal information from unauthorised access, disclosure, or loss.
        </Section>

        <Section title="Your Rights" colors={colors}>
          You may request access to, correction of, or deletion of your personal data at any time by contacting us. You may also withdraw consent for communications.
        </Section>

        <Section title="Contact Us" colors={colors}>
          For any privacy-related enquiries, please contact us at:{"\n\n"}
          <Text style={{ fontFamily: "Lato_700Bold" }}>privacy@drypskin.com</Text>{"\n"}
          DrypSkin Clinic, Dubai Marina, UAE
        </Section>

        <View style={[styles.note, { backgroundColor: `${colors.warmGray}12`, borderColor: `${colors.warmGray}25` }]}>
          <Feather name="shield" size={13} color={colors.warmGray} />
          <Text style={[styles.noteText, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
            This app provides wellness guidance only and does not store or transmit clinical medical records.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
        {title}
      </Text>
      <Text style={[styles.sectionBody, { color: colors.foreground, fontFamily: "Lato_300Light" }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, lineHeight: 30 },
  updated: { fontSize: 12, marginBottom: 24 },
  content: { padding: 24, gap: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, lineHeight: 22, marginBottom: 8 },
  sectionBody: { fontSize: 14, lineHeight: 22 },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
