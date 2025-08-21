# Change Log

## [Unreleased]

## [0.6.2] - 2025-08-21

### Changed

- Improve atomWithSearchParams (#53)

## [0.6.1] - 2025-05-28

### Changed

- feat(atomWithSearchParams): add applyLocation function to merge existing searchParams (#50)

## [0.6.0] - 2025-04-23

### Added

- feat(atomWithSearchParams) add support for Search Params #41

### Changed

- update to morden setup #47 #44

## [0.5.5] - 2024-04-25

### Added

- feat(atomWithLocation): support location.hash #30
- feat(atomWithHash): allow the setHash option to be overridden on a per atom set basis #35

### Changed

- fix(atomWithLocation): replaceState function to use window.history.state instead of null #33

## [0.5.4] - 2024-02-27

### Changed

- feat(atomWithHash): initial value from hash #31

## [0.5.3] - 2024-02-18

### Changed

- feat(atomWithLocation): override replace for specific navigations #28

## [0.5.2] - 2023-10-15

### Changed

- fix(atomWithHash): default safeJSONParse #22
- fix(atomWithHash): replaceState function to use window.history.state instead of null #24

## [0.5.1] - 2023-03-11

### Changed

- refactor: atomWithHash #13

## [0.5.0] - 2023-03-03

### Added

- feat: mark internal atoms as private

## [0.4.0] - 2023-01-31

### Added

- Migrate to Jotai v2 API #1

## [0.3.3] - 2023-01-05

### Changed

- fix: atomWithLocation without window #8

## [0.3.2] - 2023-01-01

### Changed

- feat(atomWithHash): optimize return value to prevent unnecessary re-renders #6

## [0.3.1] - 2022-12-22

### Changed

- fix: atomWithHash without window #5

## [0.3.0] - 2022-12-01

### Added

- feat(atom-with-hash): allow optional setHash #4

## [0.2.0] - 2022-11-17

### Added

- feat: atomWithHash #2

## [0.1.0] - 2022-08-12

### Added

- Initial release
