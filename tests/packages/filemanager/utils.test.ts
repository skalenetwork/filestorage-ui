
import { utils } from '@/packages/filemanager';
const { sanitizeAddress, pathToRelative, pathToAbsolute } = utils;

// @ts-ignore
if (import.meta.vitest) {
  // @ts-ignore
  const { it, expect, vi, describe } = import.meta.vitest;

  describe.concurrent('sanitizeAddress', () => {
    it('sanitizeAddress(): invalid in, empty out', () => {
      expect(sanitizeAddress()).toBe("");
    });

    it('sanitizeAddress(): default i.e. checksum and prefix', () => {
      expect(sanitizeAddress("5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a"))
        .toBe("0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A");
    });

    it('sanitizeAddress(): no checksum', () => {
      expect(
        sanitizeAddress("5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a", { checksum: false }
        ))
        .toBe("0x5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a");
    });

    it('sanitizeAddress(): no prefix', () => {
      expect(
        sanitizeAddress("0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A", { prefix: false }
        ))
        .toBe("5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A");
    });

    it('sanitizeAddress(): no checksum, no prefix', () => {
      expect(
        sanitizeAddress("0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A", { prefix: false, checksum: false }
        ))
        .toBe("5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a");
    });
  });

  describe.concurrent('Path resolves', () => {

    it('pathToRelative(): root returns empty string', () => {
      expect(pathToRelative("5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a"))
        .toBe("")
    });

    it('pathToRelative(): nested file', () => {
      expect(pathToRelative("5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a/dir/file.txt"))
        .toBe("dir/file.txt")
    });

    it('pathToRelative(): nested directory', () => {
      expect(pathToRelative("5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a/dir/nested"))
        .toBe("dir/nested")
    });

    it('pathToAbsolute(): empty string returns root', () => {
      expect(pathToAbsolute("", "5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a"))
        .toBe("5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a")
    });

    it('pathToAbsolute(): other cases', () => {
      expect(pathToAbsolute("dir/nested/file.txt", "5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a"))
        .toBe("5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a/dir/nested/file.txt")
    });
  });

}