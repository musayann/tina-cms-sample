import fs from "fs";
import path from "path";
import { UserflowContent } from './userflows';
import { TagContent } from './tags';
import { postsDirectory } from './app';
import { getUserflow } from './userflows';
import { getTag } from './tags';

export type ScreenContent = {
    readonly image: string;
    readonly id: string;
    readonly slug: string;
    readonly app: string;
    readonly device?: string;
    readonly userflows?: UserflowContent[];
    readonly tags?: TagContent[];
};

let screenCache: ScreenContent[];

function fetchScreenContent(): ScreenContent[] {
    if (screenCache) {
        return screenCache;
    }

    // // Get file names under /screens
    // Get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory);
    const allScreenData = fileNames
        .filter((it) => it.endsWith(".json"))
        .map((fileName) => {
            // Read markdown file as string
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");

            // Use gray-matter to parse the post metadata section
            const app = JSON.parse(fileContents);
            const screens = app.screens?.filter((screen) => screen.image).map((screen) => {
                const userflows = screen.userflows ? screen.userflows?.map((userflow) => getUserflow(userflow)).filter((userflow) => userflow) : [];
                const tags = screen.tags ? screen.tags.map((tag) => getTag(tag)).filter((tag) => tag) : [];
                const screenResult = {
                    ...screen,
                    app: app.slug,
                    device: app.device,
                    userflows,
                    tags
                };

                const matterData = screenResult as {
                    image: string;
                    id: string;
                    slug: string;
                    app: string;
                    device?: string;
                    userflows?: UserflowContent[];
                    tags?: TagContent[];
                };

                return matterData;
            });


            return screens;
        });

    const list = [...new Set(allScreenData.flat())] as ScreenContent[];

    screenCache = list.filter((screen) => screen?.id);

    return screenCache;
}

export function listScreenContent(
): ScreenContent[] {
    return fetchScreenContent();
}

export function listAppScreenContent(
    appSlug: string | string[],
    page: number,
    limit: number,
): ScreenContent[] {
    return fetchScreenContent().filter((screen) => screen?.app === appSlug).slice((page - 1) * limit, page * limit);
}

export function getAllAppScreenContent(
    appSlug: string | string[],
): ScreenContent[] {
    return fetchScreenContent().filter((screen) => screen?.app === appSlug);
}

export function getScreenContent(
    id: string | string[],
): ScreenContent {
    return fetchScreenContent().find((screen) => screen?.id === id);
}