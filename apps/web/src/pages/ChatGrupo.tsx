import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Send, 
    Users, 
    ArrowLeft, 
    MoreVertical, 
    Reply, 
    Trash2, 
    User, 
    Hash,
    MessageCircle,
    Loader2,
    ChevronDown,
    Search,
    Baby,
    Calendar
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

import { useApp, useAuth } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { appConfig } from '@/constants/validation';

import { NetworkError, ApiError, ApiErrorCodes } from '@/lib/rest';

// Import the proper types from your services
import { IGroupModel, IGroupMemberModel } from '@/services/types/models/GroupModels';
import { IMessageModel } from '@/services/types/models/MessageModels';
import { ICreateMessageRequestDTO } from '@/services/types/dtos/requests/GroupRequests';

interface ExtendedMessage extends IMessageModel {
    status: 'sending' | 'sent' | 'error';
}

const ChatGrupo = () => {
    const { groupId } = useParams();
    const { groupService } = useApp();
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    
    // Core state
    const [messages, setMessages] = useState<ExtendedMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [groupInfo, setGroupInfo] = useState<IGroupModel | null>(null);
    const [members, setMembers] = useState<IGroupMemberModel[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<IGroupMemberModel[]>([]);
    
    // UI state
    const [replyingTo, setReplyingTo] = useState<ExtendedMessage | null>(null);
    const [showMemberProfile, setShowMemberProfile] = useState<IGroupMemberModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileView, setIsMobileView] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [expandedNotes, setExpandedNotes] = useState<{[key: number]: boolean}>({});
    
    // Pagination state
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [lastMessageCursor, setLastMessageCursor] = useState<string | undefined>();
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Effects
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        
        if (!groupId) {
            navigate('/grupos');
            return;
        }

        loadData();
    }, [isAuthenticated, navigate, groupId]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 1024);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Auto-resize textarea with smooth animation
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 120);
            textarea.style.height = newHeight + 'px';
        }
    }, [newMessage]);

    useEffect(() => {
        // Filter members based on search term
        if (!searchTerm.trim()) {
            setFilteredMembers(members);
        } else {
            const filtered = members.filter(member =>
                member.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredMembers(filtered);
        }
    }, [members, searchTerm]);

    useEffect(() => {
        // Handle scroll to show/hide scroll to bottom button
        const messagesContainer = messagesContainerRef.current;
        if (!messagesContainer) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShowScrollButton(!isNearBottom && messages.length > 5);
        };

        messagesContainer.addEventListener('scroll', handleScroll);
        return () => messagesContainer.removeEventListener('scroll', handleScroll);
    }, [messages.length]);

    // Data loading functions
    const loadData = async () => {
        if (!groupId) return;
        
        setIsLoading(true);
        
        const [groupResult, membersResult] = await Promise.all([
            groupService.getGroup(groupId),
            groupService.getGroupMembers(groupId)
        ]);

        // Handle group info
        if (groupResult.success && groupResult.data) {
            setGroupInfo(groupResult.data);
        } else if (groupResult.error) {
            handleGroupError(groupResult.error);
            setIsLoading(false);
            return;
        }

        // Handle members
        if (membersResult.success && membersResult.data) {
            setMembers(membersResult.data.members);
        }

        // Load messages
        await loadMessages();

        setIsLoading(false);
    };

    const handleGroupError = (error: NetworkError | ApiError): void => {
        if (error.isRequestError) {
            toast({
                title: 'Ocorreu um erro',
                description: 'Não foi possível se conectar com o servidor devido a um erro durante a comunicação.',
                variant: 'destructive'
            });
            navigate('/grupos');
            return;
        }
        
        switch (error.apiCode) {
            case ApiErrorCodes.GROUP_NOT_FOUND:
                toast({
                    title: 'Grupo não encontrado',
                    description: 'O grupo que você está tentando acessar não existe ou foi removido.',
                    variant: 'destructive'
                });
                navigate('/grupos');
                break;
            
            case ApiErrorCodes.NOT_GROUP_MEMBER:
                toast({
                    title: 'Acesso negado',
                    description: 'Você não faz parte deste grupo.',
                    variant: 'destructive'
                });
                navigate('/grupos');
                break;
            
            case ApiErrorCodes.GROUP_ACCESS_DENIED:
                toast({
                    title: 'Acesso restrito',
                    description: 'Você não tem permissão para acessar este grupo.',
                    variant: 'destructive'
                });
                navigate('/grupos');
                break;
            
            default:
                toast({
                    title: 'Erro interno no servidor',
                    description: 'Ocorreu um erro interno no servidor ao tentar carregar o grupo. Se o problema persistir, entre em contato com o suporte.',
                    variant: 'destructive'
                });
                navigate('/grupos');
        }
    };

    const loadMessages = async (cursor?: string) => {
        if (!groupId) return;

        if (cursor) setIsLoadingMore(true);

        try {
            const messagesResult = await groupService.getGroupMessages(groupId, {
                limit: 50,
                before: cursor
            });

            if (messagesResult.success && messagesResult.data) {
                const messagesWithStatus: ExtendedMessage[] = messagesResult.data.messages.map(msg => ({
                    ...msg,
                    status: 'sent' as const
                }));

                if (cursor) {
                    // Loading older messages
                    setMessages(prev => [...messagesWithStatus, ...prev]);
                } else {
                    // Initial load or refresh
                    setMessages(messagesWithStatus);
                }

                setHasMoreMessages(messagesResult.data.hasMore);
                if (messagesResult.data.messages.length > 0) {
                    setLastMessageCursor(messagesResult.data.messages[0].id);
                }
            } else if (messagesResult.error) {
                console.error('Error loading messages:', messagesResult.error);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            if (cursor) setIsLoadingMore(false);
        }
    };

    const loadMoreMessages = async () => {
        if (!hasMoreMessages || isLoadingMore || !lastMessageCursor) return;
        await loadMessages(lastMessageCursor);
    };

    // Helper functions
    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ 
            behavior: smooth ? 'smooth' : 'auto' 
        });
    };

    const formatTime = (date: Date | string) => {
        const messageDate = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(messageDate);
    };

    const formatDate = (date: Date | string) => {
        const messageDate = typeof date === 'string' ? new Date(date) : date;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) return 'Hoje';
        if (messageDate.toDateString() === yesterday.toDateString()) return 'Ontem';
        
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(messageDate);
    };

    const getReplyMessage = (messageId: string) => {
        return messages.find(msg => msg.id === messageId);
    };

    const getCurrentUser = () => {
        return {
            id: user?.id || '',
            displayName: user?.displayName || '',
            username: user?.username || '',
            avatarUrl: user?.avatarUrl || ''
        };
    };

    const shouldShowDateSeparator = (currentMessage: ExtendedMessage, prevMessage?: ExtendedMessage) => {
        if (!prevMessage) return true;
        const currentDate = new Date(currentMessage.createdAt).toDateString();
        const prevDate = new Date(prevMessage.createdAt).toDateString();
        
        return currentDate !== prevDate;
    };

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    };

    // Event handlers
    const handleSendMessage = async () => {
        if (!newMessage.trim() || newMessage.length > appConfig.MESSAGE_MAX_LENGTH) return;

        const currentUser = getCurrentUser();
        const tempId = `temp_${Date.now()}`;
        
        const tempMessage: ExtendedMessage = {
            id: tempId,
            author: {
                id: currentUser.id,
                displayName: currentUser.displayName,
                username: currentUser.username,
                avatarUrl: currentUser.avatarUrl
            },
            content: newMessage.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            replyTo: replyingTo?.id,
            status: 'sending'
        };

        // Add message optimistically
        setMessages(prev => [...prev, tempMessage]);
        const messageContent = newMessage.trim();
        const replyTo = replyingTo?.id;
        setNewMessage('');
        setReplyingTo(null);

        const messageData: ICreateMessageRequestDTO = {
            content: messageContent,
            replyTo: replyTo
        };

        const result = await groupService.createMessage(groupId!, messageData);
        
        if (result.success && result.data) {
            // Replace temp message with real message
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === tempId 
                        ? { ...result.data!, status: 'sent' as const }
                        : msg
                )
            );
        } else if (result.error) {
            // Mark message as error
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === tempId 
                        ? { ...msg, status: 'error' as const }
                        : msg
                )
            );

            toast({
                title: 'Erro ao enviar',
                description: 'Não foi possível enviar a mensagem. Tente novamente.',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!groupId) return;

        const result = await groupService.deleteMessage(groupId, messageId);
        
        if (result.success) {
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
            
            toast({
                title: 'Mensagem excluída',
                description: 'A mensagem foi removida com sucesso.',
            });
        } else if (result.error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível excluir a mensagem.',
                variant: 'destructive'
            });
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleBackToGroups = () => {
        navigate('/grupos');
    };

    const handleMemberClick = (member: IGroupMemberModel) => {
        setShowMemberProfile(member);
        setExpandedNotes({}); // Reset expanded notes when opening a new profile
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    // Component render functions
    const renderDateSeparator = (date: string) => (
        <div className='flex items-center justify-center my-6'>
            <div className='bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-sm'>
                <span className='text-xs font-medium text-gray-600'>
                    {formatDate(date)}
                </span>
            </div>
        </div>
    );

    const renderLoadMoreButton = () => {
        if (!hasMoreMessages) return null;

        return (
            <div className='flex justify-center mb-6'>
                <Button
                    variant='ghost'
                    size='sm'
                    onClick={loadMoreMessages}
                    disabled={isLoadingMore}
                    className='bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 shadow-sm transition-all duration-200'
                >
                    {isLoadingMore ? (
                        <>
                            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                            Carregando...
                        </>
                    ) : (
                        <>
                            <ChevronDown className='w-4 h-4 mr-2' />
                            Carregar mensagens anteriores
                        </>
                    )}
                </Button>
            </div>
        );
    };

    const renderMemberProfile = (member: IGroupMemberModel, onClick: () => void) => (
        <div
            key={member.id}
            className='flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50/80 cursor-pointer transition-all duration-200 hover:scale-[1.02] group backdrop-blur-sm'
            onClick={onClick}
        >
            <div className='relative flex-shrink-0'>
                <Avatar className='w-10 h-10 ring-2 ring-white shadow-md'>
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback className='bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium'>
                        {member.displayName[0]}
                    </AvatarFallback>
                </Avatar>
                {/* Online status indicator - you can implement this based on your needs */}
                <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full'></div>
            </div>
            
            <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors'>
                    {member.displayName}
                </p>
                <p className='text-xs text-gray-500 truncate'>
                    @{member.username}
                </p>
            </div>
        </div>
    );

    const renderMessage = (message: ExtendedMessage, index: number) => {
        const replyMessage = message.replyTo ? getReplyMessage(message.replyTo) : null;
        const author = message.author || {};
        const isOwn = author.id === user?.id;
        const prevMessage = index > 0 ? messages[index - 1] : undefined;
        const showDateSeparator = shouldShowDateSeparator(message, prevMessage);

        return (
            <div key={message.id}>
                {showDateSeparator && renderDateSeparator(message.createdAt)}
                
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in mb-4`}>
                    <div className={`max-w-[85%] sm:max-w-md lg:max-w-lg xl:max-w-xl ${isOwn ? 'order-2' : 'order-1'}`}>
                        {!isOwn && (
                            <div className='flex items-center space-x-2 mb-2 px-1'>
                                <Avatar 
                                    className='w-6 h-6 cursor-pointer ring-1 ring-gray-200 hover:ring-2 hover:ring-blue-300 transition-all'
                                    onClick={() => {
                                        const member = members.find(m => m.id === author.id);
                                        if (member) handleMemberClick(member);
                                    }}
                                >
                                    <AvatarImage src={author.avatarUrl || ''} />
                                    <AvatarFallback className='bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs'>
                                        {author.displayName?.[0] || 'D'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className='text-sm font-semibold text-gray-900 truncate hover:text-blue-700 cursor-pointer transition-colors'>
                                    {author.displayName || 'Desconhecido'}
                                </span>
                                <span className='text-xs text-gray-500 truncate'>
                                    @{author.username || 'unknown'}
                                </span>
                            </div>
                        )}
                        
                        <div className={`rounded-2xl px-4 py-3 shadow-sm backdrop-blur-sm ${
                            isOwn 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200/50' 
                                : 'bg-white/90 border border-gray-200/80 text-gray-900 shadow-gray-200/50'
                        } ${message.status === 'sending' ? 'opacity-70' : ''} ${message.status === 'error' ? 'border-red-300 bg-red-50/90' : ''} transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}>
                            
                            {replyMessage && (
                                <div className={`text-xs mb-3 p-3 rounded-lg border-l-4 ${
                                    isOwn 
                                        ? 'bg-white/20 border-white/40 backdrop-blur-sm' 
                                        : 'bg-gray-50/80 border-blue-500 backdrop-blur-sm'
                                } transition-all duration-200 hover:bg-opacity-30`}>
                                    <p className='font-semibold truncate mb-1 flex items-center'>
                                        <Reply className='w-3 h-3 mr-1 opacity-60' />
                                        {replyMessage.author?.displayName || 'Desconhecido'}
                                    </p>
                                    <p className='truncate opacity-75'>
                                        {replyMessage.content}
                                    </p>
                                </div>
                            )}
                            
                            <p className='whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base'>
                                {message.content}
                            </p>
                            
                            <div className='flex items-center justify-between mt-3 pt-2 border-t border-current/10'>
                                <div className='flex items-center space-x-2'>
                                    <span className='text-xs opacity-75'>
                                        {formatTime(message.createdAt)}
                                    </span>
                                    
                                    {message.status === 'sending' && (
                                        <div className='flex items-center space-x-1'>
                                            <Loader2 className='w-3 h-3 animate-spin opacity-75' />
                                            <span className='text-xs opacity-75'>Enviando...</span>
                                        </div>
                                    )}
                                    
                                    {message.status === 'error' && (
                                        <span className='text-xs text-red-400'>
                                            Falha no envio
                                        </span>
                                    )}
                                </div>
                                
                                <div className='flex items-center space-x-1'>
                                    {!isOwn && (
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => setReplyingTo(message)}
                                            className='h-7 w-7 p-0 opacity-60 hover:opacity-100 hover:bg-current/10 transition-all duration-200'
                                            title='Responder mensagem'
                                        >
                                            <Reply className='w-3 h-3' />
                                        </Button>
                                    )}
                                    
                                    {isOwn && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant='ghost' 
                                                    size='sm' 
                                                    className='h-7 w-7 p-0 opacity-60 hover:opacity-100 hover:bg-current/10 transition-all duration-200'
                                                    disabled={groupService.isDeletingMessage(groupId!, message.id)}
                                                    title='Opções da mensagem'
                                                >
                                                    {groupService.isDeletingMessage(groupId!, message.id) ? (
                                                        <Loader2 className='w-3 h-3 animate-spin' />
                                                    ) : (
                                                        <MoreVertical className='w-3 h-3' />
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align='end' className='backdrop-blur-sm bg-white/95'>
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeleteMessage(message.id)}
                                                    className='text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 transition-colors'
                                                    disabled={groupService.isDeletingMessage(groupId!, message.id)}
                                                >
                                                    <Trash2 className='w-4 h-4 mr-2' />
                                                    Excluir mensagem
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <div className='fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center'>
                <div className='text-center animate-pulse'>
                    <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-xl'>
                        <MessageCircle className='w-10 h-10 text-white' />
                    </div>
                    <div className='space-y-3'>
                        <div className='h-4 bg-white/60 rounded-full w-40 mx-auto backdrop-blur-sm'></div>
                        <div className='h-3 bg-white/40 rounded-full w-28 mx-auto backdrop-blur-sm'></div>
                    </div>
                </div>
            </div>
        );
    }

    // Members content component with enhanced search
    const MembersContent = () => (
        <div className='flex flex-col h-full'>
            <div className='flex-shrink-0 space-y-4 mb-6'>
                <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                        <Users className='w-5 h-5 mr-2 text-blue-500' />
                        Membros
                    </h3>
                    <Badge variant='secondary' className='bg-blue-100 text-blue-700 font-medium'>
                        {members.length}
                    </Badge>
                </div>
                
                <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <Input
                        placeholder='Buscar membros...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='pl-10 bg-white/80 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-200'
                    />
                </div>
            </div>
            
            <ScrollArea className='flex-1'>
                <div className='space-y-2 pr-4'>
                    {groupService.isGettingGroupMembers(groupId!) ? (
                        <div className='flex items-center justify-center py-8'>
                            <div className='flex flex-col items-center space-y-3'>
                                <Loader2 className='w-6 h-6 animate-spin text-blue-500' />
                                <p className='text-sm text-gray-600'>Carregando membros...</p>
                            </div>
                        </div>
                    ) : filteredMembers.length === 0 ? (
                        <div className='text-center py-8'>
                            <Users className='w-8 h-8 text-gray-300 mx-auto mb-3' />
                            <p className='text-sm text-gray-600'>
                                {searchTerm ? 'Nenhum membro encontrado' : 'Nenhum membro no grupo'}
                            </p>
                        </div>
                    ) : (
                        filteredMembers.map((member) => renderMemberProfile(member, () => handleMemberClick(member)))
                    )}
                </div>
            </ScrollArea>
        </div>
    );

    return (
        <div className='fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col'>
            {/* Enhanced Header */}
            <div className='bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm flex-shrink-0'>
                <div className='px-3 sm:px-4 lg:px-6 py-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3 min-w-0 flex-1'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={handleBackToGroups}
                                className='hover:bg-blue-100 text-gray-600 hover:text-blue-700 transition-all duration-200 p-2 hover:scale-105'
                            >
                                <ArrowLeft className='w-4 h-4' />
                            </Button>
                            
                            <div className='flex items-center space-x-3 min-w-0 flex-1'>
                                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg hover:shadow-xl transition-shadow duration-200'>
                                    <Hash className='w-5 h-5 text-white' />
                                </div>
                                
                                <div className='min-w-0 flex-1'>
                                    <h1 className='font-bold text-gray-900 truncate text-base sm:text-lg hover:text-blue-700 transition-colors'>
                                        {groupInfo?.name}
                                    </h1>
                                    <div className='flex items-center space-x-2 text-xs sm:text-sm text-gray-600'>
                                        <Users className='w-3 h-3 flex-shrink-0' />
                                       
                                        <span className='flex-shrink-0'>
                                            {members.length} {members.length === 1 ? 'membro' : 'membros'}
                                        </span>
                                        {groupInfo?.tags && groupInfo.tags.length > 0 && (
                                            <>
                                                <span className='hidden sm:inline flex-shrink-0'>•</span>
                                                <div className='hidden sm:flex gap-1 overflow-x-auto'>
                                                    {groupInfo.tags.slice(0, 2).map((tag) => (
                                                        <Badge key={tag} variant='secondary' className='text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors'>
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {groupInfo.tags.length > 2 && (
                                                        <Badge variant='secondary' className='text-xs bg-gray-100 text-gray-600'>
                                                            +{groupInfo.tags.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className='flex items-center space-x-2'>
                            {/* Mobile members button */}
                            {isMobileView && (
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button 
                                            variant='ghost' 
                                            size='sm'
                                            className='hover:bg-blue-100 text-gray-600 hover:text-blue-700 transition-all duration-200 p-2 hover:scale-105'
                                        >
                                            <Users className='w-4 h-4' />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side='right' className='w-full max-w-sm p-0 bg-white/95 backdrop-blur-md'>
                                        <SheetHeader className='p-6 pb-4 border-b border-gray-200/80'>
                                            <SheetTitle className='text-left'>Membros do Grupo</SheetTitle>
                                        </SheetHeader>
                                        <div className='p-6 h-full'>
                                            <MembersContent />
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex flex-1 min-h-0'>
                {/* Main chat area */}
                <div className='flex flex-col flex-1 min-w-0'>
                    {/* Messages container */}
                    <div 
                        ref={messagesContainerRef}
                        className='flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 scroll-smooth'
                    >
                        <div className='max-w-4xl mx-auto'>
                            {groupService.isGettingGroupMessages(groupId!) && messages.length === 0 ? (
                                <div className='flex items-center justify-center py-16'>
                                    <div className='text-center'>
                                        <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-xl'>
                                            <MessageCircle className='w-8 h-8 text-white' />
                                        </div>
                                        <div className='space-y-3'>
                                            <div className='h-4 bg-white/60 rounded-full w-32 mx-auto backdrop-blur-sm animate-pulse'></div>
                                            <div className='h-3 bg-white/40 rounded-full w-24 mx-auto backdrop-blur-sm animate-pulse'></div>
                                        </div>
                                    </div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className='text-center py-16'>
                                    <div className='w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
                                        <MessageCircle className='w-10 h-10 text-gray-400' />
                                    </div>
                                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                                        Nenhuma mensagem ainda
                                    </h3>
                                    <p className='text-gray-600 max-w-md mx-auto leading-relaxed'>
                                        Seja o primeiro a iniciar a conversa e compartilhar suas experiências com o grupo!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {renderLoadMoreButton()}
                                    <div className='space-y-1'>
                                        {messages.map((message, index) => renderMessage(message, index))}
                                    </div>
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Scroll to bottom button */}
                    {showScrollButton && (
                        <div className='absolute bottom-24 right-6 z-10'>
                            <Button
                                onClick={() => scrollToBottom()}
                                className='h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105'
                                title='Ir para o final'
                            >
                                <ChevronDown className='w-5 h-5' />
                            </Button>
                        </div>
                    )}

                    {/* Enhanced Message input */}
                    <div className='bg-white/90 backdrop-blur-md border-t border-gray-200/80 flex-shrink-0 shadow-lg'>
                        <div className='px-3 sm:px-4 lg:px-6 py-4'>
                            <div className='max-w-4xl mx-auto'>
                                {replyingTo && (
                                    <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-start justify-between backdrop-blur-sm shadow-sm'>
                                        <div className='min-w-0 flex-1'>
                                            <div className='flex items-center space-x-2 mb-1'>
                                                <Reply className='w-4 h-4 text-blue-600 flex-shrink-0' />
                                                <span className='text-sm font-semibold text-blue-700'>
                                                    Respondendo para {replyingTo.author.displayName}
                                                </span>
                                            </div>
                                            <p className='text-sm text-gray-700 truncate bg-white/50 rounded-lg px-3 py-1 backdrop-blur-sm'>
                                                {replyingTo.content}
                                            </p>
                                        </div>
                                        <Button 
                                            variant='ghost' 
                                            size='sm' 
                                            onClick={handleCancelReply}
                                            className='ml-2 flex-shrink-0 hover:bg-blue-100 text-gray-500 hover:text-gray-700 h-8 w-8 p-0 transition-all duration-200'
                                        >
                                            ×
                                        </Button>
                                    </div>
                                )}
                                
                                <div className='flex gap-3 items-end'>
                                    <div className='flex-1 relative'>
                                        <Textarea
                                            ref={textareaRef}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder='Digite sua mensagem...'
                                            maxLength={appConfig.MESSAGE_MAX_LENGTH}
                                            onKeyPress={handleKeyPress}
                                            className='min-h-[48px] max-h-[120px] resize-none pr-16 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm transition-all duration-200 bg-white/80 backdrop-blur-sm focus:bg-white'
                                            disabled={groupService.isCreatingMessage(groupId!)}
                                        />
                                        <div className={`absolute bottom-3 right-3 text-xs pointer-events-none transition-colors ${
                                            newMessage.length > appConfig.MESSAGE_MAX_LENGTH * 0.9 
                                                ? 'text-red-500' 
                                                : 'text-gray-400'
                                        }`}>
                                            {newMessage.length}/{appConfig.MESSAGE_MAX_LENGTH}
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim() || newMessage.length > appConfig.MESSAGE_MAX_LENGTH || groupService.isCreatingMessage(groupId!)}
                                        className='h-12 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                                    >
                                        {groupService.isCreatingMessage(groupId!) ? (
                                            <Loader2 className='w-4 h-4 animate-spin' />
                                        ) : (
                                            <Send className='w-4 h-4' />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Desktop sidebar */}
                {!isMobileView && (
                    <div className='w-80 bg-white/80 backdrop-blur-md border-l border-gray-200/80 flex-shrink-0 shadow-lg'>
                        <div className='p-6 h-full'>
                            <MembersContent />
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Member Profile Modal - Fixed for horizontal overflow */}
            <Dialog open={!!showMemberProfile} onOpenChange={() => setShowMemberProfile(null)}>
                <DialogContent className='sm:max-w-md max-w-[calc(100vw-32px)] max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-md border-gray-200/80 rounded-xl'>
                    <DialogHeader>
                        <DialogTitle className='text-xl text-gray-900'>Perfil do Usuário</DialogTitle>
                    </DialogHeader>

                    {showMemberProfile && (
                        <div className='space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] pr-2'>
                            <div className='flex items-start space-x-4'>
                                <div className='relative flex-shrink-0'>
                                    <Avatar className='w-16 h-16 ring-2 ring-gray-200 shadow-lg'>
                                        <AvatarImage src={showMemberProfile.avatarUrl} />
                                        <AvatarFallback className='bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-semibold'>
                                            {showMemberProfile.displayName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Online status indicator */}
                                    <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-3 border-white rounded-full shadow-md'></div>
                                </div>
                                
                                <div className='flex-1 min-w-0'>
                                    <h3 className='text-lg font-bold text-gray-900 break-words overflow-wrap-anywhere'>
                                        {showMemberProfile.displayName}
                                    </h3>
                                    <p className='text-gray-600 break-words overflow-wrap-anywhere mb-2'>
                                        @{showMemberProfile.username}
                                    </p>
                                    <div className='flex flex-wrap gap-2'>
                                        <Badge 
                                            variant='secondary'
                                            className='bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors'
                                        >
                                            <Hash className='w-3 h-3 mr-1' />
                                            Membro do grupo
                                        </Badge>
                                        {/* You can add more badges here based on user roles/status */}
                                    </div>
                                </div>
                            </div>
                            
                            {showMemberProfile.bio && (
                                <div className='space-y-3'>
                                    <h4 className='font-semibold text-gray-900 flex items-center'>
                                        <User className='w-4 h-4 mr-2 text-blue-500' />
                                        Sobre
                                    </h4>
                                    <div className='bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200/50 backdrop-blur-sm'>
                                        <p className='text-sm text-gray-700 leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap'>
                                            {showMemberProfile.bio}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Seção de filhos - Fixed for display and overflow issues */}
                            {showMemberProfile.children && showMemberProfile.children.length > 0 && (
                                <div className='space-y-3'>
                                    <h4 className='font-semibold text-gray-900 flex items-center'>
                                        <Baby className='w-4 h-4 mr-2 text-pink-500' />
                                        Filhos ({showMemberProfile.children.length})
                                    </h4>
                                    <div className='max-h-64 overflow-y-auto space-y-3 pr-1'>
                                        {showMemberProfile.children.map((child, index) => {
                                            const notesLimit = 100;
                                            const shouldTruncate = child.notes && child.notes.length > notesLimit;
                                            const isExpanded = expandedNotes[index];
                                            
                                            return (
                                                <div key={index} className='bg-gradient-to-r from-pink-50 to-purple-50/30 rounded-xl p-4 border border-pink-200/50 backdrop-blur-sm'>
                                                    <div className='flex items-start justify-between mb-2'>
                                                        <div className='flex-1 min-w-0 pr-2'>
                                                            <h5 className='font-semibold text-gray-900 text-sm break-words overflow-wrap-anywhere leading-snug'>
                                                                {child.name}
                                                            </h5>
                                                            <div className='flex items-center space-x-2 text-xs text-gray-600 mt-1'>
                                                                <Calendar className='w-3 h-3 flex-shrink-0' />
                                                                <span className='flex-shrink-0'>
                                                                    {child.age ? `${child.age} anos` : 'Idade não informada'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {child.notes && (
                                                        <div className='mt-2 bg-white/50 rounded-lg p-3'>
                                                            <p className='text-xs text-gray-600 leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap'>
                                                                {shouldTruncate && !isExpanded 
                                                                    ? `${child.notes.substring(0, notesLimit)}...`
                                                                    : child.notes
                                                                }
                                                            </p>
                                                            {shouldTruncate && (
                                                                <button
                                                                    onClick={() => setExpandedNotes(prev => ({
                                                                        ...prev,
                                                                        [index]: !prev[index]
                                                                    }))}
                                                                    className='text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 transition-colors focus:outline-none hover:underline block'
                                                                >
                                                                    {isExpanded ? 'Ler menos' : 'Ler mais'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ChatGrupo;