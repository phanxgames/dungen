# Architecture

This document describes the system architecture and design of the Dungen dungeon generator.

## System Architecture

### High-Level Overview

```
┌─────────────┐
│   main.ts   │  Entry Point
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│             GenMap.ts                   │  Generation Engine
│  ┌───────────────────────────────────┐  │
│  │ 1. Initialize Grid                │  │
│  │ 2. Place Start Position           │  │
│  │ 3. Place Boss Rooms                │  │
│  │ 4. Place Regular Rooms             │  │
│  │ 5. Create Giant Rooms              │  │
│  │ 6. Generate Hallways               │  │
│  │ 7. Validate Connectivity           │  │
│  │ 8. Place Strategic Elements        │  │
│  │ 9. Calculate Walls                 │  │
│  │ 10. Output to Tiled Format         │  │
│  └───────────────────────────────────┘  │
└────┬────────────────────────┬───────────┘
     │                        │
     ▼                        ▼
┌─────────────┐      ┌──────────────────┐
│  GenCell.ts │      │    Util.ts       │  Utilities
│  Data Model │      │  - Pathfinding   │
└─────────────┘      │  - Random Utils  │
                     │  - DFS/BFS       │
                     └──────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │   astar/         │  A* Pathfinding
                     │  - Grid          │
                     │  - Finder        │
                     │  - Heuristics    │
                     └──────────────────┘

┌─────────────────────────────────────────┐
│          Tiled Output Layer              │
│  ┌────────────┐  ┌─────────────┐       │
│  │ TiledMap   │  │ TiledMeta   │       │
│  │ Container  │  │ Templates   │       │
│  └─────┬──────┘  └──────┬──────┘       │
│        │                │              │
│        ▼                ▼              │
│  ┌────────────┐  ┌─────────────┐       │
│  │ TiledRoom  │  │ RoomFlags   │       │
│  │ Rendering  │  │ Bitflags    │       │
│  └─────┬──────┘  └─────────────┘       │
│        │                               │
│        ▼                               │
│  ┌────────────┐                        │
│  │TiledLayer  │                        │
│  │Compression │                        │
│  └────────────┘                        │
└─────────────┬───────────────────────────┘
              │
              ▼
        ┌──────────────┐
        │ UtilFiles.ts │  File I/O
        │ TMX Output   │
        └──────────────┘
```

## Component Design

### 1. GenMap (Core Generation Engine)

**File**: `src/GenMap.ts`

**Responsibility**: Orchestrates the entire dungeon generation process.

**Key Methods**:

- `constructor(seed, width, height, settings)` - Initialize generation parameters
- `generate()` - Main generation orchestration method
- `placeStart()` - Random start position placement
- `placeBosses()` - Boss room placement with distance constraints
- `placeBossPreCells()` - Pre-boss rooms for key placement
- `placeRandomRooms()` - Scatter regular rooms
- `placeGiantRooms()` - Convert adjacent rooms to 2x2 giants
- `placeKeys()` - Strategic key placement
- `placeChests()` - Deadend chest placement
- `placeMonsterChokes()` - Corridor monster placement
- `generateHallways()` - Connect isolated rooms
- `validateConnectivity()` - Ensure all rooms reachable
- `calculateWalls()` - Compute wall bitflags
- `outputToTiled()` - Generate TMX output

**Design Pattern**: Builder pattern - incrementally constructs dungeon

**Dependencies**:
- GenCell (data model)
- Util (pathfinding, randomization)
- TiledMap (output generation)
- TiledMeta (tile templates)

### 2. GenCell (Data Model)

**File**: `src/GenCell.ts`

**Responsibility**: Represents a single grid cell in the dungeon.

**Properties**:
```typescript
{
  x: number            // Grid X position
  y: number            // Grid Y position
  value: string        // Cell type (S/R/B/K/C/H/M/L/X)
  walls: number        // Bitflags for wall directions
  visited: boolean     // DFS/BFS traversal state
}
```

**Design Pattern**: Value object - immutable cell state

**Methods**:
- `constructor(x, y, value)` - Create cell
- `setVisited(state)` - Mark traversal state
- `hasValue()` - Check if cell is occupied

### 3. Util (Utility Functions)

**File**: `src/Util.ts`

**Responsibility**: Provides reusable algorithms and utilities.

**Key Functions**:

- `rand(min, max)` - Random integer generation
- `shuffle(array)` - Array randomization (Fisher-Yates)
- `bfsToNearest(grid, start, predicate)` - Find nearest cell matching condition
- `dfsFrom(grid, start)` - Depth-first search for connectivity
- `findUnreachable(grid, reachable)` - Identify isolated cells

**Design Pattern**: Utility module (pure functions)

### 4. A* Pathfinding Module

**Directory**: `src/astar/`

**Responsibility**: Provides pathfinding capabilities for hallway generation.

**Structure**:
```
astar/
├── astar.ts           # Main A* export
├── core/
│   ├── Grid.ts        # Grid representation
│   ├── Heuristic.ts   # Distance heuristics (Manhattan, etc.)
│   ├── Node.ts        # Pathfinding node
│   └── Util.ts        # Helper functions
├── finders/
│   └── AStarFinder.ts # A* algorithm implementation
├── interfaces/        # TypeScript interfaces
└── types/            # Type definitions
```

**Algorithm**: A* with Manhattan heuristic

**Features**:
- Grid-based navigation
- Walkable/non-walkable nodes
- Diagonal movement support
- Configurable heuristics

### 5. TiledMap (Output Container)

**File**: `src/TiledMap.ts`

**Responsibility**: Container for the complete Tiled map structure.

**Properties**:
```typescript
{
  width: number              // Map width in tiles
  height: number             // Map height in tiles
  tilewidth: number          // Tile width (16)
  tileheight: number         // Tile height (16)
  orientation: string        // "orthogonal"
  renderorder: string        // "right-down"
  layers: TiledLayer[]       // Map layers
  tilesets: TilesetRef[]     // Referenced tilesets
}
```

**Methods**:
- `constructor(width, height, layerCount)` - Initialize map
- `addLayer(layer)` - Add tile layer
- `toXML()` - Generate TMX XML output

**Design Pattern**: Composite pattern - contains layers

### 6. TiledRoom (Room Renderer)

**File**: `src/TiledRoom.ts`

**Responsibility**: Renders a single room cell with tiles across multiple layers.

**Key Methods**:
- `constructor(meta, wallFlags, layerCount)` - Initialize room
- `renderToLayers()` - Apply tile segments to layers based on wall flags
- `selectSegments()` - Choose appropriate tile segments from bitflags

**Segment Selection Logic**:
```
wallFlags = TOP | LEFT (9)
→ Requires: floor, wall_top, wall_left, inner_corner_top_left
```

**Design Pattern**: Strategy pattern - rendering varies by wall configuration

### 7. TiledMeta (Tile Templates)

**File**: `src/TiledMeta.ts`

**Responsibility**: Loads and manages tile segment templates from TMX files.

**Segments Loaded**:
1. `floor` - Floor tiles
2. `wall_top` - Top wall
3. `wall_bottom` - Bottom wall
4. `wall_left` - Left wall
5. `wall_right` - Right wall
6. `inner_corner_tl` - Inner top-left corner
7. `inner_corner_tr` - Inner top-right corner
8. `inner_corner_bl` - Inner bottom-left corner
9. `inner_corner_br` - Inner bottom-right corner
10. `outer_corner_tl` - Outer top-left corner
11. `outer_corner_tr` - Outer top-right corner
12. `outer_corner_bl` - Outer bottom-left corner
13. `outer_corner_br` - Outer bottom-right corner

**Methods**:
- `async load(filepath)` - Load meta TMX file
- `getSegment(name, layerIndex)` - Retrieve segment tiles

**Design Pattern**: Factory pattern - creates tile configurations

### 8. TiledLayer (Layer Encoding)

**File**: `src/TiledLayer.ts`

**Responsibility**: Represents a single map layer with tile data encoding.

**Properties**:
```typescript
{
  name: string              // Layer name
  width: number             // Layer width
  height: number            // Layer height
  data: number[][]          // 2D tile array
  encoding: string          // "base64"
  compression: string       // "zlib"
}
```

**Methods**:
- `setTile(x, y, gid)` - Set tile at position
- `encode()` - Compress data to base64+zlib
- `toXML()` - Generate layer XML

**Design Pattern**: Decorator pattern - adds encoding to raw data

### 9. RoomFlags (Bitflags)

**File**: `src/RoomFlags.ts`

**Responsibility**: Defines directional connection bitflags.

```typescript
enum RoomFlags {
  NONE   = 0,    // 0000
  TOP    = 1,    // 0001
  RIGHT  = 2,    // 0010
  BOTTOM = 4,    // 0100
  LEFT   = 8     // 1000
}
```

**Usage**: Combine flags with bitwise OR for multiple directions:
- `TOP | LEFT` = 9 (1001)
- `RIGHT | BOTTOM` = 6 (0110)

**Design Pattern**: Flags enumeration

### 10. UtilFiles (File I/O)

**File**: `src/UtilFiles.ts`

**Responsibility**: File system operations.

**Methods**:
- `writeFile(path, content)` - Write string to file
- `readFile(path)` - Read file contents
- `ensureDirectory(path)` - Create directory if not exists

## Data Flow

### Generation Phase

```
main.ts
  ↓
GenMap.generate()
  ↓
1. Initialize grid[y][x] = new GenCell(x, y, 'X')
  ↓
2. Place special cells (S, B, R)
  ↓
3. Generate hallways (H)
  │  ↓
  │  Util.bfsToNearest() → Find target
  │  ↓
  │  astar/AStarFinder → Calculate path
  │  ↓
  │  Create hallway cells
  ↓
4. Validate with Util.dfsFrom()
  ↓
5. Place elements (K, C, M)
  ↓
6. Calculate walls (bitflags)
```

### Rendering Phase

```
GenMap.outputToTiled()
  ↓
TiledMeta.load() → Load tile templates
  ↓
For each GenCell:
  ↓
  TiledRoom(meta, cell.walls, layerCount)
  ↓
  TiledRoom.renderToLayers()
  │  ↓
  │  Select segments based on wall bitflags
  │  ↓
  │  Apply tiles to each layer
  ↓
  Add to TiledMap layers
  ↓
TiledLayer.encode() → base64+zlib
  ↓
TiledMap.toXML() → Generate TMX
  ↓
UtilFiles.writeFile() → Save to disk
```

## Design Principles

### Separation of Concerns
- **Generation logic** (GenMap) separate from **rendering** (Tiled*)
- **Data model** (GenCell) separate from **algorithms** (Util)
- **Core engine** separate from **I/O** (UtilFiles)

### Single Responsibility
- Each class has one primary responsibility
- GenCell: data
- GenMap: generation
- TiledMap: output format
- Util: reusable algorithms

### Dependency Injection
- GenMap receives seed and settings
- TiledRoom receives meta and wall flags
- Enables testability and configuration

### Immutability (Partial)
- GenCell values are set once per generation phase
- Enables safe traversal algorithms (DFS/BFS)

### Modularity
- A* pathfinding is self-contained module
- Tiled output layer is separate subsystem
- Can swap implementations independently

## Extension Points

### Adding New Cell Types
1. Define new value in GenCell
2. Add placement logic in GenMap
3. Define tile segments in meta TMX
4. Update rendering logic in TiledRoom

### Supporting New Output Formats
1. Create new output class (e.g., JSONMap)
2. Implement conversion from GenCell grid
3. Add output method to GenMap

### Custom Generation Algorithms
1. Extend GenMap or create alternative generator
2. Reuse GenCell and Util functions
3. Maintain same grid structure for compatibility

### Additional Tile Themes
1. Create new meta TMX with 13 required segments
2. Pass meta path to TiledMeta.load()
3. Same generation logic produces different visual style
