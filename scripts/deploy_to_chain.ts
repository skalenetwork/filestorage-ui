import path from 'path';
import fs from 'fs';

require('dotenv').config({ path: path.join(__dirname, "../.env.staging") });

const { env } = process;

import promptt from "password-prompt";
import { program } from 'commander';

import Web3 from "web3";
import { DeDirectory, DeFileManager, OPERATION } from "../src/packages/filemanager";
import { getRpcEndpoint } from "../src/utils";

program
  .option('-a, --address')
  .option('-k, --key')
  .option('-i, --interactive');

program.parse();

const options = program.opts();

const getKeys = async () => {
  let address;
  let pvtKey;

  if (options.interactive) {
    address = await promptt("Enter Address: ");
    pvtKey = await promptt("Enter Key: ");
  } else {
    address = options.address || process.env.SKL_DEPLOYER_ADDRESS;
    pvtKey = options.pvtKey || process.env.SKL_DEPLOYER_PRIVATE_KEY;
  }

  return {
    address,
    pvtKey
  }
}

(async () => {

  const { address, pvtKey } = await getKeys();

  if (!(address && pvtKey)) {
    console.error("Credentials missing. check --help for options");
    return process.exit();
  }

  const provider = new Web3.providers.HttpProvider(getRpcEndpoint({
    protocol: env.FS_CHAIN_PROTOCOL,
    nodeDomain: env.FS_CHAIN_NODE_DOMAIN,
    version: env.FS_CHAIN_VERSION,
    sChainName: env.FS_CHAIN_NAME,
    chainId: env.FS_CHAIN_ID
  }));

  const fm = new DeFileManager(provider, address, address, pvtKey);

  fm.bus.subscribe((event: any) => {
    if (event.type === OPERATION.UPLOAD_FILE) {
      let message = "";
      if (event.status === "success") {
        message = "Done uploading:";
      } else {
        message = "Failed to upload:";
      }

      console.log(message, path.join(
        (event.result.destDirectory as DeDirectory).path,
        event.result.file.name)
      );
    }
  });

  const iterateDirectory = (directoryPath, onEntry) => {
    const iterator = async () => {
      fs.readdir(directoryPath, async (err, files) => {
        for await (let filePath of files) {
          const file = path.resolve(directoryPath, filePath);
          fs.stat(file, (err, stat) => {
            if (stat.isDirectory()) {
              onEntry({
                kind: "directory",
                name: filePath,
                path: file
              });
            }
            if (stat.isFile()) {
              onEntry({
                kind: "file",
                name: filePath,
                path: file,
              });
            }
          });
        }
      });
    }
    iterator();
  }

  const uploadDirectory = async (localPath: string = 'dist', remotePath: string = "") => {
    if (!remotePath) {
      const localPathParts = localPath.split("/");
      remotePath = localPathParts[localPathParts.length - 1];
    }

    const handleEntry = (dirPath, deDirectory) => (async (entry) => {
      const relativePath = path.join(dirPath, entry.name);

      // upload file to existing remote directory
      if (entry.kind === "file") {
        try {
          const buffer = await fs.readFileSync(entry.path);
          const { status, result } = await fm.uploadFile(deDirectory, {
            name: entry.name,
            buffer: () => fs.readFileSync(entry.path)
          });
        } catch (e) {
        }
      }

      // create remote directory, then further iterate local
      if (entry.kind === "directory") {
        try {
          const { status, result } = await fm.createDirectory(deDirectory, entry.name);
          console.log("going in directory:", relativePath);
          if (status === "success") {
          }
          iterateDirectory(entry.path, handleEntry(relativePath, result.directory));
        } catch ({ result }) {
          iterateDirectory(entry.path, handleEntry(relativePath, result.directory));
        }
      }
    });

    const destinationDirectory = fm.rootDirectory();

    try {
      const { result, status } = await fm.createDirectory(destinationDirectory, remotePath);
      if (status == "success") {
        iterateDirectory(localPath, handleEntry("", result.directory));
      }
    } catch ({ result }) {
      // @todo: recursive delete this directory if already exists
      iterateDirectory(localPath, handleEntry("", result.directory));
    }
  }

  uploadDirectory();
})();

