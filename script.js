var bookmarks = []
function update() {
    chrome.bookmarks.getRecent(100, result => {
        if (chrome.runtime.lastError) {
            console.warn(chrome.runtime.lastError)
            return update()
        }
        result.sort((a, b) => a.index - b.index)
        if (result.length > 10) result = result.slice(0, 10)
        bookmarks = []
        result.forEach(item => bookmarks.push({ command: `bookmark_${item.index}`, url: item.url }))
    })
}
update()
chrome.commands.onCommand.addListener(command => bookmarks.forEach(item => {
    if (item.command === command) chrome.tabs.getAllInWindow(null, tabs => {
        let tabExists = false
        tabs.forEach(t => {
            if (t.url === item.url) {
                chrome.tabs.update(t.id, { active: true })
                tabExists = true
            }
        })
        if (!tabExists) chrome.tabs.query({ active: true }, t => t[0].url === 'chrome://newtab/' ? chrome.tabs.update(t[0].id, { url: item.url }) : chrome.tabs.create({ url: item.url }))
    })
}))
chrome.bookmarks.onCreated.addListener(update)
chrome.bookmarks.onRemoved.addListener(update)
chrome.bookmarks.onChanged.addListener(update)
chrome.bookmarks.onMoved.addListener(update)
chrome.runtime.onInstalled.addListener(installed => installed.reason === 'install' ? chrome.tabs.create({ url: 'chrome://extensions/shortcuts' }) : null)