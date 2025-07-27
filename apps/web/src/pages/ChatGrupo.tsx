import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Users, ArrowLeft, MoreVertical, Reply, Trash2, User, Circle, Phone, Video, Settings, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { APP_CONFIG } from '@/constants/validation';

interface Message {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  timestamp: Date;
  replyTo?: string;
  status: 'sending' | 'sent' | 'error';
}

interface GroupMember {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  status: 'online' | 'offline';
  children?: Array<{ name: string; age: number; notes?: string }>;
}

interface GroupInfo {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  tags: string[];
}

const ChatGrupo = () => {
  const { groupId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMemberProfile, setShowMemberProfile] = useState<GroupMember | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Mock data
  const mockGroupInfo: GroupInfo = {
    id: groupId || '1',
    name: 'Mães de Autistas SP',
    description: 'Grupo para mães de crianças autistas da região de São Paulo',
    memberCount: 128,
    tags: ['Autismo', 'SP']
  };

  const mockMembers: GroupMember[] = [
    { 
      id: '1', 
      displayName: 'Maria Silva', 
      username: 'maria_silva', 
      avatarUrl: '/avatars/default-1.png', 
      status: 'online',
      bio: 'Mãe do Lucas, 8 anos. Apaixonada por educação inclusiva.',
      children: [{ name: 'Lucas', age: 8, notes: 'Autismo leve, adora dinossauros' }]
    },
    { 
      id: '2', 
      displayName: 'Ana Costa', 
      username: 'ana_costa', 
      avatarUrl: '/avatars/default-1.png', 
      status: 'online',
      bio: 'Terapeuta ocupacional e mãe.',
      children: [{ name: 'Pedro', age: 6 }]
    },
    { 
      id: '3', 
      displayName: 'Julia Santos', 
      username: 'julia_santos', 
      avatarUrl: '/avatars/default-3.png', 
      status: 'offline',
      bio: 'Advogada especializada em direitos das pessoas com deficiência.',
      children: [{ name: 'Sofia', age: 5, notes: 'TEA nível 2' }]
    }
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      authorId: '2',
      authorName: 'Ana Costa',
      authorUsername: 'ana_costa',
      authorAvatar: '/avatars/default-1.png',
      content: 'Olá pessoal! Como vocês estão lidando com as mudanças de rotina dos pequenos?',
      timestamp: new Date(Date.now() - 3600000),
      status: 'sent'
    },
    {
      id: '2',
      authorId: '3',
      authorName: 'Julia Santos',
      authorUsername: 'julia_santos',
      authorAvatar: '/avatars/default-3.png',
      content: 'Oi Ana! Aqui em casa estamos usando mais recursos visuais para ajudar na transição.',
      timestamp: new Date(Date.now() - 1800000),
      replyTo: '1',
      status: 'sent'
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setTimeout(() => {
      setGroupInfo(mockGroupInfo);
      setMembers(mockMembers);
      setMessages(mockMessages);
      setIsLoading(false);
    }, 1000);

    // Handle window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAuthenticated, navigate, groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [newMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || newMessage.length > APP_CONFIG.MESSAGE_MAX_LENGTH) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      authorId: user?.id || '',
      authorName: user?.displayName || '',
      authorUsername: user?.username || '',
      authorAvatar: user?.avatarUrl || '/avatars/default-1.png',
      content: newMessage,
      timestamp: new Date(),
      replyTo: replyingTo?.id,
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setReplyingTo(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'error' }
            : msg
        )
      );
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast({
        title: "Mensagem excluída",
        description: "A mensagem foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mensagem.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getReplyMessage = (messageId: string) => {
    return messages.find(msg => msg.id === messageId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Users className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground">Carregando chat...</p>
        </div>
      </div>
    );
  }

  const MembersContent = () => (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold text-foreground">Membros ({members.length})</h3>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors flex-shrink-0"
            onClick={() => setShowMemberProfile(member)}
          >
            <div className="relative flex-shrink-0">
              <Avatar className="w-10 h-10">
                <AvatarImage src={member.avatarUrl} />
                <AvatarFallback>{member.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{member.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">@{member.username}</p>
            </div>
            <Circle className={`w-2 h-2 flex-shrink-0 ${member.status === 'online' ? 'text-green-500 fill-current' : 'text-gray-400 fill-current'}`} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col">
      {/* Chat Header */}
      <div className="bg-card/90 backdrop-blur-sm border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/grupos')}
              className="mr-2 hover:bg-primary/10 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Hash className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-foreground truncate">{groupInfo?.name}</h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground min-w-0">
                  <Users className="w-3 h-3 flex-shrink-0" />
                  <span className="flex-shrink-0">{groupInfo?.memberCount} membros</span>
                  {groupInfo?.tags && (
                    <>
                      <span className="flex-shrink-0">•</span>
                      <div className="flex gap-1 min-w-0 overflow-x-auto">
                        {groupInfo.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs flex-shrink-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Users className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-80 sm:w-80">
                  <SheetHeader>
                    <SheetTitle>Membros do Grupo</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 h-full">
                    <MembersContent />
                  </div>
                </SheetContent>
              </Sheet>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Chat Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const replyMessage = message.replyTo ? getReplyMessage(message.replyTo) : null;
              const isOwn = message.authorId === user?.id;

              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[75%] sm:max-w-md lg:max-w-lg ${isOwn ? 'order-2' : 'order-1'}`}>
                    {!isOwn && (
                      <div className="flex items-center space-x-2 mb-1 min-w-0">
                        <Avatar 
                          className="w-6 h-6 cursor-pointer flex-shrink-0"
                          onClick={() => setShowMemberProfile(members.find(m => m.id === message.authorId) || null)}
                        >
                          <AvatarImage src={message.authorAvatar} />
                          <AvatarFallback>{message.authorName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground truncate">{message.authorName}</span>
                        <span className="text-xs text-muted-foreground truncate">@{message.authorUsername}</span>
                      </div>
                    )}
                    
                    <div className={`rounded-lg p-3 ${
                      isOwn 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card border border-border'
                    } ${message.status === 'sending' ? 'opacity-60' : ''} transition-all duration-300`}>
                      {replyMessage && (
                        <div className="text-xs opacity-75 mb-2 p-2 bg-background/20 rounded border-l-2 border-current">
                          <p className="font-medium truncate">{replyMessage.authorName}</p>
                          <p className="truncate">{replyMessage.content}</p>
                        </div>
                      )}
                      
                      <p className={`whitespace-pre-wrap break-words ${message.status === 'sending' ? 'text-muted-foreground' : ''}`}>
                        {message.content}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-75 flex-shrink-0">{formatTime(message.timestamp)}</span>
                        
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {!isOwn && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingTo(message)}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <Reply className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {isOwn && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-70 hover:opacity-100">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      
                      {message.status === 'error' && (
                        <p className="text-xs text-destructive mt-1">Não foi possível enviar a mensagem</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-card/90 backdrop-blur-sm border-t border-border p-4 flex-shrink-0">
            {replyingTo && (
              <div className="bg-primary/10 p-3 rounded-lg mb-3 flex items-center justify-between">
                <div className="text-sm min-w-0 flex-1 mr-2">
                  <span className="font-medium text-primary">Respondendo para {replyingTo.authorName}</span>
                  <p className="text-muted-foreground truncate">{replyingTo.content}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="flex-shrink-0">
                  ×
                </Button>
              </div>
            )}
            
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  maxLength={APP_CONFIG.MESSAGE_MAX_LENGTH}
                  onKeyPress={handleKeyPress}
                  className="min-h-[44px] max-h-[120px] resize-none pr-16"
                  style={{ height: 'auto' }}
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground pointer-events-none">
                  {newMessage.length}/{APP_CONFIG.MESSAGE_MAX_LENGTH}
                </div>
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || newMessage.length > APP_CONFIG.MESSAGE_MAX_LENGTH}
                className="bg-primary hover:bg-primary/90 h-11 px-4 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Members Sidebar - Desktop only */}
        {!isMobile && (
          <div className="w-72 bg-card/80 backdrop-blur-sm border-l border-border flex-shrink-0">
            <div className="p-4 h-full">
              <MembersContent />
            </div>
          </div>
        )}
      </div>

      {/* Member Profile Modal */}
      <Dialog open={!!showMemberProfile} onOpenChange={() => setShowMemberProfile(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Perfil do Usuário</DialogTitle>
          </DialogHeader>

          {showMemberProfile && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 flex-shrink-0">
                  <AvatarImage src={showMemberProfile.avatarUrl} />
                  <AvatarFallback className="text-lg">{showMemberProfile.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">{showMemberProfile.displayName}</h3>
                  <p className="text-muted-foreground truncate">@{showMemberProfile.username}</p>
                  <Badge 
                    variant={showMemberProfile.status === 'online' ? 'default' : 'secondary'} 
                    className="mt-1"
                  >
                    <Circle className={`w-2 h-2 mr-1 ${showMemberProfile.status === 'online' ? 'fill-green-500' : 'fill-gray-400'}`} />
                    {showMemberProfile.status === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>
              
              {showMemberProfile.bio && (
                <div>
                  <h4 className="font-medium text-foreground mb-1">Biografia</h4>
                  <p className="text-sm text-muted-foreground break-words">{showMemberProfile.bio}</p>
                </div>
              )}
              
              {showMemberProfile.children && showMemberProfile.children.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Filhos</h4>
                  <div className="space-y-2">
                    {showMemberProfile.children.map((child, index) => (
                      <div key={index} className="p-3 bg-primary/5 rounded-lg">
                        <p className="font-medium text-sm break-words">{child.name} • {child.age} anos</p>
                        {child.notes && (
                          <p className="text-xs text-muted-foreground mt-1 break-words">{child.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                Membro do grupo
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatGrupo;