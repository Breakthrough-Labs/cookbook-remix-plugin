import { PluginClient } from "@remixproject/plugin";
import axios from "axios";

export const getFilename = (path) => {
  if (!path) return;
  const parts = path.split("/");
  const filename = parts[parts.length - 1];
  return filename;
};

export class CookbookRemixClient extends PluginClient {
  constructor() {
    super();
    this.methods = ["openContract"];
    this.onload().then(async () => {});
  }

  async openContract(contractAddress: string) {
    const res = await axios.get(`/cli/id/${contractAddress}`, {
      headers: {
        "remix-plugin": "true",
      },
    });
    const { gistId, mainContract } = res.data;
    this.call("gistHandler" as any, "load", gistId).then(() => {
      try {
        setTimeout(() => {
          this.call(
            "fileManager" as any,
            "open",
            `gist-${gistId}/${getFilename(mainContract)}`
          );
        }, 1000);
      } catch (error) {
        console.error("Unable to open file");
      }
    });
  }
}
