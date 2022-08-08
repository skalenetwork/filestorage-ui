
// front-end utilities
// view oriented and may refer to DOM or virtual DOM objects
import DocumentTextIcon from "@heroicons/react/outline/DocumentTextIcon";
import FilmIcon from "@heroicons/react/outline/FilmIcon";
import VolumeUpIcon from "@heroicons/react/outline/VolumeUpIcon";
import PhotographIcon from "@heroicons/react/solid/PhotographIcon";
import Web3 from 'web3';

type MimeMetaData = {
  type: string;
  category: string;
  label: string;
  color: string;
  Icon: any;
};

type MimeMetaDataRepo = {
  [category: string]: {
    Icon: MimeMetaData['Icon'],
    Preview?: JSX.Element,
    color: MimeMetaData['color']
  }
};

// take categorical data out of utils as and when needed
// use common color names
const mimeDataRepo: MimeMetaDataRepo = {
  'font': {
    Icon: DocumentTextIcon,
    color: 'gray'
  },
  'text': {
    Icon: DocumentTextIcon,
    color: 'gray'
  },
  'application': {
    Icon: DocumentTextIcon,
    color: 'red'
  },
  'image': {
    Icon: PhotographIcon,
    color: 'purple'
  },
  'video': {
    Icon: FilmIcon,
    color: 'yellow'
  },
  'audio': {
    Icon: VolumeUpIcon,
    color: 'green'
  },
  'other': {
    Icon: DocumentTextIcon,
    color: 'gray'
  }
}

function mimeData(mimeType: string): MimeMetaData {
  const category = mimeType.split('/')[0];

  return {
    type: mimeType,
    category,
    label: category.slice(0, 0).toUpperCase() + category.slice(1),
    ...(mimeDataRepo[category] || mimeDataRepo['other'])
  }
}

function downloadUrl(url: string, filename: string) {
  return fetch(url, { mode: "no-cors" })
    .then(response => response.blob())
    .then(blob => {
      console.log("blob", blob);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    });
}

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

/**
 * @vitest-environment jsdom
 */

// @ts-ignore
if (import.meta.vitest) {
  // @ts-ignore
  const { it, expect, vi } = import.meta.vitest;

  it('sanitizeAddress(): invalid in, empty out', () => {
    expect(sanitizeAddress()).toBe("");
  });

  it('sanitizeAddress(): default', () => {
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

}

export {
  mimeData,
  downloadUrl,
  sanitizeAddress
}