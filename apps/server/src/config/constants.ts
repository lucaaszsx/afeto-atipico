/**
 * @file constants.ts
 * @description Centralized system constraints and limits for validation and configuration.
 * @author Lucas
 * @license MIT
 */

export const UserConstraints = {
    identifyFields: {
        username: {
            pattern: /^[a-zA-Z0-9_]+$/,
            maxLength: 32,
            minLength: 3
        },
        email: { maxLength: 254 },
        displayName: {
            pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
            maxLength: 64,
            minLength: 2
        }
    },
    securityFields: {
        password: { maxLength: 128, minLength: 6 }
    },
    profileFields: {
        bio: {
            default: "Life's beautiful! 🩵",
            maxLength: 256
        },
        child: {
            name: {
                pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
                maxLength: 64,
                minLength: 2
            },
            age: { max: 120 },
            notes: { maxLength: 256 }
        }
    }
} as const;

export const GroupConstraints = {
    nameFields: {
        pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ0-9' -]+$/,
        maxLength: 50,
        minLength: 3
    },
    descriptionFields: {
        maxLength: 300,
        minLength: 10
    },
    tagsFields: {
        pattern: /^[a-zA-Z0-9-_]+$/,
        maxLength: 8,
        minLength: 2,
        maxCount: 2
    }
} as const;

export const GroupMessageConstraints = {
    contentFields: {
        maxLength: 500,
        minLength: 1
    }
} as const;

export const ReportConstraints = {
    title: {
        minLength: 5,
        maxLength: 100
    },
    content: {
        minLength: 5,
        maxLength: 500
    }
} as const;
