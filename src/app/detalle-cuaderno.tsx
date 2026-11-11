import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Pressable,
    ScrollView,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BottomBar, ScreenHeader, colors } from '../components/StudyUI';
import { useState } from 'react';

// TODO: reemplazar por los datos reales (contexto / storage)


import { useNotebooks, FlashcardSet, Note } from '../context/NotebookContext';

export default function DetalleCuadernoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { getNotebook } = useNotebooks();
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const notebook = getNotebook(id);

    const title = notebook?.name ?? '';
    const flashcards = notebook?.flashcardSets ?? [];
    const notas = notebook?.notes ?? [];

    function abrirFlashcard(flashcard: FlashcardSet) {
        router.push({
            pathname: '/flashcards',
            params: { id, flashcardId: flashcard.id },
        });
    }

    function crearFlashcards() {
        setCreateModalVisible(false);
        router.push({ pathname: '/crear-flashcard', params: { id } });
    }

    function crearNota() {
        setCreateModalVisible(false);
        router.push({ pathname: '/crear-nota', params: { id } });
    }


    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <ScreenHeader title={title} onBack={() => router.navigate('/cuadernos')} />

                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                >
                    {/* FLASHCARDS */}
                    <Text style={styles.sectionTitle}>Flashcards</Text>
                    {flashcards.length === 0 ? (
                        <Text style={styles.emptyState}>No hay flashcards</Text>
                    ) : (
                        flashcards.map((flashcard) => (
                            <Pressable
                                key={flashcard.id}
                                onPress={() => abrirFlashcard(flashcard)}
                                accessibilityRole="button"
                                accessibilityLabel={`Abrir flashcard ${flashcard.name}`}
                                style={({ pressed }) => [
                                    styles.card,
                                    pressed && styles.cardPressed,
                                ]}
                            >
                                <Ionicons name="albums-outline" size={23} color={colors.purple} />
                                <Text style={styles.cardName}>{flashcard.name}</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                            </Pressable>
                        ))
                    )}

                    {/* NOTAS */}
                    <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Notas</Text>
                    {notas.length === 0 ? (
                        <Text style={styles.emptyState}>No hay notas</Text>
                    ) : (
                        notas.map((nota) => (
                            <Pressable
                                key={nota.id}
                                onPress={() => setSelectedNote(nota)}
                                accessibilityRole="button"
                                accessibilityLabel={`Abrir nota ${nota.name}`}
                                style={({ pressed }) => [
                                    styles.card,
                                    pressed && styles.cardPressed,
                                ]}
                            >
                                <Ionicons name="document-text-outline" size={23} color={colors.purple} />
                                <Text style={styles.cardName}>{nota.name}</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                            </Pressable>
                        ))
                    )}
                </ScrollView>

                <View style={styles.bottom}>
                    <BottomBar
                        active="notebooks"
                        addLabel="Crear"
                        onAdd={() => setCreateModalVisible(true)}
                    />
                </View>
            </View>

            <Modal
                visible={createModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCreateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.createCard}>
                        <Text style={styles.createTitle}>¿Qué deseas crear?</Text>
                        <Text style={styles.createMessage}>
                            Elige el tipo de contenido para este cuaderno.
                        </Text>

                        <Pressable
                            onPress={crearNota}
                            accessibilityRole="button"
                            accessibilityLabel="Crear nota"
                            style={({ pressed }) => [
                                styles.createOption,
                                pressed && styles.createOptionPressed,
                            ]}
                        >
                            <Ionicons name="document-text-outline" size={23} color={colors.purple} />
                            <View style={styles.createOptionText}>
                                <Text style={styles.createOptionTitle}>Crear nota</Text>
                                <Text style={styles.createOptionSubtitle}>Añade una nota al cuaderno</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                        </Pressable>

                        <Pressable
                            onPress={crearFlashcards}
                            accessibilityRole="button"
                            accessibilityLabel="Crear flashcards"
                            style={({ pressed }) => [
                                styles.createOption,
                                pressed && styles.createOptionPressed,
                            ]}
                        >
                            <Ionicons name="albums-outline" size={23} color={colors.purple} />
                            <Text style={styles.createOptionTitle}>Crear flashcards</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                        </Pressable>

                        <Pressable
                            onPress={() => setCreateModalVisible(false)}
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar"
                            style={({ pressed }) => [
                                styles.closeButton,
                                pressed && styles.createOptionPressed,
                            ]}
                        >
                            <Text style={styles.closeButtonText}>Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={selectedNote !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedNote(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.noteCard}>
                        <Text style={styles.createTitle}>{selectedNote?.name}</Text>
                        <ScrollView
                            style={styles.noteContentScroll}
                            contentContainerStyle={styles.noteContentContainer}
                        >
                            <Text style={styles.noteContent}>
                                {selectedNote?.content || 'Esta nota no tiene contenido.'}
                            </Text>
                        </ScrollView>
                        <Pressable
                            onPress={() => setSelectedNote(null)}
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar nota"
                            style={({ pressed }) => [
                                styles.closeButton,
                                pressed && styles.createOptionPressed,
                            ]}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 46,
        height: 46,
        backgroundColor: colors.white,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flex: 1,
        fontSize: 29,
        fontWeight: '800',
        color: colors.dark,
    },
    list: {
        flex: 1,
        marginTop: 14,
    },
    listContent: {
        gap: 12,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.dark,
    },
    sectionSpacing: {
        marginTop: 12,
    },
    emptyState: {
        fontSize: 15,
        color: colors.muted,
    },
    card: {
        minHeight: 66,
        paddingHorizontal: 18,
        backgroundColor: colors.white,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        elevation: 2,
        shadowColor: '#4E342E',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },
    cardPressed: {
        opacity: 0.7,
    },
    cardName: {
        flex: 1,
        color: colors.dark,
        fontSize: 16,
        fontWeight: '600',
    },
    bottom: {
        marginTop: 'auto',
        paddingBottom: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    createCard: {
        width: '100%',
        maxWidth: 380,
        padding: 24,
        backgroundColor: colors.white,
        borderRadius: 22,
        gap: 12,
    },
    createTitle: {
        color: colors.dark,
        fontSize: 20,
        fontWeight: '800',
    },
    createMessage: {
        marginBottom: 4,
        color: colors.muted,
        fontSize: 15,
        lineHeight: 22,
    },
    createOption: {
        minHeight: 58,
        paddingHorizontal: 14,
        backgroundColor: colors.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.lavender,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    createOptionText: {
        flex: 1,
        gap: 2,
    },
    createOptionTitle: {
        flex: 1,
        color: colors.dark,
        fontSize: 16,
        fontWeight: '600',
    },
    createOptionSubtitle: {
        color: colors.muted,
        fontSize: 13,
    },
    createOptionPressed: {
        opacity: 0.7,
    },
    closeButton: {
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        borderRadius: 12,
    },
    closeButtonText: {
        color: colors.muted,
        fontSize: 15,
        fontWeight: '700',
    },
    noteCard: {
        width: '100%',
        maxWidth: 380,
        maxHeight: '80%',
        padding: 24,
        backgroundColor: colors.white,
        borderRadius: 22,
        gap: 12,
    },
    noteContentScroll: {
        flexShrink: 1,
    },
    noteContentContainer: {
        paddingVertical: 4,
    },
    noteContent: {
        color: colors.dark,
        fontSize: 16,
        lineHeight: 24,
    },
});