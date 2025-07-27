export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
    ERROR_MESSAGES: {
      MIN_LENGTH: 'Nome de usuário deve ter pelo menos 3 caracteres',
      MAX_LENGTH: 'Nome de usuário deve ter no máximo 20 caracteres',
      PATTERN: 'Nome de usuário deve conter apenas letras, números e underscore',
      REQUIRED: 'Nome de usuário é obrigatório'
    }
  },
  DISPLAY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    ERROR_MESSAGES: {
      MIN_LENGTH: 'Nome de exibição deve ter pelo menos 2 caracteres',
      MAX_LENGTH: 'Nome de exibição deve ter no máximo 50 caracteres',
      REQUIRED: 'Nome de exibição é obrigatório'
    }
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ERROR_MESSAGES: {
      PATTERN: 'Email deve ter um formato válido',
      REQUIRED: 'Email é obrigatório'
    }
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    ERROR_MESSAGES: {
      MIN_LENGTH: 'Senha deve ter pelo menos 6 caracteres',
      MAX_LENGTH: 'Senha deve ter no máximo 128 caracteres',
      REQUIRED: 'Senha é obrigatória',
      MISMATCH: 'Senhas não coincidem'
    }
  },
  BIO: {
    MAX_LENGTH: 100,
    ERROR_MESSAGES: {
      MAX_LENGTH: 'Biografia deve ter no máximo 100 caracteres'
    }
  },
  CHILD_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    ERROR_MESSAGES: {
      MIN_LENGTH: 'Nome é obrigatório',
      MAX_LENGTH: 'Nome deve ter no máximo 50 caracteres',
      REQUIRED: 'Nome é obrigatório'
    }
  },
  CHILD_AGE: {
    MIN: 0,
    MAX: 30,
    ERROR_MESSAGES: {
      MIN: 'Idade deve ser maior que 0',
      MAX: 'Idade deve ser menor que 30',
      REQUIRED: 'Idade é obrigatória'
    }
  },
  CHILD_NOTES: {
    MAX_LENGTH: 200,
    ERROR_MESSAGES: {
      MAX_LENGTH: 'Observações devem ter no máximo 200 caracteres'
    }
  }
};

export const APP_CONFIG = {
  VERIFICATION_CODE_LENGTH: 6,
  MAX_GROUPS_PER_USER: 3,
  GROUPS_PER_PAGE: 10,
  MESSAGE_MAX_LENGTH: 500,
  AVATAR: {
    MIN_SIZE: 256,
    ALLOWED_TYPES: ['image/png', 'image/jpg', 'image/jpeg'],
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ERROR_MESSAGES: {
      INVALID_TYPE: 'Apenas imagens PNG e JPG são permitidas',
      MIN_SIZE: 'Imagem deve ter pelo menos 256x256 pixels',
      MAX_SIZE: 'Imagem deve ter no máximo 5MB'
    }
  },
  GROUP_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    ERROR_MESSAGES: {
      MIN_LENGTH: 'Nome do grupo deve ter pelo menos 3 caracteres',
      MAX_LENGTH: 'Nome do grupo deve ter no máximo 50 caracteres',
      REQUIRED: 'Nome do grupo é obrigatório'
    }
  },
  GROUP_DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 300,
    ERROR_MESSAGES: {
      MIN_LENGTH: 'Descrição deve ter pelo menos 10 caracteres',
      MAX_LENGTH: 'Descrição deve ter no máximo 300 caracteres',
      REQUIRED: 'Descrição é obrigatória'
    }
  },
  GROUP_TAGS: {
    MAX_COUNT: 2,
    MAX_LENGTH: 8,
    ERROR_MESSAGES: {
      MAX_COUNT: 'Máximo de 2 tags permitidas',
      MAX_LENGTH: 'Cada tag deve ter no máximo 8 caracteres',
      REQUIRED: 'Pelo menos uma tag é obrigatória'
    }
  }
};

export const DEFAULT_AVATARS = [
  '/avatars/default-1.png',
  '/avatars/default-2.png',
  '/avatars/default-3.png',
  '/avatars/default-4.png'
];

export const COOKIE_SETTINGS = {
  THEME: 'afetoatipico_theme',
  EXPIRES_DAYS: 365
};