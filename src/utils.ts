
// front-end utilities
// view oriented and may refer to DOM or virtual DOM objects
import DocumentTextIcon from "@heroicons/react/outline/DocumentTextIcon";
import FilmIcon from "@heroicons/react/outline/FilmIcon";
import VolumeUpIcon from "@heroicons/react/outline/VolumeUpIcon";
import PhotographIcon from "@heroicons/react/solid/PhotographIcon";
import CubeIcon from "@heroicons/react/outline/CubeIcon";
import Web3 from 'web3';

import type { ConfigType } from './config';
import { utils } from './packages/filemanager';

const { sanitizeAddress } = utils;

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
    Icon: CubeIcon,
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

const getRpcEndpoint = (data: ConfigType['chains'][0]) => {
  return `${data.protocol}://${data.nodeDomain}/${data.version}/${data.sChainName}`
}

const getFsEndpoint = (
  data: ConfigType['chains'][0],
  address: string = "",
  path: string = ""
) => {
  let root = sanitizeAddress(address, { prefix: false, checksum: false });
  return `${data.protocol}://${data.nodeDomain}/fs/${data.sChainName}${(root) ? "/" + root : ""}${(path) ? "/" + path : ""}`;
}

export {
  mimeData,
  downloadUrl,
  getRpcEndpoint,
  getFsEndpoint,
}