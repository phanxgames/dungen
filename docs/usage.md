# Usage Guide

This guide explains how to use the Dungen dungeon generator.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- TypeScript (installed via npm)

### Setup

1. Clone or download the repository:
```bash
cd /home/user/dungen
```

2. Install dependencies:
```bash
npm install
```

3. Compile TypeScript:
```bash
npm run build
# or
tsc
```

## Basic Usage

### Running the Generator

Execute the compiled main.ts file:

```bash
node dist/main.js
```

This will generate a dungeon using the default configuration and output it to `out/test.tmx`.

### Viewing the Output

1. Open Tiled Map Editor (https://www.mapeditor.org/)
2. Open the generated TMX file: `File → Open → /home/user/dungen/out/test.tmx`
3. View the multi-layered dungeon map

## Configuration

### Editing main.ts

The primary way to configure generation is by editing `src/main.ts`:

```typescript
import { GenMap } from './GenMap';
import { TiledMeta } from './TiledMeta';

async function main() {
  // Load tile templates
  const meta = new TiledMeta();
  await meta.load('/home/user/dungen/out/meta_forest.tmx');

  // Create generator with seed and dimensions
  const seed = Date.now(); // or use specific seed for reproducibility
  const width = 30;  // Grid width
  const height = 30; // Grid height

  const gen = new GenMap(seed, width, height, {
    maxRoomPercent: 0.2,      // 20% max room density
    maxGiantPercent: 0.1,     // 10% max giant rooms
    bossCount: 3,             // 3 boss encounters
    bossMinDistFromStart: 8,  // Bosses at least 8 cells from start
    bossMinDistBetween: 5,    // Bosses at least 5 cells apart
    chestCount: 5,            // 5 treasure chests
    monsterChokeCount: 3,     // 3 monster chokes
    layerCount: 4             // 4 tile layers
  });

  // Generate dungeon
  gen.generate();

  // Output to TMX
  gen.outputToTiled(meta, '/home/user/dungen/out/test.tmx');

  console.log('Dungeon generated successfully!');
}

main().catch(console.error);
```

### Configuration Parameters

#### Grid Settings

**width** (number, ≥5)
- Grid width in cells
- Each cell = 16×16 tiles
- Larger = bigger dungeons

**height** (number, ≥5)
- Grid height in cells
- Minimum 5×5 for boss placement

#### Room Settings

**maxRoomPercent** (number, 0.0-1.0, default 0.2)
- Maximum percentage of grid filled with regular rooms
- 0.2 = 20% of cells can be rooms
- Higher = denser dungeons

**maxGiantPercent** (number, 0.0-1.0, default 0.1)
- Maximum percentage for 2×2 giant rooms
- 0.1 = up to 10% of grid as giant rooms
- Higher = more variety

#### Boss Settings

**bossCount** (number, ≥0, default varies)
- Number of boss encounter rooms
- Each boss requires adjacent pre-room
- More bosses = longer progression

**bossMinDistFromStart** (number, ≥0, default 8)
- Minimum Manhattan distance from start to boss
- Higher = bosses further from spawn
- Prevents early boss encounters

**bossMinDistBetween** (number, ≥0, default 5)
- Minimum distance between boss rooms
- Higher = more spread out bosses
- Prevents boss clustering

#### Element Settings

**chestCount** (number, ≥0, default varies)
- Number of treasure chests to place
- Placed in deadends far from start
- More chests = more rewards

**monsterChokeCount** (number, ≥0, default varies)
- Number of monster encounters in corridors
- Placed in 2-connection hallways
- More monsters = more combat

#### Output Settings

**layerCount** (number, ≥1, default 4)
- Number of tile layers in output
- Typical: 4 (floor, walls, decorations, overlay)
- More layers = more visual complexity

### Reproducible Generation

Use a specific seed to generate the same dungeon repeatedly:

```typescript
const seed = 12345; // Fixed seed
const gen = new GenMap(seed, 20, 20, settings);
gen.generate();
```

Same seed + same settings = identical dungeon every time.

## Creating Custom Tile Themes

### Meta TMX Structure

The generator requires a "meta" TMX file containing tile segment templates. Create your own theme:

1. Open Tiled Map Editor
2. Create new map: 16×16 tiles (one dungeon cell)
3. Create layers for each segment:
   - `floor` - Floor tiles for open areas
   - `wall_top` - Top wall tiles
   - `wall_bottom` - Bottom wall tiles
   - `wall_left` - Left wall tiles
   - `wall_right` - Right wall tiles
   - `inner_corner_tl` - Inner top-left corner
   - `inner_corner_tr` - Inner top-right corner
   - `inner_corner_bl` - Inner bottom-left corner
   - `inner_corner_br` - Inner bottom-right corner
   - `outer_corner_tl` - Outer top-left corner
   - `outer_corner_tr` - Outer top-right corner
   - `outer_corner_bl` - Outer bottom-left corner
   - `outer_corner_br` - Outer bottom-right corner

4. Paint tiles in each layer representing that segment
5. Save as `meta_<theme_name>.tmx`
6. Update main.ts to load your meta file:

```typescript
await meta.load('/home/user/dungen/out/meta_<theme_name>.tmx');
```

### Required Tilesets

Ensure your meta TMX references the correct tilesets:
- Place tileset TSX files in the same directory
- Update tileset paths in meta TMX if needed
- Verify firstGID values don't overlap

## Advanced Usage

### Retry Mechanism

Wrap generation in retry loop for difficult configurations:

```typescript
let success = false;
let attempts = 0;
const maxAttempts = 10;

while (!success && attempts < maxAttempts) {
  try {
    const gen = new GenMap(Date.now(), 30, 30, settings);
    gen.generate();
    gen.outputToTiled(meta, '/home/user/dungen/out/test.tmx');
    success = true;
  } catch (error) {
    attempts++;
    console.log(`Attempt ${attempts} failed: ${error.message}`);
  }
}

if (!success) {
  throw new Error('Failed to generate after 10 attempts');
}
```

### Console Visualization

The generator outputs ASCII visualization to console:

```
S = Start
R = Regular Room
B = Boss Room
K = Key Room
C = Chest Room
H = Hallway
M = Monster Choke
L = Locked Door
X = Empty
```

Example output:
```
X X X X X X X X X X
X R H R X X X R X X
X H X H X X H H R X
X R X R H R H K H X
X X X X H X X X H X
X X X X H R H H R X
X X B H H H R X X X
X X X X X X X X X X
X X R H H H C X X X
X X X X X X S X X X
```

### Debugging

#### Enable Detailed Logging

Add console.log statements in GenMap.ts methods:

```typescript
placeStart() {
  console.log(`Placing start at (${x}, ${y})`);
  // ...
}
```

#### Visualize Wall Flags

Print bitflags after wall calculation:

```typescript
calculateWalls() {
  // ... calculation logic
  console.log(`Cell (${x}, ${y}): walls = ${cell.walls.toString(2).padStart(4, '0')}`);
}
```

#### Validate Reachability

After generation, verify all cells:

```typescript
const reachable = Util.dfsFrom(this.grid, this.startPos);
console.log(`Reachable cells: ${reachable.size}`);
```

## Common Issues

### "Cannot place required bosses"

**Cause**: Grid too small or distance constraints too strict.

**Solution**:
- Increase grid size
- Reduce `bossMinDistFromStart`
- Reduce `bossMinDistBetween`
- Reduce `bossCount`

### "Boss has no empty neighbor for pre-cell"

**Cause**: All cells around boss are occupied.

**Solution**:
- Reduce `maxRoomPercent` (less dense rooms)
- Increase grid size
- This is usually a transient error; retry generation

### File Not Found Errors

**Cause**: Meta TMX file or tileset references missing.

**Solution**:
- Verify meta TMX path is correct
- Ensure tileset TSX files exist
- Check relative paths in meta TMX

### Tiled Cannot Open TMX

**Cause**: Invalid TMX XML structure.

**Solution**:
- Check console for generation errors
- Validate XML structure
- Ensure all referenced tilesets exist
- Verify tile GIDs are within tileset ranges

### Empty/Blank Map in Tiled

**Cause**: Tile GIDs incorrect or tilesets not loaded.

**Solution**:
- Verify tileset firstGID values in output TMX
- Ensure tilesets are in same directory or correct path
- Check meta TMX has tile data in segment layers

## Examples

### Small Test Dungeon

```typescript
const gen = new GenMap(12345, 10, 10, {
  maxRoomPercent: 0.15,
  bossCount: 1,
  chestCount: 2,
  monsterChokeCount: 1,
  layerCount: 4
});
gen.generate();
gen.outputToTiled(meta, 'out/small_test.tmx');
```

### Large Complex Dungeon

```typescript
const gen = new GenMap(Date.now(), 50, 50, {
  maxRoomPercent: 0.25,
  maxGiantPercent: 0.15,
  bossCount: 5,
  bossMinDistFromStart: 15,
  bossMinDistBetween: 10,
  chestCount: 12,
  monsterChokeCount: 8,
  layerCount: 4
});
gen.generate();
gen.outputToTiled(meta, 'out/large_dungeon.tmx');
```

### Minimalist Dungeon

```typescript
const gen = new GenMap(999, 15, 15, {
  maxRoomPercent: 0.1, // Very sparse
  maxGiantPercent: 0.0, // No giant rooms
  bossCount: 1,
  chestCount: 1,
  monsterChokeCount: 0,
  layerCount: 2 // Only floor and walls
});
gen.generate();
gen.outputToTiled(meta, 'out/minimalist.tmx');
```

## Integration with Game Engines

### Loading TMX in Game Engines

Most game engines have TMX/Tiled support:

**Unity**: TiledCS, SuperTiled2Unity, Tiled2Unity
**Godot**: Built-in TileMap import
**Phaser**: Phaser.Tilemaps API
**LibGDX**: TiledMap class
**Love2D**: STI (Simple Tiled Implementation)

### Runtime Generation

To generate dungeons at runtime in your game:

1. Include Dungen as npm dependency
2. Bundle with your game build
3. Call generation in game code:

```typescript
import { GenMap } from 'dungen';

function generateLevel(seed: number) {
  const gen = new GenMap(seed, 30, 30, config);
  gen.generate();
  const tmxPath = `levels/level_${seed}.tmx`;
  gen.outputToTiled(meta, tmxPath);
  return tmxPath;
}
```

### JSON Export (Custom)

For custom formats, export grid data instead of TMX:

```typescript
function exportToJSON(gen: GenMap): string {
  const data = {
    width: gen.width,
    height: gen.height,
    cells: gen.grid.map(row =>
      row.map(cell => ({
        x: cell.x,
        y: cell.y,
        type: cell.value,
        walls: cell.walls
      }))
    ),
    start: gen.startPos,
    bosses: gen.bosses
  };
  return JSON.stringify(data, null, 2);
}
```

## Performance Tips

1. **Smaller Grids**: 30×30 generates faster than 100×100
2. **Fewer Bosses**: Reduces placement attempt time
3. **Lower Density**: Less room percentage = faster placement
4. **Reasonable Constraints**: Very strict distance rules slow generation
5. **Limit Retries**: Don't loop forever on impossible configurations

## Next Steps

- Read [Architecture](architecture.md) to understand system design
- Read [Implementation Details](implementation.md) for algorithm specifics
- Read [Business Requirements](business-requirements.md) for rules and constraints
- Experiment with different configurations
- Create custom tile themes
- Integrate with your game project
