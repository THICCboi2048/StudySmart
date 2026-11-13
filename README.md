### RESUMEN DE LA FUNCIÓN DE CADA ARCHIVO (PARA NUESTROS COMPAÑEROS):

# APP
auth.tsx -> la pagina del perfil y manejo de registro/inicio sesion
creacion.js -> gestiona la creación de nuevos cuadernos
crear-flascard.tsx -> gestiona la creación de nuevas flashcards
cuadernos.js -> es el menú donde aparecen los cuadernos
detalle-cuaderno.tsx -> es el contenido del interior de los cuadernos
flashcards.tsx -> es el contenido individual de cada una de las flascards
index.js -> es la página de inicio (donde se encuentra el fueguito)

materia.js -> archivo que CREO que ya no utilizamos, posiblemente sea seguro borrarlo, pero el código sirve como ejemplo igual si se accede directamente mediante localhost:8081/materia

# COMPONENTS

StudyUI -> tiene el estilo de diversas partes de la aplicación. Aquí hay componentes personalizados, como el Pressable convertido en HapticPressable, para q vibre

# CONSTANTS

theme.ts -> creo que también no es utilizado por nada y es seguro de borrar
textLimits -> es limite de lso textos qu se pueden poner 
# CONTEXT

NotebookContext.tsx -> creo que gestiona algo del funcionamiento y/o almacenamiento de las flashcards y cuadernos. Aquí es donde está la flashcard del teatro, así que como minimo no lo borren

# hooks y services tiene todo lo del firebase
