import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkin } from '../../theme/SkinProvider';
import { useHouseholdStore } from '../../store/useHouseholdStore';

interface StickyNotesBoardProps {
  onAddNotePress: () => void;
}

export function StickyNotesBoard({ onAddNotePress }: StickyNotesBoardProps) {
  const { skin } = useSkin();
  const notes = useHouseholdStore((s) => s.notes);
  const deleteNote = useHouseholdStore((s) => s.deleteNote);
  const togglePinNote = useHouseholdStore((s) => s.togglePinNote);

  // Sort notes: pinned first, then newest
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.isPinned ? -1 : 1;
  });

  return (
    <View style={styles.container}>
      {/* Board Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: skin.colors.textPrimary }]}>
            Family Pinboard & Memos
          </Text>
          <Text style={[styles.subtitle, { color: skin.colors.textSecondary }]}>
            Shared whiteboard for Wi-Fi codes, reminders & notes
          </Text>
        </View>

        <Pressable
          onPress={onAddNotePress}
          style={({ pressed }) => [
            styles.addNoteBtn,
            {
              backgroundColor: skin.colors.accent,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addNoteText}>Post Memo</Text>
        </Pressable>
      </View>

      {/* Empty State */}
      {sortedNotes.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: skin.colors.surface,
              borderColor: skin.colors.surfaceBorder,
            },
          ]}>
          <Text style={styles.emptyEmoji}>📌</Text>
          <Text style={[styles.emptyTitle, { color: skin.colors.textPrimary }]}>
            The Pinboard is empty
          </Text>
          <Text style={[styles.emptySub, { color: skin.colors.textSecondary }]}>
            Post a quick family memo or reminder for everyone to see!
          </Text>
        </View>
      ) : (
        <View style={styles.notesGrid}>
          {sortedNotes.map((note) => {
            return (
              <View
                key={note.id}
                style={[
                  styles.noteCard,
                  {
                    backgroundColor: note.color,
                    borderColor: 'rgba(0,0,0,0.1)',
                  },
                ]}>
                {/* Note Top Bar */}
                <View style={styles.noteTopBar}>
                  {note.isPinned && (
                    <View style={styles.pinBadge}>
                      <Text style={styles.pinIcon}>📌</Text>
                      <Text style={styles.pinText}>PINNED</Text>
                    </View>
                  )}

                  <View style={styles.actionButtons}>
                    <Pressable
                      onPress={() => togglePinNote(note.id)}
                      hitSlop={8}
                      style={styles.iconBtn}>
                      <Ionicons
                        name={note.isPinned ? 'bookmark' : 'bookmark-outline'}
                        size={15}
                        color="#44403C"
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => deleteNote(note.id)}
                      hitSlop={8}
                      style={styles.iconBtn}>
                      <Ionicons name="trash-outline" size={15} color="#44403C" />
                    </Pressable>
                  </View>
                </View>

                {/* Note Title if any */}
                {note.title ? (
                  <Text style={styles.noteTitle} numberOfLines={1}>
                    {note.title}
                  </Text>
                ) : null}

                {/* Note Body */}
                <Text style={styles.noteContent}>{note.content}</Text>

                {/* Author Footer */}
                <View style={styles.noteFooter}>
                  <View style={styles.authorRow}>
                    <Text style={styles.authorAvatar}>{note.authorAvatar}</Text>
                    <Text style={styles.authorName} numberOfLines={1}>
                      {note.authorName.split(' ')[0]}
                    </Text>
                  </View>
                  <Text style={styles.timestamp}>
                    {new Date(note.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  addNoteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  notesGrid: {
    gap: 12,
  },
  noteCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  noteTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.08)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 4,
  },
  pinIcon: {
    fontSize: 11,
  },
  pinText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  iconBtn: {
    padding: 2,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 13,
    lineHeight: 19,
    color: '#292524',
    marginBottom: 10,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingTop: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorAvatar: {
    fontSize: 13,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#44403C',
  },
  timestamp: {
    fontSize: 11,
    color: '#78716C',
    fontWeight: '500',
  },
});
