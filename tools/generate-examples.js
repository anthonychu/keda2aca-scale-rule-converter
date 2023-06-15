const fetch = require('node-fetch');
const fs = require('fs').promises;

const githubFolderUrl = 'https://api.github.com/repos/kedacore/keda-docs/contents/content/docs/2.10/scalers';

async function main() {

    const files = await fetch(githubFolderUrl).then(res => res.json());

    const examples = [];

    for (const file of files) {
        const fileContent = await fetch(file.download_url).then(res => res.text());
        const titleMatch = fileContent.match(/title\s*=\s*\"*([^\"]*)\"*/s);
        const title = titleMatch ? titleMatch[1] : file.name.replace(/\.md$/, '');
        const kedaDocsUrl = `https://keda.sh/${file.path.replace(/(^content\/)|(\.md$)/g, '')}`;
        const matches = fileContent.matchAll(/```yaml\s*\r?\n(.*?\r?\n)```/gs);
        let exampleCount = 0;
        for (const match of matches) {
            console.log(`${file.download_url}\n\n${match[1]}\n\n**************\n\n`);
            examples.push({
                kedaDocsUrl,
                title: `${title} (${++exampleCount})`,
                example: match[1]
            });
        }
    }

    await fs.writeFile(`docs/examples.json`, JSON.stringify(examples, null, 2));
}

main();