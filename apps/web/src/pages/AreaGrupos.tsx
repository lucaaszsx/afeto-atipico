import { useState, useEffect } from 'react';
import { Search, Plus, Users, MessageCircle, Hash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '@/constants/validation';
import { validateGroupName, validateGroupDescription } from '@/utils/validation';
import { GroupCard } from '@/components/GroupCard';
import { MyGroupCard } from '@/components/MyGroupCard';

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  tags: string[];
  isJoined: boolean;
}

const AreaGrupos = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [userGroupsCount, setUserGroupsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    tags: [''] as string[]
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const mockAvailableGroups: Group[] = [
    { 
      id: '1', 
      name: 'Mães de Autistas SP', 
      description: 'Grupo para mães de crianças autistas da região de São Paulo. Compartilhamos experiências, dicas e apoio mútuo.',
      memberCount: 128, 
      tags: ['Autismo', 'SP'], 
      isJoined: false 
    },
    { 
      id: '2', 
      name: 'Primeiros Passos TEA', 
      description: 'Apoio para famílias que receberam diagnóstico recente de TEA. Orientações e suporte emocional.',
      memberCount: 85, 
      tags: ['TEA', 'Apoio'], 
      isJoined: false 
    },
    { 
      id: '3', 
      name: 'Desenvolvimento Infantil', 
      description: 'Dicas e experiências sobre desenvolvimento das crianças neurotípicas e neuroatípicas.',
      memberCount: 203, 
      tags: ['Desenvolv', 'Dicas'], 
      isJoined: false 
    },
    { 
      id: '4', 
      name: 'Educação Inclusiva', 
      description: 'Discussões sobre escolas e métodos de ensino inclusivos para crianças com necessidades especiais.',
      memberCount: 156, 
      tags: ['Educação', 'Inclusão'], 
      isJoined: false 
    },
    { 
      id: '5', 
      name: 'Terapias e Tratamentos', 
      description: 'Compartilhamento de experiências com diferentes terapias e tratamentos para autismo.',
      memberCount: 94, 
      tags: ['Terapias', 'Saúde'], 
      isJoined: false 
    },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setTimeout(() => {
      setAvailableGroups(mockAvailableGroups);
      setMyGroups([]);
      setIsLoading(false);
    }, 1000);
  }, [isAuthenticated, navigate]);

  const filteredGroups = availableGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleJoinGroup = async (groupId: string) => {
    if (!isAuthenticated || joiningGroupId) {
      if (!isAuthenticated) navigate('/login');
      return;
    }

    setJoiningGroupId(groupId);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const group = availableGroups.find(g => g.id === groupId);
      if (group && !myGroups.find(g => g.id === groupId)) {
        const joinedGroup = { ...group, isJoined: true };
        setMyGroups(prev => [...prev, joinedGroup]);
        setAvailableGroups(prev => prev.filter(g => g.id !== groupId));
        
        toast({
          title: "Grupo adicionado!",
          description: `Você agora faz parte do grupo "${group.name}".`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível entrar no grupo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setJoiningGroupId(null);
    }
  };

  const validateGroupTags = (tags: string[]) => {
    const validTags = tags.filter(tag => tag.trim().length > 0);
    
    if (validTags.length === 0) {
      return { isValid: false, errors: ['Pelo menos uma tag é obrigatória'] };
    }
    
    if (validTags.length > APP_CONFIG.GROUP_TAGS?.MAX_COUNT || validTags.length > 2) return { isValid: false, errors: ['Máximo de 2 tags permitidas'] };
    if (validTags.filter(tag => tag.length > 8).length > 0) return { isValid: false, errors: ['Cada tag deve ter no máximo 8 caracteres'] };
    
    return { isValid: true, errors: [] };
  };

  const handleCreateGroup = async () => {
    if (isCreatingGroup) return;
    
    const errors: Record<string, string> = {};
    
    const nameValidation = validateGroupName(newGroup.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errors[0];
    }
    
    const descValidation = validateGroupDescription(newGroup.description);
    if (!descValidation.isValid) {
      errors.description = descValidation.errors[0];
    }
    
    const tagsValidation = validateGroupTags(newGroup.tags);
    if (!tagsValidation.isValid) {
      errors.tags = tagsValidation.errors[0];
    }
    
    if (userGroupsCount >= APP_CONFIG.MAX_GROUPS_PER_USER) {
      errors.general = `Você já atingiu o limite de ${APP_CONFIG.MAX_GROUPS_PER_USER} grupos criados.`;
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setIsCreatingGroup(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const validTags = newGroup.tags.filter(tag => tag.trim().length > 0);
      
      const createdGroup: Group = {
        id: Date.now().toString(),
        name: newGroup.name,
        description: newGroup.description,
        memberCount: 1,
        tags: validTags,
        isJoined: true
      };
      
      if (!myGroups.find(g => g.name === createdGroup.name)) {
        setMyGroups(prev => [...prev, createdGroup]);
        setUserGroupsCount(prev => prev + 1);
        setNewGroup({ name: '', description: '', tags: [''] });
        setFormErrors({});
        setIsCreateModalOpen(false);
        
        toast({
          title: "Grupo criado!",
          description: `O grupo "${createdGroup.name}" foi criado com sucesso.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o grupo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleAccessGroup = (groupId: string) => {
    navigate(`/grupos/chat/${groupId}`);
  };

  const addTag = () => {
    if (newGroup.tags.length < 2) {
      setNewGroup({ ...newGroup, tags: [...newGroup.tags, ''] });
    }
  };

  const removeTag = (index: number) => {
    const newTags = newGroup.tags.filter((_, i) => i !== index);
    setNewGroup({ ...newGroup, tags: newTags.length === 0 ? [''] : newTags });
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...newGroup.tags];
    newTags[index] = value;
    setNewGroup({ ...newGroup, tags: newTags });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Users className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground">Carregando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Área de Grupos</h1>
          <p className="text-muted-foreground">Conecte-se com outras famílias e compartilhe experiências</p>
        </div>

        {/* My Groups */}
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-foreground flex items-center">
              <MessageCircle className="w-6 h-6 mr-3 text-primary" />
              Meus Grupos
              {myGroups.length > 0 && (
                <Badge variant="secondary" className="ml-3">
                  {myGroups.length}
                </Badge>
              )}
            </CardTitle>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  disabled={userGroupsCount >= APP_CONFIG.MAX_GROUPS_PER_USER}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Grupo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Criar Novo Grupo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {formErrors.general && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      {formErrors.general}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Nome do Grupo</Label>
                    <Input
                      id="groupName"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      placeholder="Ex: Mães de Autistas RJ"
                      className={formErrors.name ? "border-destructive" : ""}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-destructive">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Descrição</Label>
                    <Textarea
                      id="groupDescription"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      placeholder="Descreva o propósito do grupo..."
                      className={formErrors.description ? "border-destructive" : ""}
                    />
                    {formErrors.description && (
                      <p className="text-sm text-destructive">{formErrors.description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Tags (máximo 2)</Label>
                      {newGroup.tags.length < 2 && (
                        <Button type="button" onClick={addTag} size="sm" variant="outline">
                          <Plus className="w-3 h-3 mr-1" />
                          Tag
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {newGroup.tags.map((tag, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={tag}
                            onChange={(e) => updateTag(index, e.target.value)}
                            placeholder="Ex: Autismo"
                            maxLength={8}
                            className="flex-1"
                          />
                          {newGroup.tags.length > 1 && (
                            <Button 
                              type="button" 
                              onClick={() => removeTag(index)} 
                              size="sm" 
                              variant="outline"
                              className="px-2"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {formErrors.tags && (
                      <p className="text-sm text-destructive">{formErrors.tags}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateModalOpen(false)}
                      disabled={isCreatingGroup}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateGroup} 
                      className="bg-primary hover:bg-primary/90"
                      disabled={isCreatingGroup}
                    >
                      {isCreatingGroup ? (
                        <>
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Grupo
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {myGroups.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Você ainda não faz parte de nenhum grupo</h3>
                <p className="text-muted-foreground mb-6">Crie um novo grupo ou participe de grupos existentes abaixo</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                  disabled={userGroupsCount >= APP_CONFIG.MAX_GROUPS_PER_USER}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Meu Primeiro Grupo
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {myGroups.map((group) => (
                  <MyGroupCard
                    key={group.id}
                    group={group}
                    onAccess={handleAccessGroup}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Groups */}
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm animate-scale-in">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-xl text-foreground flex items-center">
                <Search className="w-6 h-6 mr-3 text-primary" />
                Descubra Grupos
                <Badge variant="secondary" className="ml-3">
                  {filteredGroups.length}
                </Badge>
              </CardTitle>
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, descrição ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredGroups.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? 'Nenhum grupo encontrado' : 'Nenhum grupo disponível'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Tente buscar com outros termos ou crie um novo grupo!' 
                    : 'Seja o primeiro a criar um grupo e conectar pessoas!'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filteredGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={handleJoinGroup}
                    onAccess={handleAccessGroup}
                    isLoading={joiningGroupId === group.id}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AreaGrupos;