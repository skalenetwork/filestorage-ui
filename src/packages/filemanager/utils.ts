import Web3 from 'web3';

function sanitizeAddress(
  addressLike: string = "",
  { prefix = true, checksum = true }: { prefix?: boolean, checksum?: boolean } = {}
) {

  const isAddress = Web3.utils.isAddress(addressLike);
  if (!isAddress) {
    return "";
  }

  let address = addressLike;
  const length = addressLike.length;

  if (checksum) {
    address = Web3.utils.toChecksumAddress(address);
  } else {
    address = address.toLowerCase();
  }

  // prefix transform after checksum is important since we want intuitive results vs web3ily-correct

  if (prefix) {
    address = '0x' + address.replace(/^0x/i, '');
  } else {
    address = address.replace(/^0x/i, '');
  }

  return address;
}

export default {
  sanitizeAddress
}

// /**
//  * @vitest-environment jsdom
//  */

// // @ts-ignore
// if (import.meta.vitest) {
//   // @ts-ignore
//   const { it, expect, vi } = import.meta.vitest;

//   it('sanitizeAddress(): invalid in, empty out', () => {
//     expect(sanitizeAddress()).toBe("");
//   });

//   it('sanitizeAddress(): default', () => {
//     expect(sanitizeAddress("5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a"))
//       .toBe("0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A");
//   });

//   it('sanitizeAddress(): no checksum', () => {
//     expect(
//       sanitizeAddress("5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a", { checksum: false }
//       ))
//       .toBe("0x5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a");
//   });

//   it('sanitizeAddress(): no prefix', () => {
//     expect(
//       sanitizeAddress("0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A", { prefix: false }
//       ))
//       .toBe("5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A");
//   });

//   it('sanitizeAddress(): no checksum, no prefix', () => {
//     expect(
//       sanitizeAddress("0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A", { prefix: false, checksum: false }
//       ))
//       .toBe("5a4ab05fbb140eb6a51e7d13a528a6aa35a5ef4a");
//   });

// }