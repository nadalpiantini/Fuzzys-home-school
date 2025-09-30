// Mensajes básicos en español para Blockly Games Maze
// Archivo temporal para permitir funcionamiento básico

window.BlocklyGamesMsg = window.BlocklyGamesMsg || {};

// Mensajes principales del juego
window.BlocklyGamesMsg.MAZE_NAME = 'Laberinto con Fuzzy';
window.BlocklyGamesMsg.MAZE_SUBTITLE = '¡Ayuda a Fuzzy a salir del laberinto!';

// Mensajes de acciones
window.BlocklyGamesMsg.MAZE_MOVE_FORWARD = 'avanzar';
window.BlocklyGamesMsg.MAZE_TURN_LEFT = 'girar a la izquierda';
window.BlocklyGamesMsg.MAZE_TURN_RIGHT = 'girar a la derecha';
window.BlocklyGamesMsg.MAZE_DO = 'hacer';
window.BlocklyGamesMsg.MAZE_ELSE = 'si no';
window.BlocklyGamesMsg.MAZE_IF = 'si';
window.BlocklyGamesMsg.MAZE_REPEAT = 'repetir';
window.BlocklyGamesMsg.MAZE_WHILE = 'mientras';

// Mensajes de condiciones
window.BlocklyGamesMsg.MAZE_IS_PATH_FORWARD = 'hay camino adelante';
window.BlocklyGamesMsg.MAZE_IS_PATH_LEFT = 'hay camino a la izquierda';
window.BlocklyGamesMsg.MAZE_IS_PATH_RIGHT = 'hay camino a la derecha';

// Mensajes de interfaz
window.BlocklyGamesMsg.MAZE_RUN_TOOLTIP = 'Hacer que Fuzzy ejecute lo que dicen los bloques.';
window.BlocklyGamesMsg.MAZE_RESET_TOOLTIP = 'Poner a Fuzzy de vuelta al inicio del laberinto.';
window.BlocklyGamesMsg.MAZE_HELP_IF = 'Un bloque "si" hará algo sólo si la condición es verdadera.';
window.BlocklyGamesMsg.MAZE_HELP_MENU = 'Hacer clic en %1 en el bloque "si" para cambiar su condición.';
window.BlocklyGamesMsg.MAZE_HELP_CAPACITY = 'Has usado todos los bloques para este nivel. Para crear un nuevo bloque, primero tienes que borrar un bloque existente.';
window.BlocklyGamesMsg.MAZE_HELP_REPEAT = 'Las computadoras son muy buenas ejecutando las mismas acciones varias veces. Alcanza el final de este camino con sólo dos bloques usando el bloque "repetir".';
window.BlocklyGamesMsg.MAZE_HELP_IF = 'Un bloque "si" hará algo sólo si la condición es verdadera. Trata de girar a la izquierda si hay un camino hacia la izquierda.';
window.BlocklyGamesMsg.MAZE_HELP_WALL = 'Los bloques "si" tienen que girar en las esquinas cuando hay una pared adelante. ¿Puede Fuzzy seguir este camino?';

// Mensajes de finalización
window.BlocklyGamesMsg.MAZE_SUCCESS = '¡Fantástico! Fuzzy llegó a la meta.';
window.BlocklyGamesMsg.MAZE_FAILURE = 'Los bloques no resuelven este laberinto.';

// Botones y controles
window.BlocklyGamesMsg.MAZE_RUN_PROGRAM = '▶ Ejecutar programa';
window.BlocklyGamesMsg.MAZE_RESET = '⟲ Reiniciar';
window.BlocklyGamesMsg.MAZE_STEP = 'Paso a paso';

console.log('🎮 Mensajes en español para Maze cargados - Fuzzy está listo!');