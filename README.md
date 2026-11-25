# 00xcyd/makefun-cooking-game-01

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/00xcyd/makefun-cooking-game-01/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/00xcyd/makefun-cooking-game-01/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Wok Luck** is a 90-second night-market cooking game. Read three paper tickets, walk the kitchen, fill your bowl from five labelled crates, chop on the board, stir the wok into the green, plate at the pass and slam the order through the SERVE hatch before patience runs out. Every ingredient, flame, ticket and sound is drawn or generated in code; there is no build step, no library and no network request.

**Controls:** WASD / arrows walk · E add, plate, serve · hold E stir · SPACE chop and stop the meter · mouse clicks work on every station · P pause · M mute.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

To build the hand-in output and dossier:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots are staged with the real game rules through `?shot=cover`, `?shot=prep`, `?shot=plate` and `?shot=title` (with `&seed=7`).

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
