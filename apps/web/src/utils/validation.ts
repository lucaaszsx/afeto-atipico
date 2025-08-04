import { validationRules, appConfig } from '@/constants/validation';

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export const validateUsername = (username: string): ValidationError | null => {
    if (!username) return { field: 'username', message: validationRules.username.errorMessages.required };
    
    if (username.length < validationRules.username.minLength) return { field: 'username', message: validationRules.username.errorMessages.minLength };
    
    if (username.length > validationRules.username.maxLength) return { field: 'username', message: validationRules.username.errorMessages.maxLength };
    
    if (!validationRules.username.pattern.test(username)) return { field: 'username', message: validationRules.username.errorMessages.pattern };
    
    return null;
};

export const validateDisplayName = (displayName: string): ValidationError | null => {
    if (!displayName) return { field: 'displayName', message: validationRules.displayName.errorMessages.required };
    
    if (displayName.length < validationRules.displayName.minLength) return { field: 'displayName', message: validationRules.displayName.errorMessages.minLength };
    
    if (displayName.length > validationRules.displayName.maxLength) return { field: 'displayName', message: validationRules.displayName.errorMessages.maxLength };
    
    if (!validationRules.displayName.pattern.test(displayName)) return { field: 'displayName', message: validationRules.displayName.errorMessages.pattern };
    
    return null;
};

export const validateEmail = (email: string): ValidationError | null => {
    if (!email) return { field: 'email', message: validationRules.email.errorMessages.required };
    
    if (email.length > validationRules.email.maxLength) return { field: 'email', message: validationRules.email.errorMessages.maxLength };
    
    if (!validationRules.email.pattern.test(email)) return { field: 'email', message: validationRules.email.errorMessages.pattern };
    
    return null;
};

export const validatePassword = (password: string): ValidationError | null => {
    if (!password) return { field: 'password', message: validationRules.password.errorMessages.required };
    
    if (password.length < validationRules.password.minLength) return { field: 'password', message: validationRules.password.errorMessages.minLength };
    
    if (password.length > validationRules.password.maxLength) return { field: 'password', message: validationRules.password.errorMessages.maxLength };
    
    return null;
};

export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationError | null => {
    if (password !== confirmPassword) return { field: 'confirmPassword', message: validationRules.password.errorMessages.mismatch };
    
    return null;
};

export const validateBio = (bio: string): ValidationError | null => {
    if (bio && bio.length > validationRules.bio.maxLength) return { field: 'bio', message: validationRules.bio.errorMessages.maxLength };
    
    return null;
};

export const validateChildName = (name: string): ValidationError | null => {
    if (!name) return { field: 'childName', message: validationRules.childName.errorMessages.required };
    
    if (name.length < validationRules.childName.minLength) return { field: 'childName', message: validationRules.childName.errorMessages.minLength };
    
    if (name.length > validationRules.childName.maxLength) return { field: 'childName', message: validationRules.childName.errorMessages.maxLength };
    
    if (!validationRules.childName.pattern.test(name)) return { field: 'childName', message: validationRules.childName.errorMessages.pattern };
    
    return null;
};

export const validateChildAge = (age: number): ValidationError | null => {
    if (age === null || age === undefined) return { field: 'childAge', message: validationRules.childAge.errorMessages.required };
    
    if (age <= validationRules.childAge.min) return { field: 'childAge', message: validationRules.childAge.errorMessages.min };
    
    if (age >= validationRules.childAge.max) return { field: 'childAge', message: validationRules.childAge.errorMessages.max };
    
    return null;
};

export const validateChildNotes = (notes: string): ValidationError | null => {
    if (notes && notes.length > validationRules.childNotes.maxLength) return { field: 'childNotes', message: validationRules.childNotes.errorMessages.maxLength };
    
    return null;
};

export const validateGroupName = (name: string): ValidationError | null => {
    if (!name) return { field: 'groupName', message: appConfig.groupName.errorMessages.required };
    
    if (name.length < appConfig.groupName.minLength) return { field: 'groupName', message: appConfig.groupName.errorMessages.minLength };
    
    if (name.length > appConfig.groupName.maxLength) return { field: 'groupName', message: appConfig.groupName.errorMessages.maxLength };
    
    if (!appConfig.groupName.pattern.test(name)) return { field: 'groupName', message: appConfig.groupName.errorMessages.pattern };
    
    return null;
};

export const validateGroupDescription = (description: string): ValidationError | null => {
    if (!description) return { field: 'groupDescription', message: appConfig.groupDescription.errorMessages.required };
    
    if (description.length < appConfig.groupDescription.minLength) return { field: 'groupDescription', message: appConfig.groupDescription.errorMessages.minLength };
    
    if (description.length > appConfig.groupDescription.maxLength) return { field: 'groupDescription', message: appConfig.groupDescription.errorMessages.maxLength };
    
    return null;
};

export const validateGroupTags = (tags: string[]): ValidationError | null => {
    const validTags = tags.filter(tag => tag.trim().length > 0);
    
    if (validTags.length === 0) return { field: 'groupTags', message: appConfig.groupTags.errorMessages.required };
    
    if (validTags.length > appConfig.groupTags.maxCount) return { field: 'groupTags', message: appConfig.groupTags.errorMessages.maxCount };
    
    for (const tag of validTags) {
        if (tag.length < appConfig.groupTags.minLength) return { field: 'groupTags', message: appConfig.groupTags.errorMessages.minLength };
        
        if (tag.length > appConfig.groupTags.maxLength) return { field: 'groupTags', message: appConfig.groupTags.errorMessages.maxLength };
        
        if (!appConfig.groupTags.pattern.test(tag)) return { field: 'groupTags', message: appConfig.groupTags.errorMessages.pattern };
    }
    
    return null;
};

export const validateAvatarFile = (file: File): ValidationError | null => {
    if (!appConfig.avatar.allowedTypes.includes(file.type)) return { field: 'avatar', message: appConfig.avatar.errorMessages.invalidType };
    
    if (file.size > appConfig.avatar.maxFileSize) return { field: 'avatar', message: appConfig.avatar.errorMessages.maxSize };
    
    return null;
};

export const validateMessage = (message: string): ValidationError | null => {
    if (!message.trim()) return { field: 'message', message: 'Mensagem não pode estar vazia' };
    
    if (message.length > appConfig.messageMaxLength) return { field: 'message', message: `Mensagem deve ter no máximo ${appConfig.messageMaxLength} caracteres` };
    
    return null;
};

// Composite validation functions
export const validateRegistrationForm = (data: {
    username: string;
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
}): ValidationResult => {
    const errors: ValidationError[] = [];
    
    const usernameError = validateUsername(data.username);
    if (usernameError) errors.push(usernameError);
    
    const displayNameError = validateDisplayName(data.displayName);
    if (displayNameError) errors.push(displayNameError);
    
    const emailError = validateEmail(data.email);
    if (emailError) errors.push(emailError);
    
    const passwordError = validatePassword(data.password);
    if (passwordError) errors.push(passwordError);
    
    const confirmPasswordError = validatePasswordConfirmation(data.password, data.confirmPassword);
    if (confirmPasswordError) errors.push(confirmPasswordError);
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateLoginForm = (data: { email: string; password: string }): ValidationResult => {
    const errors: ValidationError[] = [];
    
    const emailError = validateEmail(data.email);
    if (emailError) errors.push(emailError);
    
    const passwordError = validatePassword(data.password);
    if (passwordError) errors.push(passwordError);
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateChildForm = (data: {
    name: string;
    age: number;
    notes?: string;
}): ValidationResult => {
    const errors: ValidationError[] = [];
    
    const nameError = validateChildName(data.name);
    if (nameError) errors.push(nameError);
    
    const ageError = validateChildAge(data.age);
    if (ageError) errors.push(ageError);
    
    if (data.notes) {
        const notesError = validateChildNotes(data.notes);
        if (notesError) errors.push(notesError);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateGroupForm = (data: {
    name: string;
    description: string;
    tags: string[];
}): ValidationResult => {
    const errors: ValidationError[] = [];
    
    const nameError = validateGroupName(data.name);
    if (nameError) errors.push(nameError);
    
    const descriptionError = validateGroupDescription(data.description);
    if (descriptionError) errors.push(descriptionError);
    
    const tagsError = validateGroupTags(data.tags);
    if (tagsError) errors.push(tagsError);
    
    return {
        isValid: errors.length === 0,
        errors
    };
};