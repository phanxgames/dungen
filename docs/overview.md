# Project Overview

## Purpose

**Phanxgames Dungen** is a procedural dungeon generation system designed to create game-ready dungeon maps for roguelike and dungeon-crawler games. The generator produces Tiled Map Editor compatible TMX files with sophisticated layout algorithms that ensure gameplay quality and reachability.

## Goals

### Primary Goals

1. **Procedural Generation**: Generate unique, randomized dungeon layouts with each execution
2. **Game-Ready Output**: Produce maps in industry-standard Tiled format (.tmx) ready for game engine integration
3. **Gameplay Quality**: Ensure generated dungeons are playable with proper progression mechanics
4. **Reachability**: Guarantee all rooms are accessible from the starting position
5. **Strategic Placement**: Position game elements (keys, bosses, chests, monsters) with gameplay intent

### Design Philosophy

The dungeon generator follows these core principles:

- **Algorithmic Fairness**: Dungeons are challenging but never impossible
- **Progressive Difficulty**: Boss rooms require keys, creating natural progression gates
- **Reward Placement**: Chests appear in deadends to reward exploration
- **Combat Design**: Monster chokes create tactical combat opportunities
- **Flexibility**: Configurable parameters allow tuning generation to different game needs

## What Problem Does This Solve?

### Manual Level Design Challenges

1. **Time-Consuming**: Hand-crafting dungeons takes significant designer time
2. **Limited Variety**: Manual dungeons offer limited replayability
3. **Testing Burden**: Each handmade dungeon requires extensive playability testing
4. **Scalability**: Games needing hundreds of dungeons cannot rely solely on manual design

### Dungen's Solution

Dungen automates dungeon creation while maintaining quality through:

- **Algorithmic Validation**: Automatic reachability checking
- **Built-in Game Logic**: Keys, bosses, and progression mechanics integrated
- **Configurable Generation**: Parameters control density, size, and complexity
- **Visual Output**: Direct integration with Tiled Map Editor for visual verification
- **Reproducibility**: Seed-based generation for debugging and testing

## Target Use Cases

### Game Development

- **Roguelike Games**: Games requiring unique dungeons each playthrough
- **Dungeon Crawlers**: Action RPGs with procedural dungeon areas
- **Indie Games**: Small teams needing scalable content creation
- **Prototype Development**: Rapid iteration on dungeon-based game concepts

### Content Creation

- **Level Variety**: Generate base layouts for designer refinement
- **Testing Environments**: Create test dungeons for gameplay systems
- **Procedural Content**: Runtime dungeon generation for infinite gameplay

## Technology Stack

- **Language**: TypeScript (type-safe, modern JavaScript)
- **Runtime**: Node.js (cross-platform execution)
- **Output Format**: TMX (Tiled Map Editor format)
- **Data Compression**: zlib (efficient map data encoding)
- **Dependencies**: Minimal (tmx-parser, lodash for utilities)

## Current State

The project is in active development with recent focus on Tiled integration. The generator successfully creates:

- Multi-layer tile maps (4 layers)
- Variable dungeon sizes (tested up to 30x30 cells)
- Theme support (forest theme implemented)
- Configurable room types and connections
- Boss/key progression systems
- Chest and monster placement

## Future Potential

Areas for expansion:

- Additional tileset themes
- Biome variation within dungeons
- More complex room templates
- Special room types (shops, treasure vaults, puzzle rooms)
- Difficulty scaling algorithms
- Multi-floor dungeon support
- Alternative output formats (JSON, custom game engine formats)
