import mongoose from "mongoose";

const { Schema } = mongoose;

const playerSeasonStatsSchema = new Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true
    },

    season: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Season",
        required: true
    },

    runs: {
        type: Number,
        min: 0,
        default: 0
    },

    wickets: {
        type: Number,
        min: 0,
        default: 0
    },

    catches: {
        type: Number,
        min: 0,
        default: 0
    },

    fours: {
        type: Number,
        min: 0,
        default: 0
    },

    sixes: {
        type: Number,
        min: 0,
        default: 0
    }
}, { timestamps: true });

// A player should have only ONE stats document per season
playerSeasonStatsSchema.index(
    { player: 1, season: 1 },
    { unique: true }
)

// Useful for leaderboard queries
playerSeasonStatsSchema.index({ season: 1, runs: -1 });
playerSeasonStatsSchema.index({ season: 1, wickets: -1 });
playerSeasonStatsSchema.index({ season: 1, catches: -1 });
playerSeasonStatsSchema.index({ season: 1, fours: -1 });
playerSeasonStatsSchema.index({ season: 1, sixes: -1 });

export default mongoose.model("PlayerSeasonStats", playerSeasonStatsSchema);

/*

ake your first index:

playerSeasonStatsSchema.index({
    season: 1,
    runs: -1
});

There are two fields in this index:

season
runs

The numbers tell MongoDB the ordering.

1   → ascending
-1  → descending

So:

season: 1

means seasons are indexed ascending.

And:

runs: -1

means runs are indexed descending.

Conceptually the index looks something like:

Season 2024
   ↓
   900 runs
   850 runs
   700 runs
   600 runs
   ...


Season 2025
   ↓
   950 runs
   800 runs
   750 runs
   ...


Season 2026
   ↓
   920 runs
   880 runs
   810 runs
   ...

So MongoDB can very efficiently find:

"Give me the highest run scorers from season X."

Why do we put season first?

Because your query will be:

PlayerSeasonStats.find({
    season: seasonId
})
.sort({
    runs: -1
})
.limit(10);

You're saying:

Find statistics belonging to this season, then give me the highest runs.

The index:

{
    season: 1,
    runs: -1
}

matches that query really well.

Think of it as:

season → runs

First narrow down the season:

2026
 ↓

Then they're already ordered by:

runs ↓

So MongoDB doesn't have to do as much work.

*/