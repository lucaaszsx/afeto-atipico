
import { Shield, FileText, DollarSign, GraduationCap, Heart, Phone, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DireitosBeneficios = () => {
  const rights = [
    {
      icon: DollarSign,
      title: 'Benefício de Prestação Continuada (BPC)',
      description: 'Benefício mensal de 1 salário mínimo para pessoas com deficiência em situação de vulnerabilidade.',
      details: [
        'Renda familiar per capita inferior a 1/4 do salário mínimo',
        'Laudo médico comprovando a deficiência',
        'Não é necessário ter contribuído para o INSS',
        'Revisão a cada 2 anos'
      ],
      requirements: 'Inscrição no CadÚnico e avaliação médica e social do INSS',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: GraduationCap,
      title: 'Direitos na Educação',
      description: 'Garantia de educação inclusiva em escolas regulares com os apoios necessários.',
      details: [
        'Matrícula em escola regular não pode ser negada',
        'Direito a professor de apoio quando necessário',
        'Adaptações curriculares e de avaliação',
        'Atendimento Educacional Especializado (AEE)',
        'Transporte escolar adaptado se necessário'
      ],
      requirements: 'Laudo médico e relatório pedagógico',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Heart,
      title: 'Direitos na Saúde',
      description: 'Acesso integral aos serviços de saúde pelo SUS, incluindo tratamentos especializados.',
      details: [
        'Consultas com especialistas (neuropediatra, psiquiatra, etc.)',
        'Terapias (fonoaudiologia, psicologia, terapia ocupacional)',
        'Medicamentos gratuitos pelo SUS',
        'Atendimento prioritário',
        'Tratamento multidisciplinar'
      ],
      requirements: 'Cartão SUS e encaminhamentos médicos',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: FileText,
      title: 'Isenções e Benefícios Fiscais',
      description: 'Diversos benefícios fiscais e isenções disponíveis para famílias.',
      details: [
        'Isenção de IPVA para veículo adaptado',
        'Isenção de IPI na compra de veículo',
        'Desconto na conta de energia elétrica',
        'Passe livre no transporte público',
        'Dedução no Imposto de Renda para gastos médicos'
      ],
      requirements: 'Laudo médico específico para cada benefício',
      color: 'from-purple-500 to-violet-500'
    }
  ];

  const importantContacts = [
    {
      name: 'INSS - Agendamento',
      phone: '135',
      description: 'Para agendar perícias e solicitar benefícios'
    },
    {
      name: 'Ouvidoria Nacional de Direitos Humanos',
      phone: '100',
      description: 'Denúncias e orientações sobre direitos'
    },
    {
      name: 'Central de Atendimento da Mulher',
      phone: '180',
      description: 'Apoio e orientação para mães em situação vulnerável'
    }
  ];

  const documents = [
    'Certidão de nascimento da criança',
    'CPF e RG dos pais',
    'Laudo médico atualizado',
    'Relatórios de profissionais (psicólogo, fonoaudiólogo, etc.)',
    'Comprovante de renda familiar',
    'Comprovante de residência',
    'Cartão de vacinação atualizado'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Direitos e Benefícios</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conheça seus direitos e os benefícios disponíveis. Informações confiáveis 
            para ajudar você e sua família a acessar o que é seu por direito.
          </p>
        </div>

        {/* Important Alert */}
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Importante:</strong> As informações aqui são de caráter orientativo. 
            Para casos específicos, procure sempre o órgão competente ou um advogado especializado.
            Leis podem ser alteradas - sempre confirme informações atualizadas.
          </AlertDescription>
        </Alert>

        {/* Rights and Benefits */}
        <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-2 mb-12">
          {rights.map((right, index) => {
            const Icon = right.icon;
            return (
              <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-start mb-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${right.color} mr-4 flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {right.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {right.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">O que inclui:</h4>
                    <ul className="space-y-2">
                      {right.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Como solicitar:</h4>
                    <p className="text-gray-700 text-sm">{right.requirements}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Documents Section */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-blue-500 mr-4" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Documentos Importantes
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Mantenha sempre organizados os documentos abaixo. Eles são frequentemente solicitados 
              para acessar benefícios e serviços.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm">{doc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Contacts */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <Phone className="w-8 h-8 mr-4" />
              <h2 className="text-2xl font-semibold">Contatos Importantes</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {importantContacts.map((contact, index) => (
                <div key={index} className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <h4 className="font-semibold mb-2">{contact.name}</h4>
                  <p className="text-2xl font-bold mb-2">{contact.phone}</p>
                  <p className="text-sm opacity-90">{contact.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Precisa de Ajuda Jurídica?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Se você está enfrentando dificuldades para acessar seus direitos ou precisa de 
              orientação jurídica especializada, existem recursos disponíveis.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-700 mb-2">Defensoria Pública</h4>
                <p className="text-green-600 text-sm">
                  Atendimento jurídico gratuito para famílias de baixa renda
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-700 mb-2">OAB - Assistência Judiciária</h4>
                <p className="text-blue-600 text-sm">
                  Advogados voluntários para casos específicos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DireitosBeneficios;