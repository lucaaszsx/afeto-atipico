import { VALIDATION_RULES, APP_CONFIG } from '@/constants/validation';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateUsername = (username: string): ValidationError | null => {
  if (!username) {
    return { field: 'username', message: VALIDATION_RULES.USERNAME.ERROR_MESSAGES.REQUIRED };
  }
  
  if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    return { field: 'username', message: VALIDATION_RULES.USERNAME.ERROR_MESSAGES.MIN_LENGTH };
  }
  
  if (username.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
    return { field: 'username', message: VALIDATION_RULES.USERNAME.ERROR_MESSAGES.MAX_LENGTH };
  }
  
  if (!VALIDATION_RULES.USERNAME.PATTERN.test(username)) {
    return { field: 'username', message: VALIDATION_RULES.USERNAME.ERROR_MESSAGES.PATTERN };
  }
  
  return null;
};

export const validateDisplayName = (displayName: string): ValidationError | null => {
  if (!displayName) {
    return { field: 'displayName', message: VALIDATION_RULES.DISPLAY_NAME.ERROR_MESSAGES.REQUIRED };
  }
  
  if (displayName.length < VALIDATION_RULES.DISPLAY_NAME.MIN_LENGTH) {
    return { field: 'displayName', message: VALIDATION_RULES.DISPLAY_NAME.ERROR_MESSAGES.MIN_LENGTH };
  }
  
  if (displayName.length > VALIDATION_RULES.DISPLAY_NAME.MAX_LENGTH) {
    return { field: 'displayName', message: VALIDATION_RULES.DISPLAY_NAME.ERROR_MESSAGES.MAX_LENGTH };
  }
  
  return null;
};

export const validateEmail = (email: string): ValidationError | null => {
  if (!email) {
    return { field: 'email', message: VALIDATION_RULES.EMAIL.ERROR_MESSAGES.REQUIRED };
  }
  
  if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
    return { field: 'email', message: VALIDATION_RULES.EMAIL.ERROR_MESSAGES.PATTERN };
  }
  
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: 'password', message: VALIDATION_RULES.PASSWORD.ERROR_MESSAGES.REQUIRED };
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return { field: 'password', message: VALIDATION_RULES.PASSWORD.ERROR_MESSAGES.MIN_LENGTH };
  }
  
  if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
    return { field: 'password', message: VALIDATION_RULES.PASSWORD.ERROR_MESSAGES.MAX_LENGTH };
  }
  
  return null;
};

export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationError | null => {
  if (password !== confirmPassword) {
    return { field: 'confirmPassword', message: VALIDATION_RULES.PASSWORD.ERROR_MESSAGES.MISMATCH };
  }
  
  return null;
};

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

export const validateChild = (data: {
  name: string;
  age: number;
  notes?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!data.name) {
    errors.push({ field: 'name', message: VALIDATION_RULES.CHILD_NAME.ERROR_MESSAGES.REQUIRED });
  } else if (data.name.length > VALIDATION_RULES.CHILD_NAME.MAX_LENGTH) {
    errors.push({ field: 'name', message: VALIDATION_RULES.CHILD_NAME.ERROR_MESSAGES.MAX_LENGTH });
  }
  
  if (!data.age || data.age < VALIDATION_RULES.CHILD_AGE.MIN) {
    errors.push({ field: 'age', message: VALIDATION_RULES.CHILD_AGE.ERROR_MESSAGES.MIN });
  } else if (data.age > VALIDATION_RULES.CHILD_AGE.MAX) {
    errors.push({ field: 'age', message: VALIDATION_RULES.CHILD_AGE.ERROR_MESSAGES.MAX });
  }
  
  if (data.notes && data.notes.length > VALIDATION_RULES.CHILD_NOTES.MAX_LENGTH) {
    errors.push({ field: 'notes', message: VALIDATION_RULES.CHILD_NOTES.ERROR_MESSAGES.MAX_LENGTH });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateGroupForm = (data: {
  name: string;
  description: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!data.name) {
    errors.push({ field: 'name', message: APP_CONFIG.GROUP_NAME.ERROR_MESSAGES.REQUIRED });
  } else if (data.name.length < APP_CONFIG.GROUP_NAME.MIN_LENGTH) {
    errors.push({ field: 'name', message: APP_CONFIG.GROUP_NAME.ERROR_MESSAGES.MIN_LENGTH });
  } else if (data.name.length > APP_CONFIG.GROUP_NAME.MAX_LENGTH) {
    errors.push({ field: 'name', message: APP_CONFIG.GROUP_NAME.ERROR_MESSAGES.MAX_LENGTH });
  }
  
  if (!data.description) {
    errors.push({ field: 'description', message: APP_CONFIG.GROUP_DESCRIPTION.ERROR_MESSAGES.REQUIRED });
  } else if (data.description.length < APP_CONFIG.GROUP_DESCRIPTION.MIN_LENGTH) {
    errors.push({ field: 'description', message: APP_CONFIG.GROUP_DESCRIPTION.ERROR_MESSAGES.MIN_LENGTH });
  } else if (data.description.length > APP_CONFIG.GROUP_DESCRIPTION.MAX_LENGTH) {
    errors.push({ field: 'description', message: APP_CONFIG.GROUP_DESCRIPTION.ERROR_MESSAGES.MAX_LENGTH });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMessage = (message: string): ValidationError | null => {
  if (!message.trim()) {
    return { field: 'message', message: 'Mensagem não pode estar vazia' };
  }
  
  if (message.length > APP_CONFIG.MESSAGE_MAX_LENGTH) {
    return { field: 'message', message: `Mensagem deve ter no máximo ${APP_CONFIG.MESSAGE_MAX_LENGTH} caracteres` };
  }
  
  return null;
};

export const validateAvatarFile = (file: File): ValidationError | null => {
  if (!APP_CONFIG.AVATAR.ALLOWED_TYPES.includes(file.type)) {
    return { field: 'avatar', message: APP_CONFIG.AVATAR.ERROR_MESSAGES.INVALID_TYPE };
  }
  
  if (file.size > APP_CONFIG.AVATAR.MAX_FILE_SIZE) {
    return { field: 'avatar', message: APP_CONFIG.AVATAR.ERROR_MESSAGES.MAX_SIZE };
  }
  
  return null;
};

// Simple validation functions for groups
export const validateGroupName = (name: string) => {
  const errors: string[] = [];
  
  if (!name.trim()) {
    errors.push(APP_CONFIG.GROUP_NAME.ERROR_MESSAGES.REQUIRED);
  } else if (name.length < APP_CONFIG.GROUP_NAME.MIN_LENGTH) {
    errors.push(APP_CONFIG.GROUP_NAME.ERROR_MESSAGES.MIN_LENGTH);
  } else if (name.length > APP_CONFIG.GROUP_NAME.MAX_LENGTH) {
    errors.push(APP_CONFIG.GROUP_NAME.ERROR_MESSAGES.MAX_LENGTH);
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateGroupDescription = (description: string) => {
  const errors: string[] = [];
  
  if (!description.trim()) {
    errors.push(APP_CONFIG.GROUP_DESCRIPTION.ERROR_MESSAGES.REQUIRED);
  } else if (description.length < APP_CONFIG.GROUP_DESCRIPTION.MIN_LENGTH) {
    errors.push(APP_CONFIG.GROUP_DESCRIPTION.ERROR_MESSAGES.MIN_LENGTH);
  } else if (description.length > APP_CONFIG.GROUP_DESCRIPTION.MAX_LENGTH) {
    errors.push(APP_CONFIG.GROUP_DESCRIPTION.ERROR_MESSAGES.MAX_LENGTH);
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateGroupTags = (tags: string[]) => {
  const errors: string[] = [];
  const validTags = tags.filter(tag => tag.trim().length > 0);
  
  if (validTags.length === 0) {
    errors.push('Pelo menos uma tag é obrigatória');
  } else if (validTags.length > 2) {
    errors.push('Máximo de 2 tags permitidas');
  }
  
  const invalidTags = validTags.filter(tag => tag.length > 8);
  if (invalidTags.length > 0) {
    errors.push('Cada tag deve ter no máximo 8 caracteres');
  }
  
  return { isValid: errors.length === 0, errors };
};