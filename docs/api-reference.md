# API Reference

This document provides detailed API reference for the Dungen dungeon generator classes and functions.

## Classes

### GenMap

**File**: `src/GenMap.ts`

Main dungeon generation class that orchestrates the entire generation process.

#### Constructor

```typescript
constructor(
  seed: number,
  width: number,
  height: number,
  settings?: GenerationSettings
)
```

**Parameters**:
- `seed` (number): Random seed for reproducible generation
- `width` (number): Grid width in cells (minimum 5)
- `height` (number): Grid height in cells (minimum 5)
- `settings` (GenerationSettings, optional): Configuration object

**GenerationSettings Interface**:
```typescript
interface GenerationSettings {
  maxRoomPercent?: number;        // Default: 0.2
  maxGiantPercent?: number;       // Default: 0.1
  bossCount?: number;             // Default: varies
  bossMinDistFromStart?: number;  // Default: varies
  bossMinDistBetween?: number;    // Default: varies
  chestCount?: number;            // Default: varies
  monsterChokeCount?: number;     // Default: varies
  layerCount?: number;            // Default: 4
}
```

**Throws**:
- Error if width < 5 or height < 5

**Example**:
```typescript
const gen = new GenMap(12345, 30, 30, {
  maxRoomPercent: 0.2,
  bossCount: 3,
  chestCount: 5
});
```

#### Methods

##### generate()

```typescript
generate(): void
```

Executes the dungeon generation algorithm.

**Process**:
1. Places start position
2. Places boss rooms
3. Places boss pre-cells
4. Places random rooms
5. Creates giant rooms
6. Generates hallways
7. Validates connectivity
8. Removes clusters
9. Places chests
10. Places monster chokes
11. Places keys
12. Calculates walls

**Throws**:
- Error if boss placement fails
- Error if connectivity cannot be ensured

**Example**:
```typescript
gen.generate();
```

##### outputToTiled()

```typescript
outputToTiled(meta: TiledMeta, outputPath: string): void
```

Renders dungeon to TMX format and writes to file.

**Parameters**:
- `meta` (TiledMeta): Loaded tile templates
- `outputPath` (string): Destination file path

**Example**:
```typescript
const meta = new TiledMeta();
await meta.load('out/meta_forest.tmx');
gen.outputToTiled(meta, 'out/dungeon.tmx');
```

#### Properties

```typescript
class GenMap {
  width: number;              // Grid width
  height: number;             // Grid height
  grid: GenCell[][];          // 2D cell array
  startPos: {x: number, y: number}; // Start position
  bosses: Array<{x: number, y: number}>; // Boss positions
  // ... additional internal properties
}
```

**Access**: Properties are public but should be treated as read-only after generation.

---

### GenCell

**File**: `src/GenCell.ts`

Represents a single cell in the dungeon grid.

#### Constructor

```typescript
constructor(x: number, y: number, value: string)
```

**Parameters**:
- `x` (number): Grid X coordinate
- `y` (number): Grid Y coordinate
- `value` (string): Cell type ('S', 'R', 'B', 'K', 'C', 'H', 'M', 'L', 'X')

**Example**:
```typescript
const cell = new GenCell(5, 10, 'R'); // Regular room at (5, 10)
```

#### Properties

```typescript
class GenCell {
  x: number;          // Grid X position
  y: number;          // Grid Y position
  value: string;      // Cell type
  walls: number;      // Wall bitflags (RoomFlags)
  visited: boolean;   // DFS/BFS traversal state
}
```

#### Methods

##### setVisited()

```typescript
setVisited(state: boolean): void
```

Sets the visited state for traversal algorithms.

**Parameters**:
- `state` (boolean): Visited state

##### hasValue()

```typescript
hasValue(): boolean
```

Checks if cell is occupied (not empty).

**Returns**: `true` if value !== 'X', `false` otherwise

---

### TiledMap

**File**: `src/TiledMap.ts`

Container for the complete Tiled map structure.

#### Constructor

```typescript
constructor(width: number, height: number, layerCount: number)
```

**Parameters**:
- `width` (number): Map width in tiles
- `height` (number): Map height in tiles
- `layerCount` (number): Number of tile layers

**Example**:
```typescript
const map = new TiledMap(480, 480, 4); // 480×480 tiles, 4 layers
```

#### Methods

##### addLayer()

```typescript
addLayer(layer: TiledLayer): void
```

Adds a tile layer to the map.

**Parameters**:
- `layer` (TiledLayer): Layer to add

##### toXML()

```typescript
toXML(): string
```

Generates TMX XML representation.

**Returns**: XML string in TMX format

**Example**:
```typescript
const xml = map.toXML();
UtilFiles.writeFile('output.tmx', xml);
```

---

### TiledRoom

**File**: `src/TiledRoom.ts`

Renders a single dungeon cell with tiles across multiple layers.

#### Constructor

```typescript
constructor(meta: TiledMeta, wallFlags: number, layerCount: number)
```

**Parameters**:
- `meta` (TiledMeta): Tile segment templates
- `wallFlags` (number): Wall direction bitflags
- `layerCount` (number): Number of layers to render

**Example**:
```typescript
const room = new TiledRoom(meta, RoomFlags.TOP | RoomFlags.LEFT, 4);
```

#### Methods

##### renderToLayers()

```typescript
renderToLayers(): TiledLayer[]
```

Renders room tiles to layer arrays based on wall configuration.

**Returns**: Array of TiledLayer objects

**Example**:
```typescript
const layers = room.renderToLayers();
```

---

### TiledMeta

**File**: `src/TiledMeta.ts`

Loads and manages tile segment templates from TMX files.

#### Methods

##### load()

```typescript
async load(filepath: string): Promise<void>
```

Loads tile segments from meta TMX file.

**Parameters**:
- `filepath` (string): Path to meta TMX file

**Throws**: Error if file not found or invalid

**Example**:
```typescript
const meta = new TiledMeta();
await meta.load('/home/user/dungen/out/meta_forest.tmx');
```

##### getSegment()

```typescript
getSegment(name: string, layerIndex: number): number[][]
```

Retrieves tile data for a specific segment and layer.

**Parameters**:
- `name` (string): Segment name (e.g., 'floor', 'wall_top')
- `layerIndex` (number): Layer index (0-based)

**Returns**: 2D array of tile GIDs (16×16)

**Example**:
```typescript
const floorTiles = meta.getSegment('floor', 0);
```

---

### TiledLayer

**File**: `src/TiledLayer.ts`

Represents a single map layer with tile data encoding.

#### Constructor

```typescript
constructor(width: number, height: number, name?: string)
```

**Parameters**:
- `width` (number): Layer width in tiles
- `height` (number): Layer height in tiles
- `name` (string, optional): Layer name

**Example**:
```typescript
const layer = new TiledLayer(480, 480, 'Layer1');
```

#### Methods

##### setTile()

```typescript
setTile(x: number, y: number, gid: number): void
```

Sets tile at position.

**Parameters**:
- `x` (number): X coordinate
- `y` (number): Y coordinate
- `gid` (number): Tile GID (0 = empty)

##### encode()

```typescript
encode(): string
```

Compresses tile data to base64+zlib format.

**Returns**: Base64 encoded string

##### toXML()

```typescript
toXML(): string
```

Generates layer XML element.

**Returns**: XML string

---

## Enumerations

### RoomFlags

**File**: `src/RoomFlags.ts`

Bitflag enumeration for directional connections.

```typescript
enum RoomFlags {
  NONE   = 0,  // 0000 - No connections
  TOP    = 1,  // 0001 - Connection upward
  RIGHT  = 2,  // 0010 - Connection right
  BOTTOM = 4,  // 0100 - Connection downward
  LEFT   = 8   // 1000 - Connection left
}
```

**Usage**:
```typescript
// Combine flags with bitwise OR
const corner = RoomFlags.TOP | RoomFlags.LEFT; // 9 (1001)

// Check flags with bitwise AND
if (flags & RoomFlags.TOP) {
  console.log('Has top connection');
}

// Remove flag with bitwise AND NOT
flags = flags & ~RoomFlags.TOP;
```

---

## Utility Functions

**File**: `src/Util.ts`

### rand()

```typescript
function rand(min: number, max: number): number
```

Generates random integer between min and max (inclusive).

**Parameters**:
- `min` (number): Minimum value
- `max` (number): Maximum value

**Returns**: Random integer

**Example**:
```typescript
const random = rand(1, 10); // 1-10
```

### shuffle()

```typescript
function shuffle<T>(array: T[]): T[]
```

Randomizes array order using Fisher-Yates shuffle.

**Parameters**:
- `array` (T[]): Array to shuffle

**Returns**: Shuffled array (mutates original)

**Example**:
```typescript
const cells = [{x: 0, y: 0}, {x: 1, y: 1}];
shuffle(cells);
```

### bfsToNearest()

```typescript
function bfsToNearest(
  grid: GenCell[][],
  start: {x: number, y: number},
  predicate: (cell: GenCell) => boolean
): {x: number, y: number} | null
```

Finds nearest cell matching predicate using BFS.

**Parameters**:
- `grid` (GenCell[][]): Dungeon grid
- `start` ({x, y}): Starting position
- `predicate` (function): Test function for target cell

**Returns**: Position of nearest matching cell, or null if not found

**Example**:
```typescript
const nearest = bfsToNearest(grid, {x: 5, y: 5}, cell => cell.value === 'R');
```

### dfsFrom()

```typescript
function dfsFrom(
  grid: GenCell[][],
  start: {x: number, y: number}
): Set<string>
```

Performs depth-first search to find all reachable cells.

**Parameters**:
- `grid` (GenCell[][]): Dungeon grid
- `start` ({x, y}): Starting position

**Returns**: Set of position keys ("x,y") for reachable cells

**Example**:
```typescript
const reachable = dfsFrom(grid, startPos);
if (reachable.has('10,15')) {
  console.log('Cell (10, 15) is reachable');
}
```

### findUnreachable()

```typescript
function findUnreachable(
  grid: GenCell[][],
  reachable: Set<string>
): Array<{x: number, y: number}>
```

Identifies occupied cells that are not reachable.

**Parameters**:
- `grid` (GenCell[][]): Dungeon grid
- `reachable` (Set<string>): Set of reachable position keys

**Returns**: Array of unreachable cell positions

**Example**:
```typescript
const reachable = dfsFrom(grid, startPos);
const unreachable = findUnreachable(grid, reachable);
console.log(`Found ${unreachable.length} unreachable cells`);
```

---

## File I/O Functions

**File**: `src/UtilFiles.ts`

### writeFile()

```typescript
function writeFile(path: string, content: string): void
```

Writes string content to file.

**Parameters**:
- `path` (string): File path
- `content` (string): File content

**Throws**: Error on I/O failure

**Example**:
```typescript
writeFile('output/dungeon.tmx', xmlContent);
```

### readFile()

```typescript
function readFile(path: string): string
```

Reads file content as string.

**Parameters**:
- `path` (string): File path

**Returns**: File content

**Throws**: Error if file not found

### ensureDirectory()

```typescript
function ensureDirectory(path: string): void
```

Creates directory if it doesn't exist.

**Parameters**:
- `path` (string): Directory path

---

## A* Pathfinding

**Module**: `src/astar/`

### AStarFinder

```typescript
import { AStarFinder } from './astar/finders/AStarFinder';
import { Grid } from './astar/core/Grid';
```

#### Constructor

```typescript
const finder = new AStarFinder(options?: {
  allowDiagonal?: boolean;
  dontCrossCorners?: boolean;
  heuristic?: HeuristicFunction;
});
```

**Options**:
- `allowDiagonal` (boolean): Allow diagonal movement (default: false)
- `dontCrossCorners` (boolean): Prevent corner cutting (default: true)
- `heuristic` (function): Distance heuristic (default: manhattan)

#### findPath()

```typescript
findPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  grid: Grid
): Array<[number, number]>
```

**Parameters**:
- `startX`, `startY` (number): Start coordinates
- `endX`, `endY` (number): End coordinates
- `grid` (Grid): Pathfinding grid

**Returns**: Array of [x, y] coordinate pairs forming path

**Example**:
```typescript
const grid = new Grid(width, height);
// Set walkable cells
grid.setWalkableAt(x, y, true);

const finder = new AStarFinder();
const path = finder.findPath(0, 0, 10, 10, grid);
```

---

## Cell Type Reference

### Cell Value Meanings

| Value | Type | Description |
|-------|------|-------------|
| `S` | Start | Player spawn position |
| `R` | Room | Regular dungeon room |
| `B` | Boss | Boss encounter room |
| `K` | Key | Room containing key |
| `C` | Chest | Room containing treasure |
| `H` | Hallway | Connecting corridor |
| `M` | Monster | Monster choke point |
| `L` | Locked | Locked door (future use) |
| `X` | Empty | Unoccupied cell |

---

## Constants

### Default Values

```typescript
// Grid
const MIN_GRID_SIZE = 5;

// Room placement
const DEFAULT_MAX_ROOM_PERCENT = 0.2;  // 20%
const DEFAULT_MAX_GIANT_PERCENT = 0.1; // 10%

// Boss placement
const DEFAULT_BOSS_MIN_DIST_START = 8;
const DEFAULT_BOSS_MIN_DIST_BETWEEN = 5;

// Placement attempts
const MAX_BOSS_PLACEMENT_ATTEMPTS = 1000;
const MAX_GIANT_PLACEMENT_ATTEMPTS = 1000;
const MAX_CONNECTIVITY_ITERATIONS = 100;
const MAX_GENERATION_RETRIES = 10;

// Start position
const START_PADDING = 2;
const START_BOTTOM_SECTION = 0.6; // Bottom 40%

// Tile rendering
const TILES_PER_CELL = 16;
const TILE_SIZE = 16; // pixels
const DEFAULT_LAYER_COUNT = 4;
```

---

## Type Definitions

### Position

```typescript
interface Position {
  x: number;
  y: number;
}
```

### GenerationSettings

```typescript
interface GenerationSettings {
  maxRoomPercent?: number;
  maxGiantPercent?: number;
  bossCount?: number;
  bossMinDistFromStart?: number;
  bossMinDistBetween?: number;
  chestCount?: number;
  monsterChokeCount?: number;
  layerCount?: number;
}
```

### TilesetReference

```typescript
interface TilesetReference {
  firstgid: number;
  source: string;
}
```

---

## Complete Usage Example

```typescript
import { GenMap } from './GenMap';
import { TiledMeta } from './TiledMeta';

async function generateDungeon() {
  // Load tile templates
  const meta = new TiledMeta();
  await meta.load('/home/user/dungen/out/meta_forest.tmx');

  // Configure generation
  const seed = Date.now();
  const settings = {
    maxRoomPercent: 0.2,
    maxGiantPercent: 0.1,
    bossCount: 3,
    bossMinDistFromStart: 8,
    bossMinDistBetween: 5,
    chestCount: 5,
    monsterChokeCount: 3,
    layerCount: 4
  };

  // Create generator
  const gen = new GenMap(seed, 30, 30, settings);

  // Generate dungeon
  try {
    gen.generate();
    console.log('Generation successful!');
  } catch (error) {
    console.error('Generation failed:', error.message);
    return;
  }

  // Output to TMX
  const outputPath = '/home/user/dungen/out/dungeon.tmx';
  gen.outputToTiled(meta, outputPath);

  console.log(`Dungeon written to ${outputPath}`);
}

generateDungeon().catch(console.error);
```
