const usernamePattern = /^[a-zA-Z0-9_]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const displayNamePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const childNamePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const groupNamePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9' -]+$/;
const groupTagsPattern = /^[a-zA-Z0-9-_]+$/;

const bytesPerMb = 1024 * 1024;
const avatarMaxFileSize = 5 * bytesPerMb;

const errorMessages = {
    username: {
        minLength: 'Nome de usuário deve ter pelo menos 3 caracteres',
        maxLength: 'Nome de usuário deve ter no máximo 32 caracteres',
        pattern: 'Nome de usuário deve conter apenas letras, números e underscore',
        required: 'Nome de usuário é obrigatório'
    },
    displayName: {
        minLength: 'Nome de exibição deve ter pelo menos 2 caracteres',
        maxLength: 'Nome de exibição deve ter no máximo 64 caracteres',
        pattern: 'Nome de exibição deve conter apenas letras, espaços, hífens e apóstrofos',
        required: 'Nome de exibição é obrigatório'
    },
    email: {
        maxLength: 'Email deve ter no máximo 254 caracteres',
        pattern: 'Email deve ter um formato válido',
        required: 'Email é obrigatório'
    },
    password: {
        minLength: 'Senha deve ter pelo menos 6 caracteres',
        maxLength: 'Senha deve ter no máximo 128 caracteres',
        required: 'Senha é obrigatória',
        mismatch: 'Senhas não coincidem'
    },
    bio: {
        maxLength: 'Biografia deve ter no máximo 256 caracteres'
    },
    childName: {
        minLength: 'Nome deve ter pelo menos 2 caracteres',
        maxLength: 'Nome deve ter no máximo 64 caracteres',
        pattern: 'Nome deve conter apenas letras, espaços, hífens e apóstrofos',
        required: 'Nome é obrigatório'
    },
    childAge: {
        min: 'Idade deve ser maior que 0',
        max: 'Idade deve ser menor que 120',
        required: 'Idade é obrigatória'
    },
    childNotes: {
        maxLength: 'Observações devem ter no máximo 256 caracteres'
    },
    avatar: {
        invalidType: 'Apenas imagens PNG e JPG são permitidas',
        minSize: 'Imagem deve ter pelo menos 256x256 pixels',
        maxSize: 'Imagem deve ter no máximo 5MB'
    },
    groupName: {
        minLength: 'Nome do grupo deve ter pelo menos 3 caracteres',
        maxLength: 'Nome do grupo deve ter no máximo 50 caracteres',
        required: 'Nome do grupo é obrigatório'
    },
    groupDescription: {
        minLength: 'Descrição deve ter pelo menos 10 caracteres',
        maxLength: 'Descrição deve ter no máximo 300 caracteres',
        required: 'Descrição é obrigatória'
    },
    groupTags: {
        maxCount: 'Máximo de 2 tags permitidas',
        minLength: 'Cada tag deve ter pelo menos 2 caracteres',
        maxLength: 'Cada tag deve ter no máximo 8 caracteres',
        pattern: 'Tags devem conter apenas letras, números, hífens e underscores',
        required: 'Pelo menos uma tag é obrigatória'
    }
};

export const validationRules = {
    username: {
        minLength: 3,
        maxLength: 32,
        pattern: usernamePattern,
        errorMessages: errorMessages.username
    },
    displayName: {
        minLength: 2,
        maxLength: 64,
        pattern: displayNamePattern,
        errorMessages: errorMessages.displayName
    },
    email: {
        maxLength: 254,
        pattern: emailPattern,
        errorMessages: errorMessages.email
    },
    password: {
        minLength: 6,
        maxLength: 128,
        errorMessages: errorMessages.password
    },
    bio: {
        maxLength: 256,
        errorMessages: errorMessages.bio
    },
    childName: {
        minLength: 2,
        maxLength: 64,
        pattern: childNamePattern,
        errorMessages: errorMessages.childName
    },
    childAge: {
        min: 0,
        max: 120,
        errorMessages: errorMessages.childAge
    },
    childNotes: {
        maxLength: 256,
        errorMessages: errorMessages.childNotes
    }
};

export const appConfig = {
    verificationCodeLength: 6,
    maxGroupsPerUser: 3,
    groupsPerPage: 10,
    messageMaxLength: 500,
    avatar: {
        minSize: 256,
        allowedTypes: ['image/png', 'image/jpg', 'image/jpeg'],
        maxFileSize: avatarMaxFileSize,
        errorMessages: errorMessages.avatar
    },
    groupName: {
        minLength: 3,
        maxLength: 50,
        pattern: groupNamePattern,
        errorMessages: errorMessages.groupName
    },
    groupDescription: {
        minLength: 10,
        maxLength: 300,
        errorMessages: errorMessages.groupDescription
    },
    groupTags: {
        minLength: 2,
        maxCount: 2,
        maxLength: 8,
        pattern: groupTagsPattern,
        errorMessages: errorMessages.groupTags
    }
};

export const defaultAvatars = [
    '/avatars/default-1.png',
    '/avatars/default-2.png',
    '/avatars/default-3.png',
    '/avatars/default-4.png'
];

export const cookieSettings = {
    theme: 'afetoatipico_theme',
    expiresDays: 365
};