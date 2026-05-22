// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "ingestion-api.mdx": () => import("../content/docs/ingestion-api.mdx?collection=docs"), "sdk.mdx": () => import("../content/docs/sdk.mdx?collection=docs"), }),
};
export default browserCollections;