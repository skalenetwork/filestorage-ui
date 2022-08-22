import path from 'path';
import fs from 'fs';

require('dotenv').config({ path: path.join(__dirname, "../.env.staging") });

const { env } = process;

import promptt from "password-prompt";
import { program } from 'commander';

import Web3 from "web3";
import { DeDirectory, DeFileManager, OPERATION, utils } from "../src/packages/filemanager";
import { getRpcEndpoint } from "../src/utils";

const { pathToAbsolute } = utils;

program
  .option('-a, --address <char>')
  .option('-k, --key <char>')
  .option('-p, --path <char>')
  .option('-i, --interactive')
  ;

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
    pvtKey = options.key || process.env.SKL_DEPLOYER_PRIVATE_KEY;
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
        message = "[/] Done uploading:";
      } else {
        message = "[x] Failed to upload:";
      }

      console.log(message, path.join(
        (event.result.destDirectory as DeDirectory).path,
        event.result.file.name)
      );
    }
  });

  const iterateLocalDirectory = (directoryPath, onEntry) => {
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

  /**
   * 
   * @param localPath 
   * @param remotePath already existing remote directory path relative to address
   * @todo make remotePath functional or auto-gen deployment directory and output path (need node-side resolver)
   */
  const uploadDirectory = async (
    localPath: string = "dist",
    remotePath: string = options.path
  ) => {

    if (remotePath === undefined) {
      const localPathParts = localPath.split("/");
      remotePath = localPathParts[localPathParts.length - 1];
    }

    const handleDirEntry = (deDirectory) => (async (entry) => {

      // upload file to existing remote directory
      if (entry.kind === "file") {
        try {
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
          const { result } = await fm.createDirectory(deDirectory, entry.name);
          iterateLocalDirectory(entry.path, handleDirEntry(result.directory));
        } catch ({ result }) {
        }
      }
    });

    let directory: DeDirectory = (await fm.resolvePath(remotePath)) as DeDirectory;

    if (!directory) {
      console.log(`[-] Creating directory @ ${remotePath}`);
      let parts = remotePath.split("/");
      let name = parts.pop(); // folder name
      let path = parts.join(); // relative directory path
      console.log("[?] params", path, name);
      try {
        const destDirectory = (await fm.resolvePath(path)) as DeDirectory;
        console.log("[?] destDirectory", destDirectory.path);
        const { result } = await fm.createDirectory(destDirectory, name);
        directory = result.directory;
      } catch (err) {
        console.error("[x] Target directory path is missing:", err);
        process.exit();
      }
    }

    console.log(`[/] Starting upload in directory: ${directory.path}`);
    iterateLocalDirectory(localPath, handleDirEntry(directory));
  }

  uploadDirectory();

})();

