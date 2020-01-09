

export function isElectron() {
    // @ts-ignore
    return window && window.process && window.process.versions && !!window.process.versions['electron'];
}

export function electronRequire(module:string) {
    if (isElectron()) {
        // @ts-ignore
        return window.require(module);
    }

    return null;
}

export function electronRemote(module?:string) {
    if (isElectron()) {
        if (!module) {
            return electronRequire('electron').remote;
        }
        // @ts-ignore
        return electronRequire('electron').remote.require(module);
    }

    return null;
}

export function isBrowser() {
    return !isElectron();
}