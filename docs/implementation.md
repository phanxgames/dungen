# Implementation Details

This document provides deep technical details about the implementation of the Dungen dungeon generator.

## Generation Algorithm Details

### Grid Initialization

```typescript
// Create 2D grid with GenCell objects
grid: GenCell[][] = []
for (y = 0; y < height; y++) {
  grid[y] = []
  for (x = 0; x < width; x++) {
    grid[y][x] = new GenCell(x, y, 'X') // Empty cell
  }
}
```

**Grid Structure**:
- 2D array indexed as `grid[y][x]`
- Y-axis increases downward (screen coordinates)
- X-axis increases rightward
- All cells initialized to 'X' (empty)

### Start Position Placement

**Algorithm**:
```typescript
placeStart() {
  const padding = 2
  const bottomSection = this.height * 0.6 // Bottom 40% of map

  const y = rand(bottomSection, this.height - padding)
  const x = rand(padding, this.width - padding)

  this.grid[y][x].value = 'S'
  this.startPos = { x, y }
}
```

**Constraints**:
- Spawns in bottom 40% of map (easier difficulty curve)
- 2-cell padding from edges
- Single start position per dungeon

### Boss Room Placement

**Algorithm**:
```typescript
placeBosses(count: number, minDistFromStart: number, minDistBetweenBosses: number) {
  let placed = 0
  let attempts = 0
  const maxAttempts = 1000

  while (placed < count && attempts < maxAttempts) {
    const x = rand(1, width - 2)
    const y = rand(1, height - 2)

    // Check cell is empty
    if (grid[y][x].value !== 'X') continue

    // Check distance from start
    const distToStart = manhattanDistance(startPos, {x, y})
    if (distToStart < minDistFromStart) continue

    // Check distance from other bosses
    let tooClose = false
    for (const boss of bosses) {
      const dist = manhattanDistance(boss, {x, y})
      if (dist < minDistBetweenBosses) {
        tooClose = true
        break
      }
    }
    if (tooClose) continue

    // Check has adjacent empty cell for pre-room
    if (!hasAdjacentEmpty(x, y)) continue

    // Place boss
    grid[y][x].value = 'B'
    bosses.push({x, y})
    placed++

    attempts++
  }

  if (placed < count) throw new Error("Cannot place required bosses")
}
```

**Key Constraints**:
- Must have adjacent empty cell for key placement
- Minimum Manhattan distance from start
- Minimum distance from other bosses
- Maximum 1000 placement attempts before failure

### Boss Pre-Cell Placement

**Purpose**: Place rooms adjacent to boss rooms to hold keys.

```typescript
placeBossPreCells() {
  for (const boss of bosses) {
    const neighbors = getEmptyNeighbors(boss.x, boss.y)
    if (neighbors.length === 0) {
      throw new Error("Boss has no empty neighbor for pre-cell")
    }

    const preCell = neighbors[rand(0, neighbors.length - 1)]
    grid[preCell.y][preCell.x].value = 'R'
    bossPreCells.push(preCell)
  }
}
```

**Result**: Each boss has exactly one adjacent room for progression.

### Random Room Placement

**Algorithm**:
```typescript
placeRandomRooms(maxRoomPercent: number) {
  const totalCells = width * height
  const maxRooms = Math.floor(totalCells * maxRoomPercent)

  // Get all empty cells
  const emptyCells = []
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      if (grid[y][x].value === 'X') {
        emptyCells.push({x, y})
      }
    }
  }

  shuffle(emptyCells) // Fisher-Yates shuffle

  let placed = 0
  for (const cell of emptyCells) {
    if (placed >= maxRooms) break

    // Check not lonely (has at least one occupied neighbor)
    if (!hasOccupiedNeighbor(cell.x, cell.y)) continue

    grid[cell.y][cell.x].value = 'R'
    placed++
  }
}
```

**Anti-Lonely Rule**: Rooms must have at least one occupied neighbor to prevent isolated single rooms.

### Giant Room Creation

**Algorithm**:
```typescript
placeGiantRooms(maxGiantPercent: number) {
  const maxGiants = Math.floor((width * height) * maxGiantPercent / 4) // Each giant is 4 cells

  let placed = 0
  let attempts = 0

  while (placed < maxGiants && attempts < 1000) {
    const x = rand(0, width - 2)
    const y = rand(0, height - 2)

    // Check all 4 cells are regular rooms
    if (grid[y][x].value === 'R' &&
        grid[y][x+1].value === 'R' &&
        grid[y+1][x].value === 'R' &&
        grid[y+1][x+1].value === 'R') {

      // Convert to giant room (keep as 'R', handled visually)
      placed++
    }

    attempts++
  }
}
```

**Note**: Giant rooms are logically 4 adjacent 'R' cells, rendered as single large room.

### Hallway Generation

**Purpose**: Connect all isolated room clusters.

**Algorithm**:
```typescript
generateHallways() {
  let iteration = 0
  const maxIterations = 100

  while (iteration < maxIterations) {
    // Find all reachable cells from start
    const reachable = dfsFrom(grid, startPos)

    // Find unreachable occupied cells
    const unreachable = findUnreachable(grid, reachable)

    if (unreachable.length === 0) break // All connected

    // For each unreachable cell, create hallway to nearest reachable
    for (const isolated of unreachable) {
      const nearest = bfsToNearest(grid, isolated, cell => reachable.has(cell))

      if (nearest) {
        const path = astar.findPath(isolated, nearest, grid)

        // Place hallway cells
        for (const {x, y} of path) {
          if (grid[y][x].value === 'X') {
            grid[y][x].value = 'H'
          }
        }
      }
    }

    iteration++
  }
}
```

**Pathfinding Strategy**:
1. Use DFS to identify reachable region
2. Use BFS to find nearest reachable cell from isolated room
3. Use A* to create optimal hallway path
4. Repeat until no unreachable cells remain

### Connectivity Validation

**DFS Implementation**:
```typescript
dfsFrom(grid: GenCell[][], start: {x, y}): Set<string> {
  const visited = new Set<string>()
  const stack = [start]

  while (stack.length > 0) {
    const current = stack.pop()
    const key = `${current.x},${current.y}`

    if (visited.has(key)) continue
    visited.add(key)

    // Add all occupied neighbors
    const neighbors = getOccupiedNeighbors(current.x, current.y)
    for (const neighbor of neighbors) {
      stack.push(neighbor)
    }
  }

  return visited
}
```

**Cleanup**:
```typescript
// Remove unreachable cells
for (y = 0; y < height; y++) {
  for (x = 0; x < width; x++) {
    const key = `${x},${y}`
    if (!reachable.has(key) && grid[y][x].value !== 'X') {
      grid[y][x].value = 'X' // Clear unreachable cell
    }
  }
}
```

### Cluster Removal

**Purpose**: Remove overly dense 3x3 room clusters.

```typescript
removeClusters() {
  for (y = 1; y < height - 1; y++) {
    for (x = 1; x < width - 1; x++) {
      // Check if center and all 8 neighbors are occupied
      let count = 0
      for (dy = -1; dy <= 1; dy++) {
        for (dx = -1; dx <= 1; dx++) {
          if (grid[y+dy][x+dx].value !== 'X') count++
        }
      }

      if (count === 9) {
        // Remove center cell
        grid[y][x].value = 'X'
      }
    }
  }
}
```

### Chest Placement

**Algorithm**:
```typescript
placeChests(count: number, minDistFromStart: number) {
  // Find all deadends (cells with exactly 1 neighbor)
  const deadends = []
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      if (grid[y][x].value !== 'R') continue

      const neighbors = getOccupiedNeighbors(x, y)
      if (neighbors.length === 1) {
        deadends.push({x, y})
      }
    }
  }

  // Filter by distance from start
  const validDeadends = deadends.filter(d => {
    const dist = manhattanDistance(startPos, d)
    return dist >= minDistFromStart
  })

  // Place chests
  shuffle(validDeadends)
  for (let i = 0; i < Math.min(count, validDeadends.length); i++) {
    const pos = validDeadends[i]
    grid[pos.y][pos.x].value = 'C'
  }
}
```

**Deadend Detection**: Count occupied neighbors; if exactly 1, it's a deadend.

### Monster Choke Placement

**Algorithm**:
```typescript
placeMonsterChokes(count: number) {
  // Find all corridor cells (hallways with exactly 2 neighbors)
  const corridors = []
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      if (grid[y][x].value !== 'H') continue

      const neighbors = getOccupiedNeighbors(x, y)
      if (neighbors.length === 2) {
        corridors.push({x, y})
      }
    }
  }

  shuffle(corridors)
  for (let i = 0; i < Math.min(count, corridors.length); i++) {
    const pos = corridors[i]
    grid[pos.y][pos.x].value = 'M'
  }
}
```

**Corridor Detection**: Exactly 2 occupied neighbors indicates corridor.

### Key Placement

**Algorithm**:
```typescript
placeKeys(count: number) {
  // Find all regular rooms
  const rooms = []
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      if (grid[y][x].value === 'R') {
        rooms.push({x, y})
      }
    }
  }

  shuffle(rooms)
  for (let i = 0; i < Math.min(count, rooms.length); i++) {
    const pos = rooms[i]
    grid[pos.y][pos.x].value = 'K'
  }
}
```

**Constraint**: Keys only placed in regular rooms, not hallways or special cells.

### Wall Calculation

**Algorithm**:
```typescript
calculateWalls() {
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      const cell = grid[y][x]
      if (cell.value === 'X') continue

      let walls = RoomFlags.NONE

      // Check top
      if (y > 0 && grid[y-1][x].value !== 'X') {
        walls |= RoomFlags.TOP
      }

      // Check right
      if (x < width-1 && grid[y][x+1].value !== 'X') {
        walls |= RoomFlags.RIGHT
      }

      // Check bottom
      if (y < height-1 && grid[y+1][x].value !== 'X') {
        walls |= RoomFlags.BOTTOM
      }

      // Check left
      if (x > 0 && grid[y][x-1].value !== 'X') {
        walls |= RoomFlags.LEFT
      }

      cell.walls = walls
    }
  }
}
```

**Bitflag Result Examples**:
- Isolated room: `0000` (no connections)
- Horizontal corridor: `0101` (TOP | BOTTOM)
- Vertical corridor: `1010` (LEFT | RIGHT)
- Corner: `1001` (TOP | LEFT)
- T-junction: `1011` (TOP | LEFT | RIGHT)
- Cross: `1111` (all directions)

## Tile Rendering Implementation

### Meta TMX Loading

**File Structure**:
```
meta_forest.tmx contains:
- Layer "floor" with floor tiles
- Layer "wall_top" with top wall segment
- Layer "wall_bottom" with bottom wall segment
... (13 total segment layers)
```

**Loading Process**:
```typescript
async load(filepath: string) {
  const tmx = await tmxParser.parse(filepath)

  this.segments = {}

  for (const layer of tmx.layers) {
    const segmentName = layer.name // e.g., "floor", "wall_top"
    const layerData = layer.tiles // 2D array of tile GIDs

    this.segments[segmentName] = layerData
  }
}
```

### Room Rendering

**Segment Selection Logic**:
```typescript
renderToLayers(wallFlags: number, layerCount: number): TiledLayer[] {
  const layers = []

  for (let i = 0; i < layerCount; i++) {
    layers[i] = new TiledLayer(16, 16) // 16x16 tiles per room
  }

  // Always apply floor
  applySegment(layers, this.meta.getSegment('floor'))

  // Apply walls based on flags
  if (!(wallFlags & RoomFlags.TOP)) {
    applySegment(layers, this.meta.getSegment('wall_top'))
  }
  if (!(wallFlags & RoomFlags.BOTTOM)) {
    applySegment(layers, this.meta.getSegment('wall_bottom'))
  }
  if (!(wallFlags & RoomFlags.LEFT)) {
    applySegment(layers, this.meta.getSegment('wall_left'))
  }
  if (!(wallFlags & RoomFlags.RIGHT)) {
    applySegment(layers, this.meta.getSegment('wall_right'))
  }

  // Apply corners
  if (!(wallFlags & RoomFlags.TOP) && !(wallFlags & RoomFlags.LEFT)) {
    applySegment(layers, this.meta.getSegment('inner_corner_tl'))
  }
  // ... (all 8 corner combinations)

  return layers
}
```

**Segment Application**:
```typescript
applySegment(targetLayers: TiledLayer[], segmentData: number[][][]) {
  // segmentData[layerIndex][y][x] = tile GID

  for (let layerIdx = 0; layerIdx < segmentData.length; layerIdx++) {
    const layer = targetLayers[layerIdx]
    const segment = segmentData[layerIdx]

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const gid = segment[y][x]
        if (gid !== 0) { // 0 = empty tile
          layer.setTile(x, y, gid)
        }
      }
    }
  }
}
```

### Layer Encoding

**Base64 + Zlib Compression**:
```typescript
encode(): string {
  // Flatten 2D array to 1D
  const flat = []
  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {
      flat.push(this.data[y][x])
    }
  }

  // Convert to 32-bit little-endian bytes
  const buffer = Buffer.alloc(flat.length * 4)
  for (let i = 0; i < flat.length; i++) {
    buffer.writeUInt32LE(flat[i], i * 4)
  }

  // Compress with zlib
  const compressed = zlib.deflateSync(buffer)

  // Encode to base64
  const base64 = compressed.toString('base64')

  return base64
}
```

**Decoding Process** (by Tiled):
1. Base64 decode to bytes
2. Zlib decompress to raw bytes
3. Read as 32-bit little-endian integers (tile GIDs)
4. Reshape to 2D array

### TMX XML Generation

**Structure**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<map version="1.10" tiledversion="1.11.1" orientation="orthogonal"
     renderorder="right-down" width="480" height="480"
     tilewidth="16" tileheight="16">

  <tileset firstgid="1" source="system.tsx"/>
  <tileset firstgid="1025" source="domhan_floors.tsx"/>
  <tileset firstgid="2049" source="domhan_forest.tsx"/>
  <tileset firstgid="3073" source="domhan_forest_doodads.tsx"/>

  <layer name="Layer1" width="480" height="480">
    <data encoding="base64" compression="zlib">
      eJzt... (base64 data)
    </data>
  </layer>

  <layer name="Layer2" width="480" height="480">
    <data encoding="base64" compression="zlib">
      eJzt... (base64 data)
    </data>
  </layer>

  <!-- Additional layers -->
</map>
```

## Utility Implementations

### Fisher-Yates Shuffle

```typescript
shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = rand(0, i)
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}
```

### Manhattan Distance

```typescript
manhattanDistance(a: {x, y}, b: {x, y}): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}
```

### BFS to Nearest

```typescript
bfsToNearest(grid: GenCell[][], start: {x, y}, predicate: (cell) => boolean) {
  const queue = [start]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const current = queue.shift()
    const key = `${current.x},${current.y}`

    if (visited.has(key)) continue
    visited.add(key)

    if (predicate(grid[current.y][current.x])) {
      return current // Found target
    }

    // Add neighbors
    const neighbors = getOccupiedNeighbors(current.x, current.y)
    queue.push(...neighbors)
  }

  return null // Not found
}
```

## Performance Characteristics

### Time Complexity

- **Grid Initialization**: O(w × h)
- **Start Placement**: O(1)
- **Boss Placement**: O(attempts) ≤ O(1000)
- **Random Rooms**: O(w × h) for cell iteration + O(n log n) for shuffle
- **Giant Rooms**: O(attempts) ≤ O(1000)
- **Hallway Generation**: O(iterations × unreachable × (DFS + BFS + A*))
  - DFS: O(w × h)
  - BFS: O(w × h)
  - A*: O(w × h × log(w × h))
- **Connectivity Validation**: O(w × h)
- **Chest/Monster/Key Placement**: O(w × h) for finding candidates
- **Wall Calculation**: O(w × h)
- **Tile Rendering**: O(w × h × 16 × 16 × layers)
- **Total**: O(w × h × layers) dominated by rendering

### Space Complexity

- **Grid Storage**: O(w × h) for GenCell objects
- **Tile Data**: O(w × h × 16 × 16 × layers) for final map
- **Pathfinding**: O(w × h) for A* open/closed lists
- **Total**: O(w × h × layers) for output

### Optimization Opportunities

1. **Spatial Indexing**: Use quadtree for boss placement distance checks
2. **Early Termination**: Stop hallway generation if connectivity threshold met
3. **Lazy Rendering**: Only render visible portions of large maps
4. **Incremental Compression**: Stream encode layers instead of bulk encoding
