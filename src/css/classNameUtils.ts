export type ClassNameMap = {[key:string]:boolean};

type ClassNameVariants = string|string[]|ClassNameMap;

type CheckerFunction = () => boolean;

type Condition = boolean|CheckerFunction;

export function toggleClasses(defaultClasses: ClassNameVariants, toggledClasses: ClassNameVariants, condition: Condition):string {

    let conditionMet = false;
    if (typeof condition ===  'function') {
        conditionMet = condition();
    } else {
        conditionMet = condition;
    }

    if (conditionMet) {
        return toClass(toggledClasses);
    }

    return toClass(defaultClasses);
}

export function toClass(classNames: ClassNameVariants):string {
    if (typeof classNames === 'string') {
        return classNames;
    }

    if (Array.isArray(classNames)) {
        return classNames.join(' ');
    }

    return Object.entries(classNames).filter(([,enabled]) => {
        return enabled;
    }).map(([className, enabled]) => {
        return className;
    }).join(' ');
}