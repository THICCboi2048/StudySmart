import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const colors = {
  background: '#F5EFE6', // Beige crema
  purple: '#795548',     // Ahora representa el marrón principal
  dark: '#4E342E',       // Marrón oscuro
  lavender: '#E6D5C3',   // Beige tostado
  white: '#FFFCF7',      // Blanco cálido
  muted: '#8D796B',      // Marrón grisáceo
};
export function ScreenHeader({ title, subtitle, onBack, titleSize = 29 }) {
  return (
    <View>
      <View style={styles.screenHeader}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </Pressable>
        <Text
          style={[styles.screenTitle, { fontSize: titleSize }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}
export function StudyButton({ title, onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.studyButton,
        pressed && styles.pressed,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={23}
          color={colors.purple}
          style={styles.buttonIcon}
        />
      )}
      <Text style={styles.buttonText}>{title}</Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.muted}
      />
    </Pressable>
  );
}

/**
 * @param {{ active?: string, showAdd?: boolean, onAdd?: () => void, addLabel?: string, addIcon?: string }} props
 */
export function BottomBar({
  active = 'home',
  showAdd = true,
  onAdd = undefined,
  addLabel = 'Añadir',
  addIcon = 'add',
}) {
  const router = useRouter();

  const items = [
    {
      key: 'home',
      icon: 'home',
      action: () => router.replace('/'),
      label: 'Inicio',
    },
    showAdd
      ? {
          key: 'add',
          icon: addIcon,
          action: onAdd || (() => router.push('/creacion')),
          label: addLabel,
        }
      : {
          key: 'notebooks',
          icon: 'create-outline',
          action: () => router.push('/cuadernos'),
          label: 'Cuadernos',
        },
    {
      key: 'profile',
      icon: 'person-circle-outline',
      action: () => router.push('/auth'),
      label: 'Perfil',
    },
  ];

  return (
    <View style={styles.bottomBar}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={item.action}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          style={styles.navItem}
        >
          <View
            style={[
              styles.navIcon,
              active === item.key && styles.navIconActive,
              item.key === 'add' && styles.addIcon,
            ]}
          >
            <Ionicons
              name={item.icon}
              size={26}
              color={
                active === item.key || item.key === 'add'
                  ? colors.purple
                  : colors.muted
              }
            />
          </View>
          <Text style={styles.navLabel}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  studyButton: {
    minHeight: 66,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#4E342E',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    flex: 1,
    color: colors.dark,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#4E342E',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navIcon: {
    width: 46,
    height: 40,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    backgroundColor: colors.lavender,
  },
  addIcon: {
    borderWidth: 1.5,
    borderColor: colors.lavender,
    borderRadius: 50,
  },
  navLabel: {
    color: colors.muted,
    fontSize: 11,
  },
  screenHeader: {
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
screenTitle: {
  flex: 1,
  fontWeight: '800',
  color: colors.dark,
},
screenSubtitle: {
  marginTop: 6,
  fontSize: 15,
  color: colors.muted,
},
});