const stepPermissions = document.getElementById('step-permissions');
const stepToken = document.getElementById('step-token');

async function checkPermissions() {
    const hasPermissions = await chrome.permissions.contains({
        origins: ['*://*/*']
    });
    if (hasPermissions) {
        stepPermissions?.classList.add('done');
    }
}

async function checkToken() {
    const result = await chrome.storage.sync.get('personalToken');
    if (result.personalToken) {
        stepToken?.classList.add('done');
    }
}

checkPermissions();
checkToken();
