# Business Requirements

This document outlines the business rules, constraints, and requirements that govern the Dungen dungeon generator.

## Functional Requirements

### FR-1: Grid-Based Generation

**Requirement**: The system must generate dungeons on a rectangular grid.

**Rules**:
- Minimum grid size: 5×5 cells
- Maximum grid size: Limited only by memory/performance
- Each cell represents 16×16 tiles in output
- Grid uses 0-indexed coordinates: `grid[y][x]`

**Rationale**: Grid-based generation enables algorithmic room placement and pathfinding.

### FR-2: Start Position

**Requirement**: Each dungeon must have exactly one start position where the player spawns.

**Rules**:
- Must be placed in bottom 40% of map
- Minimum 2-cell padding from map edges
- Marked with cell type 'S'
- Always reachable (by definition, as origin of reachability checks)

**Rationale**: Bottom spawn creates upward progression, padding prevents edge-of-map spawns.

### FR-3: Boss Rooms

**Requirement**: The system must place configurable number of boss encounter rooms.

**Rules**:
- Boss count must be ≥ 0
- Each boss requires adjacent pre-room for key placement
- Minimum distance from start position (configurable, prevents early boss encounters)
- Minimum distance between bosses (prevents clustering)
- Marked with cell type 'B'

**Validation**:
- If boss cannot be placed after 1000 attempts, generation fails
- Boss count must match key count

**Rationale**: Bosses provide difficulty peaks; spacing ensures progression pacing.

### FR-4: Boss Pre-Cells

**Requirement**: Each boss room must have exactly one adjacent room designated for progression.

**Rules**:
- Must be adjacent (not diagonal) to boss room
- Chosen randomly from available empty neighbors
- Becomes regular room type 'R'
- Used to ensure keys can be placed near bosses

**Validation**:
- If boss has no empty neighbor, generation fails

**Rationale**: Ensures progression structure (key → pre-room → boss).

### FR-5: Regular Rooms

**Requirement**: The system must place regular dungeon rooms up to a maximum density.

**Rules**:
- Maximum room count = `grid_size × max_room_percentage` (default 20%)
- Must not be lonely (must have ≥1 occupied neighbor)
- Placement uses randomized cell order (shuffled)
- Marked with cell type 'R'

**Validation**:
- Anti-lonely rule prevents isolated single rooms
- Actual count may be less than maximum if cells don't meet criteria

**Rationale**: Density limit prevents overcrowding; anti-lonely prevents odd isolated rooms.

### FR-6: Giant Rooms

**Requirement**: The system may create 2×2 "giant" room clusters for variety.

**Rules**:
- Maximum giant count = `grid_size × max_giant_percentage / 4` (default 10%)
- Must find 2×2 block of adjacent regular rooms
- Logically remains 4 separate cells, rendered as single large room
- Maximum 1000 placement attempts

**Validation**:
- All 4 cells must be type 'R' (regular room)
- Giant rooms are aesthetic, not required for valid dungeon

**Rationale**: Adds visual variety and larger combat spaces.

### FR-7: Hallway Connectivity

**Requirement**: All dungeon rooms must be reachable from the start position.

**Rules**:
- Use Depth-First Search (DFS) to find reachable cells from start
- For each unreachable occupied cell:
  - Find nearest reachable cell using BFS
  - Create hallway path using A* pathfinding
  - Place hallway cells (type 'H') along path
- Repeat until no unreachable cells remain
- Maximum 100 connectivity iterations

**Validation**:
- After hallway generation, run final DFS
- Remove any cells still unreachable
- If start position becomes unreachable, generation fails (should never happen)

**Rationale**: Playability requires all rooms accessible; no dead isolated areas.

### FR-8: Cluster Removal

**Requirement**: The system must remove overly dense 3×3 room clusters.

**Rules**:
- If all 9 cells in 3×3 area are occupied, remove center cell
- Run after hallway generation but before element placement
- Improves dungeon flow and reduces cramped feeling

**Rationale**: Prevents excessively dense areas that feel maze-like.

### FR-9: Chest Placement

**Requirement**: The system must place treasure chests in strategic locations.

**Rules**:
- Configurable chest count
- Must be placed in deadends (rooms with exactly 1 connection)
- Minimum distance from start (rewards exploration)
- Only placed in regular rooms (type 'R' → 'C')
- If insufficient deadends exist, place fewer chests

**Validation**:
- Deadend detection: count occupied neighbors, must equal 1
- Distance check uses Manhattan distance

**Rationale**: Deadend placement rewards thorough exploration of branches.

### FR-10: Monster Choke Points

**Requirement**: The system must place monster encounters in corridor chokepoints.

**Rules**:
- Configurable monster count
- Must be placed in corridors (hallways with exactly 2 connections)
- Only placed in hallway cells (type 'H' → 'M')
- If insufficient corridors exist, place fewer monsters

**Validation**:
- Corridor detection: count occupied neighbors, must equal 2
- Only applies to hallway cells, not rooms

**Rationale**: Corridor monsters create unavoidable tactical encounters.

### FR-11: Key Placement

**Requirement**: The system must place keys equal to the number of boss rooms.

**Rules**:
- Key count must equal boss count
- Must be placed in regular rooms (type 'R' → 'K')
- Random selection from available regular rooms
- If insufficient regular rooms, generation fails

**Validation**:
- Boss count = Key count (enforced)
- Keys cannot be in hallways, deadends, or special rooms

**Rationale**: Keys enable boss progression; one key per boss ensures gating.

### FR-12: Locked Doors (Future/Optional)

**Requirement**: The system supports locked door cells between areas.

**Rules**:
- Marked with cell type 'L'
- Intended to gate access to boss rooms
- Currently not automatically placed by generation logic

**Status**: Placeholder for future implementation

### FR-13: Wall Calculation

**Requirement**: Each occupied cell must calculate directional wall flags for rendering.

**Rules**:
- Check all 4 cardinal directions (top, right, bottom, left)
- If neighbor in direction is occupied, set flag for that direction
- Use bitflag enumeration (RoomFlags)
- Walls stored as integer bitfield on GenCell.walls

**Bitflag Values**:
- NONE: 0 (isolated room, walls on all sides)
- TOP: 1 (open upward)
- RIGHT: 2 (open right)
- BOTTOM: 4 (open down)
- LEFT: 8 (open left)

**Rationale**: Wall flags drive tile rendering logic for visual representation.

## Output Requirements

### OR-1: TMX Format Compliance

**Requirement**: Output must be valid Tiled Map Editor TMX format.

**Rules**:
- XML structure conforming to TMX schema
- Version 1.10, Tiled version 1.11.1 compatibility
- Orthogonal orientation
- Right-down render order
- UTF-8 encoding

**Validation**:
- Must open in Tiled Map Editor without errors

### OR-2: Tile Dimensions

**Requirement**: Output maps must use 16×16 pixel tiles.

**Rules**:
- Each dungeon cell = 16×16 tiles
- 30×30 cell dungeon = 480×480 tile map
- Tile dimensions: `tilewidth="16" tileheight="16"`

**Rationale**: Matches standard Tiled tileset format.

### OR-3: Layer Support

**Requirement**: Output must support multiple tile layers.

**Rules**:
- Configurable layer count (default 4)
- Layers named: Layer1, Layer2, Layer3, Layer4
- Each layer has independent tile data
- All layers same dimensions (width × height tiles)

**Purpose**:
- Layer 1: Floor tiles
- Layer 2: Wall tiles
- Layer 3: Decorations
- Layer 4: Overlays/effects

### OR-4: Tileset References

**Requirement**: Output must reference external tileset files.

**Rules**:
- Use `<tileset>` XML elements with `source` attribute
- FirstGID values must not overlap:
  - system.tsx: firstgid="1" (1-1024)
  - domhan_floors.tsx: firstgid="1025" (1025-2048)
  - domhan_forest.tsx: firstgid="2049" (2049-3072)
  - domhan_forest_doodads.tsx: firstgid="3073" (3073+)
- Tileset files must exist in same directory or relative path

**Validation**:
- Tiled must be able to resolve tileset references

### OR-5: Data Encoding

**Requirement**: Layer tile data must be encoded efficiently.

**Rules**:
- Encoding: base64
- Compression: zlib (deflate)
- Tile GIDs as 32-bit little-endian unsigned integers
- XML format: `<data encoding="base64" compression="zlib">...</data>`

**Process**:
1. Flatten 2D tile array to 1D (row-major order)
2. Convert to 32-bit LE bytes
3. Compress with zlib.deflate
4. Encode to base64 string
5. Embed in `<data>` element

**Rationale**: Compression reduces file size significantly for large maps.

### OR-6: File Output

**Requirement**: Generated TMX files must be written to disk.

**Rules**:
- Output directory must exist or be created
- File extension: `.tmx`
- UTF-8 text encoding
- Overwrite existing files without warning

**Default Paths**:
- Output directory: `/home/user/dungen/out/`
- File naming: configurable (default: `test.tmx`)

## Validation Requirements

### VR-1: Minimum Grid Size

**Rule**: Grid must be at least 5×5 cells.

**Enforcement**: Constructor validation throws error if width < 5 or height < 5.

**Rationale**: Smaller grids cannot support boss placement with distance constraints.

### VR-2: Boss Placement Feasibility

**Rule**: Must successfully place all requested boss rooms.

**Enforcement**:
- Maximum 1000 placement attempts
- If unsuccessful, throw error: "Cannot place required bosses"

**Conditions for Failure**:
- Too many bosses for map size
- Distance constraints too restrictive
- Insufficient empty cells

### VR-3: Boss Pre-Cell Availability

**Rule**: Each boss must have at least one adjacent empty cell.

**Enforcement**: After boss placement, validate neighbors exist.

**Error**: "Boss has no empty neighbor for pre-cell"

### VR-4: Key Count Matching

**Rule**: Number of keys must equal number of bosses.

**Enforcement**: Key placement uses boss count as target.

**Validation**: If insufficient regular rooms for keys, generation fails.

### VR-5: Connectivity Guarantee

**Rule**: All occupied cells must be reachable from start.

**Enforcement**:
- Run DFS after hallway generation
- Remove unreachable cells
- Validate start is still occupied

**Fallback**: Unreachable cells converted to empty ('X').

### VR-6: Maximum Retry Limit

**Rule**: Generation must complete within 10 retry attempts.

**Enforcement**: Outer retry loop in main.ts

**Error**: "Failed to generate after 10 attempts"

**Retry Triggers**:
- Boss placement failure
- Connectivity validation failure
- Insufficient cells for required elements

## Configurable Parameters

### Grid Configuration
- **Width**: Grid width (≥5, default varies)
- **Height**: Grid height (≥5, default varies)

### Room Configuration
- **Max Room Percentage**: Maximum density of regular rooms (0.0-1.0, default 0.2)
- **Max Giant Percentage**: Maximum percentage for giant rooms (0.0-1.0, default 0.1)

### Boss Configuration
- **Boss Count**: Number of boss rooms (≥0, default varies)
- **Boss Min Distance from Start**: Minimum Manhattan distance (default varies)
- **Boss Min Distance Between**: Minimum distance between bosses (default varies)

### Element Configuration
- **Chest Count**: Number of treasure chests (≥0, default varies)
- **Monster Choke Count**: Number of monster encounters (≥0, default varies)

### Start Configuration
- **Start Padding**: Edge padding for start position (default 2)

### Output Configuration
- **Layer Count**: Number of tile layers (≥1, default 4)
- **Meta Tileset Path**: Path to meta TMX template file
- **Output File Path**: Destination TMX file path

### Generation Configuration
- **Random Seed**: Seed for reproducible generation
- **Max Placement Attempts**: Maximum attempts for boss/giant placement (default 1000)
- **Max Connectivity Iterations**: Maximum hallway generation loops (default 100)
- **Max Retries**: Maximum full generation retries (default 10)

## Quality Requirements

### QR-1: Playability

**Requirement**: Generated dungeons must be completable.

**Criteria**:
- Start position exists and is reachable
- All boss rooms reachable from start
- Sufficient keys to access all bosses
- No impossible progression gates

**Validation**: Connectivity checks ensure reachability.

### QR-2: Variability

**Requirement**: Each generation should produce unique layouts.

**Implementation**:
- Randomized room placement
- Shuffled cell order
- Random neighbor selection
- Different seeds produce different dungeons

**Measurement**: Visual inspection of multiple generations.

### QR-3: Fairness

**Requirement**: Dungeons should not be trivially easy or impossibly hard.

**Balancing**:
- Boss distance from start prevents immediate encounters
- Key placement requires exploration
- Deadend chests reward thorough searching
- Monster chokes create combat challenges

**Tuning**: Configuration parameters allow difficulty adjustment.

### QR-4: Performance

**Requirement**: Generation must complete in reasonable time.

**Targets**:
- 30×30 map: < 5 seconds (typical)
- 100×100 map: < 30 seconds (stress test)

**Optimization**: Retry limits prevent infinite loops.

### QR-5: Correctness

**Requirement**: Output must be valid and loadable.

**Validation**:
- TMX XML validates against schema
- Tiled Map Editor can open files
- Tile GIDs reference valid tileset ranges
- All layers have correct dimensions

## Reproducibility Requirements

### RR-1: Seed-Based Generation

**Requirement**: Same seed must produce identical dungeon.

**Implementation**: Random number generator initialized with seed.

**Use Cases**:
- Debugging specific layouts
- Sharing dungeon configurations
- Regression testing

### RR-2: Deterministic Algorithms

**Requirement**: Generation logic must be deterministic given same seed.

**Constraints**:
- No system time dependencies
- No external random sources
- Shuffle uses seeded random
- Placement order consistent

**Testing**: Generate same dungeon twice with same seed, verify identical output.

## Error Handling Requirements

### ER-1: Graceful Failure

**Requirement**: System must fail gracefully with clear error messages.

**Error Scenarios**:
1. Invalid grid size: "Grid must be at least 5×5"
2. Boss placement failure: "Cannot place required bosses after N attempts"
3. Missing pre-cell: "Boss has no empty neighbor for pre-cell"
4. Connectivity failure: "Cannot ensure connectivity after N iterations"
5. File I/O error: "Failed to write TMX file: <path>"

### ER-2: Retry Mechanism

**Requirement**: Transient failures should trigger automatic retry.

**Rules**:
- Maximum 10 full generation retries
- Each retry uses same configuration but potentially different random outcomes
- Log retry attempts for debugging

**Final Failure**: After max retries, throw error to caller.

## Documentation Requirements

### DR-1: Code Comments

**Requirement**: Complex algorithms must be commented.

**Standards**:
- Function-level JSDoc for public methods
- Inline comments for non-obvious logic
- Algorithm explanations for DFS/BFS/A*

### DR-2: Console Output

**Requirement**: Generation progress should be visible.

**Output**:
- ASCII grid visualization
- Cell type legend
- Generation statistics (room count, hallway count, etc.)
- Error messages

**Format**: Human-readable text suitable for debugging.
