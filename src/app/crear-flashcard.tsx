import { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BottomBar, ScreenHeader, colors } from '../components/StudyUI';
import { useNotebooks } from '../context/NotebookContext';

type Borrador = { key: string; title: string; content: string };

let contador = 0;
const nuevoBorrador = (): Borrador => ({
    key: `b-${contador++}`,
    title: '',
    content: '',
});

export default function CrearFlashcardScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { getNotebook, addFlashcardSet } = useNotebooks();

    const notebookId = Array.isArray(params.id) ? params.id[0] : params.id;
    const notebook = getNotebook(notebookId);

    const [nombre, setNombre] = useState('');
    const [borradores, setBorradores] = useState<Borrador[]>([nuevoBorrador()]);

    const puedeCrear = nombre.trim().length > 0 && !!notebookId;

    function actualizar(key: string, campo: 'title' | 'content', valor: string) {
        setBorradores((actual) =>
            actual.map((b) => (b.key === key ? { ...b, [campo]: valor } : b)),
        );
    }

    function agregarTarjeta() {
        setBorradores((actual) => [...actual, nuevoBorrador()]);
    }

    function quitarTarjeta(key: string) {
        setBorradores((actual) =>
            actual.length === 1 ? actual : actual.filter((b) => b.key !== key),
        );
    }

    function crearFlashcard() {
        if (!puedeCrear || !notebookId) return;

        const cards = borradores
            .map((b) => ({ title: b.title.trim(), content: b.content.trim() }))
            .filter((c) => c.title || c.content);

        addFlashcardSet(notebookId, nombre.trim(), cards);

        // Vuelve siempre al menú del cuaderno, sin importar desde dónde se abrió
        router.dismissTo({ pathname: '/detalle-cuaderno', params: { id: notebookId } });
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>

                <ScreenHeader
                    title="Nueva flashcard"
                    subtitle={notebook ? `en ${notebook.name}` : undefined}
                    onBack={() => router.back()}
                />

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.label}>Nombre del set</Text>
                    <TextInput
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Ej. Tipos de escenarios"
                        placeholderTextColor={colors.muted}
                        style={styles.input}
                        accessibilityLabel="Nombre de la flashcard"
                    />

                    <Text style={[styles.label, styles.labelSpacing]}>Tarjetas</Text>

                    {borradores.map((b, i) => (
                        <View key={b.key} style={styles.cardBox}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardNumber}>Tarjeta {i + 1}</Text>
                                {borradores.length > 1 && (
                                    <Pressable
                                        onPress={() => quitarTarjeta(b.key)}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Quitar tarjeta ${i + 1}`}
                                        hitSlop={8}
                                    >
                                        <Ionicons name="close" size={22} color={colors.muted} />
                                    </Pressable>
                                )}
                            </View>
                            <TextInput
                                value={b.title}
                                onChangeText={(t) => actualizar(b.key, 'title', t)}
                                placeholder="Título"
                                placeholderTextColor={colors.muted}
                                style={styles.input}
                                accessibilityLabel={`Título de la tarjeta ${i + 1}`}
                            />
                            <TextInput
                                value={b.content}
                                onChangeText={(t) => actualizar(b.key, 'content', t)}
                                placeholder="Contenido"
                                placeholderTextColor={colors.muted}
                                multiline
                                textAlignVertical="top"
                                style={[styles.input, styles.textarea]}
                                accessibilityLabel={`Contenido de la tarjeta ${i + 1}`}
                            />
                        </View>
                    ))}

                    <Pressable
                        onPress={agregarTarjeta}
                        accessibilityRole="button"
                        accessibilityLabel="Añadir otra tarjeta"
                        style={({ pressed }) => [styles.addCard, pressed && styles.pressed]}
                    >
                        <Ionicons name="add" size={26} color={colors.purple} />
                    </Pressable>

                    <Pressable
                        onPress={crearFlashcard}
                        disabled={!puedeCrear}
                        accessibilityRole="button"
                        accessibilityLabel="Crear flashcard"
                        style={({ pressed }) => [
                            styles.createButton,
                            !puedeCrear && styles.createButtonDisabled,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.createButtonText}>Crear flashcard</Text>
                    </Pressable>
                </ScrollView>

                <View style={styles.bottom}>
                    <BottomBar active="add" onAdd={() => { }} addLabel="Flashcard" />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
    title: { fontSize: 29, fontWeight: '800', color: colors.dark },
    subtitle: { marginTop: 4, fontSize: 15, color: colors.muted },
    scroll: { flex: 1, marginTop: 20 },
    scrollContent: { paddingBottom: 16 },
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
    textarea: { minHeight: 90, paddingTop: 14, marginTop: 10 },
    cardBox: {
        padding: 14,
        marginBottom: 12,
        backgroundColor: colors.background,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.lavender,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardNumber: { color: colors.muted, fontSize: 14, fontWeight: '700' },
    addCard: {
        minHeight: 50,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.lavender,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButton: {
        minHeight: 54,
        marginTop: 18,
        paddingHorizontal: 20,
        backgroundColor: colors.purple,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonDisabled: { opacity: 0.5 },
    createButtonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
    pressed: { opacity: 0.8 },
    bottom: { marginTop: 'auto', paddingBottom: 10 },
    backButton: {
        width: 46,
        height: 46,
        backgroundColor: colors.white,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    }
});