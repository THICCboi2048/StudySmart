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
import { BottomBar, colors } from '../components/StudyUI';
import { useState } from 'react';

// TODO: reemplazar por los datos reales (contexto / storage)


import { useNotebooks, FlashcardSet, Note } from '../context/NotebookContext';

export default function DetalleCuadernoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { getNotebook, deleteFlashcardSet, deleteNote } = useNotebooks();
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [showDeleteOptions, setShowDeleteOptions] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{
        type: 'flashcard' | 'note';
        id: string;
        name: string;
    } | null>(null);

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

    function editarFlashcard(flashcard: FlashcardSet) {
        router.push({
            pathname: '/crear-flashcard',
            params: { id, flashcardId: flashcard.id },
        });
    }

    function abrirNota(nota: Note) {
        if (showDeleteOptions) {
            editarNota(nota.id);
        } else {
            setSelectedNote(nota);
        }
    }

    function editarNota(noteId: string) {
        router.push({
            pathname: '/crear-nota',
            params: { id, noteId },
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

    function confirmarEliminacion() {
        if (!id || !itemToDelete) return;

        if (itemToDelete.type === 'flashcard') {
            deleteFlashcardSet(id, itemToDelete.id);
        } else {
            deleteNote(id, itemToDelete.id);
        }

        setItemToDelete(null);
    }


    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.navigate('/cuadernos')}
                        accessibilityRole="button"
                        accessibilityLabel="Volver"
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.dark} />
                    </Pressable>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    <Pressable
                        onPress={() => setShowDeleteOptions((visible) => !visible)}
                        accessibilityRole="button"
                        accessibilityLabel={
                            showDeleteOptions
                                ? 'Ocultar opciones de eliminación'
                                : 'Mostrar opciones de eliminación'
                        }
                        style={[
                            styles.settings,
                            showDeleteOptions && styles.settingsActive,
                        ]}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={25}
                            color={showDeleteOptions ? colors.dark : colors.muted}
                        />
                    </Pressable>
                </View>

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
                            <View key={flashcard.id} style={styles.itemRow}>
                                <Pressable
                                    onPress={() =>
                                        showDeleteOptions
                                            ? editarFlashcard(flashcard)
                                            : abrirFlashcard(flashcard)
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        showDeleteOptions
                                            ? `Editar flashcard ${flashcard.name}`
                                            : `Abrir flashcard ${flashcard.name}`
                                    }
                                    style={({ pressed }) => [
                                        styles.card,
                                        styles.itemCard,
                                        pressed && styles.cardPressed,
                                    ]}
                                >
                                    <Ionicons name="albums-outline" size={23} color={colors.purple} />
                                    <Text style={styles.cardName}>{flashcard.name}</Text>
                                    {!showDeleteOptions && (
                                        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                                    )}
                                </Pressable>
                                {showDeleteOptions && (
                                    <Pressable
                                        onPress={() => setItemToDelete({
                                            type: 'flashcard',
                                            id: flashcard.id,
                                            name: flashcard.name,
                                        })}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Eliminar flashcard ${flashcard.name}`}
                                        hitSlop={8}
                                        style={({ pressed }) => [
                                            styles.deleteButton,
                                            pressed && styles.deleteButtonPressed,
                                        ]}
                                    >
                                        <Ionicons name="trash-outline" size={21} color={colors.muted} />
                                    </Pressable>
                                )}
                            </View>
                        ))
                    )}

                    {/* NOTAS */}
                    <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Notas</Text>
                    {notas.length === 0 ? (
                        <Text style={styles.emptyState}>No hay notas</Text>
                    ) : (
                        notas.map((nota) => (
                            <View key={nota.id} style={styles.itemRow}>
                                <Pressable
                                    onPress={() => abrirNota(nota)}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        showDeleteOptions
                                            ? `Editar nota ${nota.name}`
                                            : `Abrir nota ${nota.name}`
                                    }
                                    style={({ pressed }) => [
                                        styles.card,
                                        styles.itemCard,
                                        pressed && styles.cardPressed,
                                    ]}
                                >
                                    <Ionicons name="document-text-outline" size={23} color={colors.purple} />
                                    <Text style={styles.cardName}>{nota.name}</Text>
                                    {!showDeleteOptions && (
                                        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                                    )}
                                </Pressable>
                                {showDeleteOptions && (
                                    <Pressable
                                        onPress={() => setItemToDelete({
                                            type: 'note',
                                            id: nota.id,
                                            name: nota.name,
                                        })}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Eliminar nota ${nota.name}`}
                                        hitSlop={8}
                                        style={({ pressed }) => [
                                            styles.deleteButton,
                                            pressed && styles.deleteButtonPressed,
                                        ]}
                                    >
                                        <Ionicons name="trash-outline" size={21} color={colors.muted} />
                                    </Pressable>
                                )}
                            </View>
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

            <Modal
                visible={itemToDelete !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setItemToDelete(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmationCard}>
                        <Text style={styles.createTitle}>
                            Eliminar {itemToDelete?.type === 'flashcard' ? 'flashcard' : 'nota'}
                        </Text>
                        <Text style={styles.createMessage}>
                            ¿Quieres eliminar "{itemToDelete?.name}"?
                        </Text>
                        <View style={styles.confirmationActions}>
                            <Pressable
                                onPress={() => setItemToDelete(null)}
                                accessibilityRole="button"
                                accessibilityLabel="Cancelar eliminación"
                                style={({ pressed }) => [
                                    styles.cancelButton,
                                    pressed && styles.createOptionPressed,
                                ]}
                            >
                                <Text style={styles.closeButtonText}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                onPress={confirmarEliminacion}
                                accessibilityRole="button"
                                accessibilityLabel="Confirmar eliminación"
                                style={({ pressed }) => [
                                    styles.confirmButton,
                                    pressed && styles.createOptionPressed,
                                ]}
                            >
                                <Text style={styles.confirmButtonText}>Eliminar</Text>
                            </Pressable>
                        </View>
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
    settings: {
        width: 46,
        height: 46,
        backgroundColor: colors.white,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsActive: {
        backgroundColor: colors.lavender,
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
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemCard: {
        flex: 1,
    },
    deleteButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    deleteButtonPressed: {
        backgroundColor: colors.lavender,
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
    confirmationCard: {
        width: '100%',
        maxWidth: 380,
        padding: 24,
        backgroundColor: colors.white,
        borderRadius: 22,
        gap: 12,
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
    confirmationActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 12,
    },
    cancelButton: {
        minHeight: 44,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    confirmButton: {
        minHeight: 44,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.purple,
        borderRadius: 12,
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '700',
    },
});