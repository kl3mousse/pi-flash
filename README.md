# Webxdc Game MVP

A minimal Webxdc app scaffold to start building your game. Uses `webxdc-dev` for local multi-user simulation.

## Structure

- `src/index.html` — minimal app based on docs example
- `src/manifest.toml` — optional metadata (name, source code URL)

## Develop

If you have `webxdc-dev` installed globally, you can run the app from the `src` directory directly.

```sh
webxdc-dev run src
```

This opens the simulator with multiple instances. Use the UI to start/reload instances and observe messages.

## Package (.xdc)

To create a `.xdc` package (zip of the `src` contents), you can run:

```sh
mkdir -p dist && (cd src && zip -9 --recurse-paths - *) > dist/app.xdc
```

You can then share `dist/app.xdc` in Delta Chat or Cheogram.

## Next steps

- Replace the simple input with initial game UI/logic.
- Add an icon at `src/icon.png` (square 128–512px).
- Optionally add @webxdc/types for TS typings.
