import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, titleFont } from '../theme';
import { OutlineButton, PrimaryButton } from './ui';

type Props = {
  visible: boolean;
  title: string;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  children: React.ReactNode;
};

// Petite feuille qui monte du bas, pour modifier une valeur (pourquoi, objectif de poids…).
export function EditSheet({ visible, title, onSave, onCancel, saveLabel = 'Enregistrer', children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
          <Text style={styles.title}>{title}</Text>
          {children}
          <PrimaryButton label={saveLabel} onPress={onSave} />
          <OutlineButton label="Annuler" onPress={onCancel} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(12,46,38,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    gap: 12,
  },
  title: { fontFamily: titleFont, fontSize: 20, fontWeight: '600', color: colors.text },
});
