import { ApiErrorCodes } from './ApiCodes';

export const ApiErrorMessages: Record<ApiErrorCodes, string> = {
    // General / Server Errors
    [ApiErrorCodes.INTERNAL_SERVER_ERROR]: 'Algo deu errado. Tente novamente mais tarde.',
    [ApiErrorCodes.TOO_MANY_REQUESTS]: 'Você fez muitas solicitações em pouco tempo. Aguarde um momento.',
    [ApiErrorCodes.SERVICE_UNAVAILABLE]: 'Serviço temporariamente indisponível.',
    [ApiErrorCodes.NOT_IMPLEMENTED]: 'Funcionalidade ainda não implementada.',
    [ApiErrorCodes.BAD_GATEWAY]: 'Erro de conexão com o servidor.',
    [ApiErrorCodes.NOT_FOUND]: 'Recurso não encontrado.',

    // Authentication & Authorization
    [ApiErrorCodes.AUTHENTICATION_FAILED]: 'Falha na autenticação. Verifique suas credenciais.',
    [ApiErrorCodes.FORBIDDEN]: 'Você não tem permissão para acessar este recurso.',
    [ApiErrorCodes.CODE_MISSING]: 'Código de verificação ausente.',
    [ApiErrorCodes.INVALID_CODE]: 'Código inválido. Verifique e tente novamente.',
    [ApiErrorCodes.CODE_EXPIRED]: 'Código expirado. Solicite um novo.',
    [ApiErrorCodes.CODE_ALREADY_USED]: 'Este código já foi utilizado.',
    [ApiErrorCodes.EMAIL_NOT_VERIFIED]: 'Seu e-mail ainda não foi verificado.',
    [ApiErrorCodes.REFRESH_TOKEN_MISSING]: 'Token de atualização ausente.',
    [ApiErrorCodes.INVALID_REFRESH_TOKEN]: 'Token de atualização inválido.',
    [ApiErrorCodes.REFRESH_TOKEN_EXPIRED]: 'Token de atualização expirado. Faça login novamente.',
    [ApiErrorCodes.ACCESS_TOKEN_MISSING]: 'Token de acesso ausente.',
    [ApiErrorCodes.INVALID_ACCESS_TOKEN]: 'Token de acesso inválido. Faça login novamente.',
    [ApiErrorCodes.ACCESS_TOKEN_EXPIRED]: 'Sessão expirada. Renovando automaticamente...',

    // Entity-related Errors
    [ApiErrorCodes.ENTITY_NOT_FOUND]: 'O item solicitado não foi encontrado.',
    [ApiErrorCodes.ENTITY_ALREADY_EXISTS]: 'Esse registro já existe.',

    // Validation Errors
    [ApiErrorCodes.VALIDATION_FAILED]: 'Alguns dados informados estão incorretos. Verifique os campos.',

    // File Upload / Media Errors
    [ApiErrorCodes.FILE_TOO_LARGE]: 'Arquivo muito grande. Tente um menor.',
    [ApiErrorCodes.UNSUPPORTED_FILE_TYPE]: 'Tipo de arquivo não suportado.',
    [ApiErrorCodes.FILE_UPLOAD_FAILED]: 'Não foi possível enviar o arquivo.',
    [ApiErrorCodes.FILE_NOT_FOUND]: 'Arquivo não encontrado.',

    // Messaging
    [ApiErrorCodes.EMAIL_CANNOT_BE_SENT]: 'Falha ao enviar o e-mail. Tente novamente.',

    // Cryptographic / Security Errors
    [ApiErrorCodes.HASHING_ERROR]: 'Erro de segurança interno. Contate o suporte.'
};