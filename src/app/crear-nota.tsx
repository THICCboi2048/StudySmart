import { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BottomBar, ScreenHeader, colors,HapticPressable } from '../components/StudyUI';
import { useNotebooks } from '../context/NotebookContext';
import {
    MAX_NOTE_CONTENT_LENGTH,
    MAX_TITLE_LENGTH,
} from '../constants/textLimits';

export default function CrearNotaScreen() {
    const params = useLocalSearchParams();
    const notebookId = Array.isArray(params.id) ? params.id[0] : params.id;
    const noteId = Array.isArray(params.noteId) ? params.noteId[0] : params.noteId;

    return (
        <CrearNotaForm
            key={`${notebookId ?? ''}:${noteId ?? 'new'}`}
            notebookId={notebookId}
            noteId={noteId}
        />
    );
}

function CrearNotaForm({
    notebookId,
    noteId,
}: {
    notebookId?: string;
    noteId?: string;
}) {
    const router = useRouter();
    const {
        addNote,
        getNotebook,
        updateNote,
        error,
        clearError,
    } = useNotebooks();

    const notebook = getNotebook(notebookId);
    const note = notebook?.notes.find((item) => item.id === noteId);
    const [titulo, setTitulo] = useState(note?.name ?? '');
    const [contenido, setContenido] = useState(note?.content ?? '');
    const [saving, setSaving] = useState(false);
    const isEditing = !!noteId;

    const puedeGuardar =
        titulo.trim().length > 0 &&
        !!notebook &&
        (!isEditing || !!note);

    async function guardarNota() {
        if (!puedeGuardar || !notebookId || saving) return;

        clearError();
        setSaving(true);
        try {
            if (noteId) {
                await updateNote(notebookId, noteId, titulo.trim(), contenido.trim());
            } else {
                await addNote(notebookId, titulo.trim(), contenido.trim());
            }
            router.dismissTo({ pathname: '/detalle-cuaderno', params: { id: notebookId } });
        } catch {
            // The context exposes the error to the screen.
        } finally {
            setSaving(false);
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <ScreenHeader
                    title={isEditing ? 'Editar nota' : 'Nueva nota'}
                    subtitle={notebook ? `en ${notebook.name}` : undefined}
                    onBack={() => router.back()}
                />

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {(!notebook || (isEditing && !note)) && (
                        <Text style={styles.errorMessage}>
                            {notebook
                                ? 'No se encontró la nota. Vuelve al cuaderno e inténtalo de nuevo.'
                                : 'No se encontró el cuaderno. Vuelve a la lista e inténtalo de nuevo.'}
                        </Text>
                    )}
                    {error ? (
                        <Text accessibilityRole="alert" style={styles.errorMessage}>{error}</Text>
                    ) : null}

                    <Text style={styles.label}>Título</Text>
                    <TextInput
                        value={titulo}
                        onChangeText={setTitulo}
                        maxLength={MAX_TITLE_LENGTH}
                        placeholder="Ej. Resumen del tema"
                        placeholderTextColor={colors.muted}
                        style={styles.input}
                        accessibilityLabel="Título de la nota"
                        returnKeyType="next"
                    />

                    <Text style={[styles.label, styles.labelSpacing]}>Contenido</Text>
                    <TextInput
                        value={contenido}
                        onChangeText={setContenido}
                        maxLength={MAX_NOTE_CONTENT_LENGTH}
                        placeholder="Escribe aquí tu nota"
                        placeholderTextColor={colors.muted}
                        multiline
                        textAlignVertical="top"
                        style={[styles.input, styles.textarea]}
                        accessibilityLabel="Contenido de la nota"
                    />

                    <HapticPressable
                        onPress={guardarNota}
                        disabled={!puedeGuardar || saving}
                        accessibilityRole="button"
                        accessibilityLabel={isEditing ? 'Guardar cambios de la nota' : 'Guardar nota'}
                        accessibilityState={{ disabled: !puedeGuardar }}
                        style={({ pressed }) => [
                            styles.saveButton,
                            (!puedeGuardar || saving) && styles.saveButtonDisabled,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.saveButtonText}>
                            {isEditing ? 'Guardar cambios' : 'Guardar nota'}
                        </Text>
                    </HapticPressable>
                </ScrollView>

                <View style={styles.bottom}>
                    <BottomBar active="add" onAdd={() => { }} addLabel="Nota" />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
    scroll: { flex: 1, marginTop: 20 },
    scrollContent: { paddingBottom: 16 },
    errorMessage: {
        marginBottom: 18,
        color: colors.muted,
        fontSize: 15,
        lineHeight: 22,
    },
    label: {
        marginBottom: 10,
        color: colors.dark,
        fontSize: 16,
        fontWeight: '600',
    },
    labelSpacing: { marginTop: 22 },
    input: {
        minHeight: 50,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.lavender,
        color: colors.dark,
        fontSize: 16,
    },
    textarea: {
        minHeight: 220,
        paddingTop: 14,
    },
    saveButton: {
        minHeight: 54,
        marginTop: 22,
        paddingHorizontal: 20,
        backgroundColor: colors.purple,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: { opacity: 0.5 },
    saveButtonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
    pressed: { opacity: 0.8 },
    bottom: { marginTop: 'auto', paddingBottom: 10 },
});
