# Functionality

This document details all the functional capabilities of the Dungen dungeon generator.

## Core Features

### 1. Grid-Based Dungeon Generation

The generator creates dungeons on a configurable grid system where each cell represents a room or hallway segment.

**Features**:
- Configurable grid dimensions (minimum 5x5, tested up to 30x30)
- Each cell is 16x16 tiles in the output map
- Grid-based pathfinding and connectivity

**Cell Types**:
- `S` - Start Position: Player spawn point
- `R` - Regular Room: Standard dungeon room
- `B` - Boss Room: Contains boss encounter, requires key
- `K` - Key Room: Contains key to unlock boss room
- `C` - Chest Room: Contains treasure, placed in deadends
- `H` - Hallway: Connecting corridor
- `M` - Monster Choke: Tactical combat point
- `L` - Locked Door: Gate requiring key
- `X` - Empty: Unused grid cell

### 2. Room Placement

#### Start Position
- Placed randomly in the bottom portion of the map
- Includes padding from edges to avoid edge spawning
- Always reachable and serves as origin for pathfinding

#### Boss Rooms
- Configurable number of boss encounters
- Minimum distance from start position (prevents early bosses)
- Minimum distance from each other (distributes bosses)
- Requires adjacent pre-room for key placement
- Can be locked with keys for progression gating

#### Regular Rooms
- Random placement based on maximum room density percentage (default 20%)
- Algorithm scatters rooms avoiding excessive clustering
- Validation ensures rooms have at least one neighbor (no lonely rooms)

#### Giant Rooms
- 2x2 cell room clusters for variety
- Created from adjacent regular rooms
- Limited to configurable percentage of grid (default 10%)
- Adds visual and gameplay variety

### 3. Hallway Generation

**Purpose**: Connect isolated room clusters to ensure full dungeon traversability.

**Algorithm**:
1. Identify unreachable rooms using DFS from start position
2. Find nearest reachable room using BFS pathfinding
3. Create hallway path between isolated and reachable areas
4. Repeat until all rooms are connected
5. Remove any remaining unreachable cells

**Characteristics**:
- Hallways are single-cell wide corridors
- Use A* pathfinding for efficient routing
- Automatically handles multiple disconnected regions

### 4. Strategic Element Placement

#### Chest Placement
- Located in deadend rooms (rooms with only one exit)
- Minimum distance from start (rewards exploration)
- Configurable quantity
- Ensures risk/reward gameplay loop

#### Monster Choke Points
- Placed in hallways that act as corridors (exactly 2 connections)
- Creates tactical combat scenarios
- Forces player engagement
- Configurable quantity

#### Key Placement
- Number of keys matches number of boss rooms
- Placed in regular rooms (not hallways or deadends)
- Enables progressive unlocking of boss encounters

### 5. Connectivity Validation

**Reachability System**:
- Depth-First Search (DFS) from start position
- Identifies all reachable cells
- Removes unreachable cells to clean up generation
- Ensures no inaccessible areas exist

**Cluster Management**:
- Detects overly dense 3x3 room clusters
- Removes clusters that make dungeons feel cramped
- Maintains balance between density and openness

### 6. Wall Calculation

Uses bitflag system to determine wall placement for tile rendering.

**RoomFlags** (Bitflags):
- `NONE` (0): No connections
- `TOP` (1): Connection upward
- `RIGHT` (2): Connection right
- `BOTTOM` (4): Connection downward
- `LEFT` (8): Connection left
- Combinations: e.g., `TOP | LEFT` (9) for corner room

**Wall Generation**:
- Checks all four cardinal directions from each cell
- Sets bitflag for each open direction
- Used by tile renderer to select appropriate wall/floor tiles

### 7. Tile Rendering

**Multi-Layer System**:
- Supports multiple tile layers (default 4 layers)
- Each layer can contain different tile data
- Enables floor, walls, decorations, and overlay separation

**Tile Segments**:
The system uses 13 pre-designed tile segments loaded from meta TMX files:
1. Floor tiles
2. Wall Top
3. Wall Bottom
4. Wall Left
5. Wall Right
6. Inner Corner Top-Left
7. Inner Corner Top-Right
8. Inner Corner Bottom-Left
9. Inner Corner Bottom-Right
10. Outer Corner Top-Left
11. Outer Corner Top-Right
12. Outer Corner Bottom-Left
13. Outer Corner Bottom-Right

**Rendering Process**:
1. Load tile templates from meta TMX file
2. For each dungeon cell, determine wall bitflags
3. Select appropriate tile segments based on flags
4. Combine segments into final room layout
5. Apply to each tile layer
6. Encode with base64 + zlib compression

### 8. TMX Output Generation

**Format Specifications**:
- TMX version 1.10, Tiled version 1.11.1
- Orthogonal orientation
- Right-down render order
- 16x16 pixel tile dimensions
- Base64 + zlib data encoding
- External tileset references

**Supported Tilesets**:
- System tileset (16x16)
- Domhan floors (16x16)
- Domhan forest (16x16)
- Domhan forest doodads (16x16)

**Output Files**:
- `.tmx` - Map file with layer data
- `.tsx` - Referenced tileset definitions
- `.png` - Tileset graphics (referenced, not generated)

### 9. Retry Mechanism

**Failure Handling**:
- Maximum 10 generation attempts
- Retries if constraints cannot be satisfied
- Tracks iteration count for debugging
- Throws error after max retries exceeded

**Common Retry Scenarios**:
- Cannot place required number of boss rooms
- Insufficient space for keys
- Unable to create hallway connections
- Boss room too close to start

### 10. Randomization

**Seeded Random**:
- Uses configurable seed for reproducibility
- Same seed produces identical dungeon
- Enables testing and debugging specific layouts

**Random Operations**:
- Room placement positions
- Boss room selection
- Giant room conversion
- Chest and monster placement
- Start position within padded area

## Configurable Parameters

The generation system exposes these configuration options:

- Grid width and height (minimum 5x5)
- Number of boss rooms
- Maximum room density percentage
- Giant room percentage
- Number of chests
- Number of monster chokes
- Start position padding
- Boss distance constraints
- Tile layer count
- Meta tileset source file
- Output file path

## Output Capabilities

The generator produces:

1. **Console Visualization**: ASCII grid representation for debugging
2. **TMX Map Files**: Industry-standard Tiled format
3. **Multi-Layer Support**: Separate layers for different visual elements
4. **Compressed Data**: Efficient storage using zlib
5. **External References**: Links to reusable tileset files
