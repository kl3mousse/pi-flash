# Pi Flash — a webxdc mini‑game

Single‑player memory game to learn digits of π. Watch digits, then type them back. 3 lives. Simple milestones at 10/20/50.

## Structure

- `src/index.html` — Pi Flash UI + message area
- `src/manifest.toml` — optional metadata (name, source code URL)
- `src/main.js` — game logic and state machine
- `src/styles.css` — basic styling

## Develop

If you have `webxdc-dev` installed globally, you can run the app from the `src` directory directly.

```sh
webxdc-dev run src
```

This opens the simulator. Start the game with the Start button. When a game ends, a status update with the score is sent, so you can see results in the chat history panel.

## Package (.xdc)

To create a `.xdc` package (zip of the `src` contents), you can run:

```sh
mkdir -p dist && (cd src && zip -9 --recurse-paths - *) > dist/app.xdc
```

You can then share `dist/app.xdc` in Delta Chat or Cheogram.

## Next steps

- Add an icon at `src/icon.png` (square 128–512px).
- Optional: add @webxdc/types for TS typings.
- Optional: bonus rounds every 5 digits (guess next digit), visuals at milestones.
