type Constructor<T = any> = new (...args: any[]) => T;

export function hydrateEntity<T extends object>(target: T, data?: Partial<T>): void {
    if (!data) return;

    const keys = Object.keys(data) as Array<keyof T>;

    keys.forEach((prop) => {
        if (prop != null && Object.prototype.hasOwnProperty.call(data, prop)) {
            const value = data[prop];
            processValue(target, prop, value);
        }
    });

    if (!('updatedAt' in data)) {
        (target as any).updatedAt = new Date();
    }
}

function processValue<T extends object>(target: T, prop: keyof T, value: any): void {
    if (value == null) {
        setKeyValue(target, prop, value);
    } else if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'function') {
        setKeyValue(target, prop, value);
    } else if (Array.isArray(value)) {
        setKeyValue(target, prop, [...value]);
    } else if (value instanceof Date || isDateProperty(prop)) {
        setKeyValue(target, prop, new Date(value));
    } else if (typeof value === 'string') {
        setKeyValue(target, prop, value);
    } else if (typeof value === 'object') {
        handleObjectValue(target, prop, value);
    } else {
        setKeyValue(target, prop, value);
    }
}

function isDateProperty(prop: string | number | symbol): boolean {
    return prop === 'createdAt' || prop === 'updatedAt';
}

function handleObjectValue<T extends object>(target: T, prop: keyof T, value: any): void {
    try {
        if (value.constructor && value.constructor !== Object) {
            setKeyValue(target, prop, value);
        } else {
            const ctor: Constructor | undefined = Object.getPrototypeOf(value)?.constructor;
            if (ctor && ctor !== Object) {
                setKeyValue(target, prop, new ctor(value));
            } else {
                setKeyValue(target, prop, value);
            }
        }
    } catch {
        setKeyValue(target, prop, value);
    }
}

function setKeyValue<T extends object>(target: T, key: keyof T, value: any): void {
    if (key == null) return;

    const setter = 'set' + capitalizeFirst(String(key));

    if (Reflect.has(target, setter)) {
        const setterFunction = Reflect.get(target, setter);
        if (typeof setterFunction === 'function') {
            setterFunction.call(target, value);
            return;
        }
    }

    (target as any)[key] = value;
}

function capitalizeFirst(str: string): string {
    return typeof str === 'string'
        ? str
              .split(' ')
              .map((w) => w.charAt(0).toUpperCase() + w.substring(1))
              .join(' ')
        : str;
}