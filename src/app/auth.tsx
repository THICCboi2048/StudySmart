import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../components/StudyUI';
import { getFirebaseAuth } from '../services/firebaseAuth';
import { isFirebaseConfigured } from '../services/firebase';

type AuthMode = 'login' | 'register';

function getErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'No se pudo completar la operación. Inténtalo de nuevo.';
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Escribe un correo electrónico válido.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'El correo o la contraseña no son correctos.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Hubo demasiados intentos. Espera un momento y vuelve a probar.';
    case 'auth/network-request-failed':
      return 'No se pudo conectar. Revisa tu conexión a internet.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada.';
    default:
      return 'No se pudo completar la operación. Inténtalo de nuevo.';
  }
}

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    let active = true;
    let unsubscribe: (() => void) | undefined;

    void Promise.resolve().then(() => {
      if (!active) {
        return;
      }

      try {
        unsubscribe = onAuthStateChanged(
          getFirebaseAuth(),
          (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
          },
          (error) => {
            setErrorMessage(getErrorMessage(error));
            setIsLoading(false);
          }
        );
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  async function submitAuthForm(): Promise<void> {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setErrorMessage('Completa tu correo y contraseña.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function logOut(): Promise<void> {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signOut(getFirebaseAuth());
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(nextMode: AuthMode): void {
    setMode(nextMode);
    setErrorMessage('');
    setPassword('');
    setConfirmPassword('');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Pressable
              onPress={() => router.replace('/')}
              accessibilityRole="button"
              accessibilityLabel="Volver al inicio"
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color={colors.dark} />
              <Text style={styles.backText}>Inicio</Text>
            </Pressable>

            <View style={styles.brand}>
              <View style={styles.brandIcon}>
                <Ionicons name="school-outline" size={30} color={colors.purple} />
              </View>
              <Text style={styles.title}>
                {user ? 'Tu cuenta' : mode === 'login' ? '¡Qué bueno verte!' : 'Crea tu cuenta'}
              </Text>
              <Text style={styles.subtitle}>
                {user
                  ? 'Tu espacio de estudio está listo.'
                  : mode === 'login'
                    ? 'Inicia sesión para continuar aprendiendo.'
                    : 'Regístrate y organiza tu aprendizaje.'}
              </Text>
            </View>

            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={colors.purple}
                style={styles.loader}
                accessibilityLabel="Cargando cuenta"
              />
            ) : user ? (
              <View style={styles.card}>
                <View style={styles.accountIcon}>
                  <Ionicons name="person-outline" size={28} color={colors.purple} />
                </View>
                <Text style={styles.accountLabel}>Sesión iniciada</Text>
                <Text style={styles.accountEmail}>{user.email}</Text>
                {errorMessage ? (
                  <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                  </Text>
                ) : null}
                <Pressable
                  onPress={() => router.replace('/')}
                  accessibilityRole="button"
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Ir a estudiar</Text>
                </Pressable>
                <Pressable
                  onPress={logOut}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  style={styles.secondaryButton}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.purple} />
                  ) : (
                    <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
                  )}
                </Pressable>
              </View>
            ) : (
              <View style={styles.card}>
                <View style={styles.modeSwitch}>
                  <Pressable
                    onPress={() => changeMode('login')}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: mode === 'login' }}
                    style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
                  >
                    <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>
                      Iniciar sesión
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => changeMode('register')}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: mode === 'register' }}
                    style={[styles.modeTab, mode === 'register' && styles.modeTabActive]}
                  >
                    <Text style={[styles.modeText, mode === 'register' && styles.modeTextActive]}>
                      Registro
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@correo.com"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  textContentType="emailAddress"
                  style={styles.input}
                  accessibilityLabel="Correo electrónico"
                />

                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  returnKeyType={mode === 'register' ? 'next' : 'done'}
                  secureTextEntry
                  textContentType={mode === 'register' ? 'newPassword' : 'password'}
                  style={styles.input}
                  accessibilityLabel="Contraseña"
                />

                {mode === 'register' && (
                  <>
                    <Text style={styles.label}>Confirmar contraseña</Text>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Repite tu contraseña"
                      placeholderTextColor={colors.muted}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      returnKeyType="done"
                      secureTextEntry
                      textContentType="newPassword"
                      style={styles.input}
                      accessibilityLabel="Confirmar contraseña"
                    />
                  </>
                )}

                {errorMessage ? (
                  <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                  </Text>
                ) : null}

                {!isFirebaseConfigured && (
                  <View style={styles.configNotice}>
                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color={colors.purple}
                    />
                    <Text style={styles.configText}>
                      Falta conectar una app web de Firebase. Consulta la configuración en el
                      README para habilitar el acceso.
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={submitAuthForm}
                  disabled={isSubmitting || !isFirebaseConfigured}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (isSubmitting || !isFirebaseConfigured) && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 44,
    gap: 8,
  },
  backText: {
    color: colors.dark,
    fontSize: 15,
    fontWeight: '600',
  },
  brand: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 28,
  },
  brandIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: colors.dark,
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  loader: {
    marginVertical: 48,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    elevation: 3,
    shadowColor: colors.dark,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  modeSwitch: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 15,
    backgroundColor: colors.background,
    marginBottom: 24,
  },
  modeTab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  modeTabActive: {
    backgroundColor: colors.white,
    elevation: 1,
  },
  modeText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  modeTextActive: {
    color: colors.dark,
  },
  label: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.lavender,
    borderRadius: 14,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
    color: colors.dark,
    fontSize: 16,
  },
  error: {
    color: '#B3261E',
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
  },
  configNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 12,
    marginTop: 18,
  },
  configText: {
    flex: 1,
    color: colors.dark,
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purple,
    borderRadius: 15,
    marginTop: 22,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  secondaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: colors.purple,
    fontSize: 15,
    fontWeight: '700',
  },
  accountIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  accountLabel: {
    color: colors.dark,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  accountEmail: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
  },
});
