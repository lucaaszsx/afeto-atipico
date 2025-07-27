
import { Sparkles, Heart, Smile, Moon, BookOpen, Coffee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EspacoCuidado = () => {
  const careResources = [
    {
      icon: Heart,
      title: 'Práticas de Autocompaixão',
      description: 'Exercícios simples para cultivar gentileza consigo mesma nos momentos difíceis.',
      content: [
        'Reconheça que você está fazendo o seu melhor',
        'Trate-se com a gentileza que ofereceria a uma amiga querida',
        'Lembre-se: ser mãe perfeita não existe, ser mãe suficiente é o bastante'
      ],
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Moon,
      title: 'Rituais de Relaxamento',
      description: 'Técnicas para encontrar momentos de paz mesmo na rotina mais corrida.',
      content: [
        'Respiração profunda: 4 segundos inspirando, 6 segundos expirando',
        'Banho relaxante com música suave ao final do dia',
        '5 minutos de meditação guiada (aplicativos: Calm, Headspace)',
        'Alongamento leve antes de dormir'
      ],
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: Coffee,
      title: 'Micro-pausas no Dia',
      description: 'Pequenos momentos para recarregar as energias durante a rotina.',
      content: [
        'Tome seu café ou chá com atenção plena',
        'Olhe pela janela por 2 minutos e respire',
        'Escute uma música que te acalma',
        'Faça um carinho no seu animal de estimação',
        'Escreva 3 coisas pelas quais é grata hoje'
      ],
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Smile,
      title: 'Rede de Apoio',
      description: 'Como construir e manter relações que te fortalecem.',
      content: [
        'Identifique pessoas em quem pode confiar',
        'Peça ajuda quando precisar - não é sinal de fraqueza',
        'Mantenha contato regular com amigas e família',
        'Participe de grupos de mães (online ou presenciais)',
        'Aceite ofertas de ajuda de vizinhos e conhecidos'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: BookOpen,
      title: 'Desenvolvimento Pessoal',
      description: 'Recursos para continuar crescendo e aprendendo sobre si mesma.',
      content: [
        'Leia 10 minutos por dia sobre temas que te interessam',
        'Faça um curso online sobre algo que sempre quis aprender',
        'Escreva em um diário sobre seus sentimentos',
        'Defina uma meta pequena e alcançável para o mês',
        'Celebre suas conquistas, por menores que sejam'
      ],
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  const quickTips = [
    'Respire fundo antes de reagir a situações estressantes',
    'É normal ter dias difíceis - eles não definem quem você é como mãe',
    'Peça ajuda profissional quando sentir que precisa',
    'Sua saúde mental é tão importante quanto a do seu filho',
    'Pequenos cuidados diários fazem grande diferença',
    'Você está fazendo um trabalho incrível, mesmo quando não parece'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Espaço de Cuidado</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Recursos especiais para cuidar de quem cuida. Porque sua saúde e bem-estar 
            também importam nesta jornada.
          </p>
        </div>

        {/* Quick Tips Banner */}
        <Card className="mb-12 border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <Heart className="w-6 h-6 mr-3" />
              <h2 className="text-xl font-semibold">Lembretes Carinhosos</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickTips.map((tip, index) => (
                <div key={index} className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Care Resources */}
        <div className="grid gap-8 lg:grid-cols-2 justify-center w-fit mx-auto">
          {careResources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className={`flex items-center justify-center w-10 h-10 aspect-square rounded-xl bg-gradient-to-r ${resource.color} mr-4`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {resource.description}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {resource.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 bg-gradient-to-r ${resource.color} rounded-full mt-2 flex-shrink-0`}></div>
                        <span className="text-gray-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Emergency Resources */}
        <Card className="mt-12 border-0 shadow-lg bg-gradient-to-r from-red-500 to-pink-500 text-white">
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-semibold mb-4">
              Quando Precisar de Ajuda Profissional
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-3xl mx-auto">
              Se você está se sentindo sobrecarregada, ansiosa ou triste na maior parte dos dias, 
              não hesite em buscar ajuda profissional. Cuidar da sua saúde mental é fundamental.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="font-semibold mb-2">Centro de Valorização da Vida</h4>
                <p className="text-sm">📞 188 (gratuito, 24h)</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="font-semibold mb-2">SUS - Rede de Atenção Psicossocial</h4>
                <p className="text-sm">Procure a UBS mais próxima</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="font-semibold mb-2">Terapia Online</h4>
                <p className="text-sm">Psicólogos especializados em maternidade</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encouragement Section */}
        <div className="text-center mt-12 py-12">
          <div className="max-w-2xl mx-auto">
            <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Você é mais forte do que imagina
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Cada dia que você acorda e cuida do seu filho com amor é uma vitória. 
              Permita-se ter momentos de descanso, peça ajuda quando precisar e lembre-se: 
              você não está sozinha nesta jornada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EspacoCuidado;
