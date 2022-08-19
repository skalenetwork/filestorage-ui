//@ts-nocheck

const promptt = require("password-prompt");

import { DeFileManager } from "../src/packages/filemanager";
import Web3 from "web3";

(async () => {
    const address = await promptt("Enter Address: ");
    const pvtKey = await promptt("Enter Key: ");
    const provider = new Web3.providers.HttpProvider();
    const fm = new DeFileManager(provider,);
})();

