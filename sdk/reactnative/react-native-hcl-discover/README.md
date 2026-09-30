# react-native-hcl-discover

Discover SDK for HCL Software


## TOC

- [Documentation](#documentation)
- [Android capture errors](#android-capture-errors)
- [Contributing](#contributing)
- [License](#license)

## Documentation

Kindly read the [documentation here](README.md)

## Android capture errors

On Android, `logAppContext`, `logTextChange`, and `logTouch` reject if screen capture fails. Handle these promises to avoid unhandled rejections. Native errors use `E_NO_ACTIVITY` when no activity is available, `E_INVALID_VIEW_SIZE` when the view has no drawable area, and `E_CAPTURE_FAILED` when drawing or encoding fails.

## Contributing

[Details here](CONTRIBUTING.md)

## License

Apache License Version 2.0

Kindly read the [License Text](LICENSE)

---



Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
