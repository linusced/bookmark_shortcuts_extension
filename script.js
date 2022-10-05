var bookmarks = [];

update();
function update() {
    chrome.bookmarks.getRecent(500, result => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }

        bookmarks = [];
        result.sort((a, b) => a.index - b.index);

        for (let i = 0; i < result.length; i++)
            if (result[i].parentId === "1") {
                bookmarks.push({ command: `bookmark_${result[i].index}`, url: result[i].url });

                if (bookmarks.length >= 10)
                    break;
            }
    });
}

chrome.commands.onCommand.addListener(command => {
    for (let i = 0; i < bookmarks.length; i++)
        if (bookmarks[i].command === command) {
            chrome.tabs.getAllInWindow(null, tabs => {
                let tabExists = false;
                for (let t = 0; t < tabs.length; t++)
                    if (tabs[t].url === bookmarks[i].url) {
                        chrome.tabs.update(tabs[t].id, { active: true });
                        tabExists = true;
                        break;
                    }

                if (!tabExists)
                    chrome.tabs.query({ active: true }, t => t[0].url === 'chrome://newtab/' ? chrome.tabs.update(t[0].id, { url: bookmarks[i].url }) : chrome.tabs.create({ url: bookmarks[i].url }));
            });
            break;
        }
});

chrome.bookmarks.onCreated.addListener(update);
chrome.bookmarks.onRemoved.addListener(update);
chrome.bookmarks.onChanged.addListener(update);
chrome.bookmarks.onMoved.addListener(update);
chrome.runtime.onInstalled.addListener(installed => {
    if (installed.reason === 'install')
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});