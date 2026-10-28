// Conteúdos mockados. Quando houver API, este arquivo some e o service passa a buscar do back-end.
// Imagens: coloque em public/conteudos/<id>.jpg (se não existir, aparece o degradê da categoria).
// quiz[].correta = índice (0-based) da alternativa correta.

export const conteudos = [
    {
      id: 'reciclagem-domestica',
      titulo: 'Guia de Reciclagem Doméstica',
      categoria: 'Reciclagem',
      minutos: 8,
      xp: 50,
      imagem: '/conteudos/reciclagem-domestica.jpg',
      revisao: {
        resumo:
          'Reciclar em casa começa na separação correta. Com poucos hábitos, você evita que materiais aproveitáveis acabem no aterro.',
        pontos: [
          'Separe o lixo em secos (papel, plástico, vidro, metal) e orgânicos (restos de comida).',
          'As cores das lixeiras seguem um padrão nacional: azul para papel, vermelho para plástico, verde para vidro, amarelo para metal e marrom para orgânicos.',
          'Enxágue as embalagens rapidamente antes de descartar; não precisa deixá-las impecáveis.',
          'Itens sujos de gordura, papel higiênico e guardanapos usados não são recicláveis.',
        ],
      },
      quiz: [
        {
          pergunta: 'Em qual cor de lixeira devem ser descartados os restos de alimentos?',
          opcoes: ['Azul', 'Verde', 'Marrom', 'Amarela'],
          correta: 2,
          explicacao: 'Restos de alimentos são orgânicos e vão na lixeira marrom, ou para a composteira.',
        },
        {
          pergunta: 'Qual cor identifica a lixeira de vidro?',
          opcoes: ['Verde', 'Vermelha', 'Azul', 'Preta'],
          correta: 0,
          explicacao: 'O padrão é: verde para vidro, azul para papel, vermelho para plástico e amarelo para metal.',
        },
        {
          pergunta: 'Qual destes itens NÃO é reciclável?',
          opcoes: ['Lata de refrigerante', 'Garrafa PET lavada', 'Papel engordurado de pizza', 'Caixa de papelão limpa'],
          correta: 2,
          explicacao: 'A gordura contamina o papel e inviabiliza a reciclagem. Papelão limpo e seco é aproveitado.',
        },
      ],
    },
    {
      id: 'energia-solar',
      titulo: 'Energia Solar: Como Funciona',
      categoria: 'Energia',
      minutos: 12,
      xp: 75,
      imagem: '/conteudos/energia-solar.jpg',
      revisao: {
        resumo:
          'A energia solar fotovoltaica transforma a luz do sol em eletricidade, sem emitir gases de efeito estufa durante a geração.',
        pontos: [
          'Os painéis fotovoltaicos convertem a luz solar em corrente contínua.',
          'O inversor transforma essa corrente contínua em corrente alternada, que é a usada nas casas.',
          'Em sistemas conectados à rede, o que você não consome vira créditos de energia com a distribuidora.',
          'Em dias nublados os painéis ainda geram energia, mas em menor quantidade.',
        ],
      },
      quiz: [
        {
          pergunta: 'Qual equipamento transforma a corrente contínua dos painéis em corrente alternada?',
          opcoes: ['Inversor', 'Bateria', 'Disjuntor', 'Transformador de poste'],
          correta: 0,
          explicacao: 'O inversor faz essa conversão para que a energia possa ser usada nos aparelhos da casa.',
        },
        {
          pergunta: 'O que acontece com a energia excedente em um sistema conectado à rede?',
          opcoes: ['É perdida', 'Vira créditos com a distribuidora', 'Aquece os painéis', 'É devolvida ao sol'],
          correta: 1,
          explicacao: 'O excedente é injetado na rede e abatido da conta nos meses seguintes, como créditos.',
        },
        {
          pergunta: 'Os painéis fotovoltaicos geram eletricidade a partir de quê?',
          opcoes: ['Do vento', 'Da luz do sol', 'Da água da chuva', 'Do calor do solo'],
          correta: 1,
          explicacao: 'O efeito fotovoltaico transforma a luz solar diretamente em eletricidade.',
        },
      ],
    },
    {
      id: 'alimentacao-sustentavel',
      titulo: 'Alimentação Sustentável no Dia a Dia',
      categoria: 'Alimentação',
      minutos: 6,
      xp: 50,
      imagem: '/conteudos/alimentacao-sustentavel.jpg',
      revisao: {
        resumo:
          'O que colocamos no prato tem impacto ambiental. Pequenas escolhas na compra e no preparo já reduzem o desperdício e as emissões.',
        pontos: [
          'Prefira alimentos in natura e da estação: costumam ser mais frescos, baratos e exigir menos insumos.',
          'Planeje as compras e o cardápio para evitar que comida estrague.',
          'Aproveite talos, cascas e folhas em receitas.',
          'Reduzir o consumo de carne bovina diminui emissões, uso de água e de terra.',
        ],
      },
      quiz: [
        {
          pergunta: 'Qual é uma vantagem de comprar alimentos da estação?',
          opcoes: ['Duram para sempre', 'Costumam ser mais frescos e baratos', 'Não precisam de lavagem', 'Vêm sempre embalados'],
          correta: 1,
          explicacao: 'Alimentos da estação são produzidos em época adequada, com menos insumos e custo menor.',
        },
        {
          pergunta: 'Qual atitude ajuda a reduzir o desperdício de comida?',
          opcoes: ['Comprar sem lista', 'Planejar o cardápio e a lista de compras', 'Descartar cascas e talos', 'Cozinhar sempre em grande quantidade'],
          correta: 1,
          explicacao: 'Planejar evita comprar mais do que o necessário e reduz o que estraga na geladeira.',
        },
        {
          pergunta: 'Por que reduzir o consumo de carne bovina é considerado sustentável?',
          opcoes: ['Porque a pecuária bovina tem alto impacto em emissões, água e terra', 'Porque a carne é cara', 'Porque o gado não gera resíduos', 'Porque não há impacto ambiental'],
          correta: 0,
          explicacao: 'A pecuária bovina está entre as atividades alimentares com maior pegada de carbono e uso de recursos.',
        },
      ],
    },
    {
      id: 'consumo-consciente-agua',
      titulo: 'Consumo Consciente de Água',
      categoria: 'Água',
      minutos: 9,
      xp: 60,
      imagem: '/conteudos/consumo-consciente-agua.jpg',
      revisao: {
        resumo:
          'A água potável é um recurso limitado. Pequenas mudanças de hábito dentro de casa fazem uma grande diferença no consumo.',
        pontos: [
          'Feche a torneira ao escovar os dentes e ao ensaboar a louça.',
          'Banhos mais curtos economizam muita água e energia.',
          'Vazamentos e torneiras pingando desperdiçam bastante água ao longo do dia: conserte logo.',
          'Água da chuva e da máquina de lavar pode ser reaproveitada para limpeza e rega.',
        ],
      },
      quiz: [
        {
          pergunta: 'Qual atitude economiza mais água ao escovar os dentes?',
          opcoes: ['Deixar a torneira aberta', 'Fechar a torneira enquanto escova', 'Escovar no chuveiro ligado', 'Usar água quente'],
          correta: 1,
          explicacao: 'Fechar a torneira evita que a água corra sem uso durante a escovação.',
        },
        {
          pergunta: 'A água da chuva captada pode ser reaproveitada para quê?',
          opcoes: ['Beber sem tratamento', 'Lavar quintal e regar plantas', 'Preparar alimentos', 'Encher piscina de bebê'],
          correta: 1,
          explicacao: 'Sem tratamento, ela serve para usos não potáveis, como limpeza e jardinagem.',
        },
        {
          pergunta: 'Por que consertar pequenos vazamentos é importante?',
          opcoes: ['Porque fazem barulho', 'Porque gotejar não gasta água', 'Porque o desperdício acumulado ao longo do dia é grande', 'Porque a água fica suja'],
          correta: 2,
          explicacao: 'Mesmo um gotejamento pequeno soma muitos litros desperdiçados por dia.',
        },
      ],
    },
    {
      id: 'compostagem-em-casa',
      titulo: 'Compostagem em Casa',
      categoria: 'Reciclagem',
      minutos: 15,
      xp: 90,
      imagem: '/conteudos/compostagem-em-casa.jpg',
      revisao: {
        resumo:
          'A compostagem transforma restos orgânicos em adubo rico em nutrientes, reduzindo o lixo que vai para o aterro.',
        pontos: [
          'Misture materiais "verdes" (cascas de frutas e verduras, borra de café) com "marrons" (folhas secas, serragem).',
          'Evite carnes, laticínios, óleo e fezes de animais: atraem pragas e geram mau cheiro.',
          'Mantenha o composto úmido, como uma esponja torcida, e revire de vez em quando para entrar ar.',
          'Se cheirar mal, geralmente está úmido demais: adicione material seco e revire.',
        ],
      },
      quiz: [
        {
          pergunta: 'Qual item NÃO deve ir para a composteira doméstica?',
          opcoes: ['Cascas de frutas', 'Borra de café', 'Restos de carne', 'Folhas secas'],
          correta: 2,
          explicacao: 'Carnes atraem pragas e causam mau cheiro, por isso ficam fora da composteira doméstica.',
        },
        {
          pergunta: 'Folhas secas e serragem fornecem principalmente o quê ao composto?',
          opcoes: ['Carbono', 'Água', 'Sal', 'Gordura'],
          correta: 0,
          explicacao: 'Os materiais "marrons" são ricos em carbono e equilibram os restos úmidos de cozinha.',
        },
        {
          pergunta: 'A composteira está com mau cheiro e muito úmida. O que fazer?',
          opcoes: ['Adicionar mais restos de comida', 'Fechar bem e não mexer', 'Adicionar material seco e revirar', 'Jogar água'],
          correta: 2,
          explicacao: 'Material seco absorve o excesso de umidade e revirar leva ar para o composto.',
        },
      ],
    },
    {
      id: 'mobilidade-urbana-sustentavel',
      titulo: 'Mobilidade Urbana Sustentável',
      categoria: 'Mobilidade',
      minutos: 10,
      xp: 65,
      imagem: '/conteudos/mobilidade-urbana-sustentavel.jpg',
      revisao: {
        resumo:
          'Como nos deslocamos pela cidade influencia a poluição, o trânsito e a qualidade de vida de todos.',
        pontos: [
          'Caminhar e pedalar não emitem poluentes e ainda fazem bem à saúde.',
          'O transporte coletivo leva muita gente em um só veículo, tirando carros das ruas.',
          'Carona solidária divide o carro entre pessoas que fazem o mesmo trajeto.',
          'Quanto menos carros com uma única pessoa, menos congestionamento e emissões.',
        ],
      },
      quiz: [
        {
          pergunta: 'Qual opção emite menos gases de efeito estufa por pessoa?',
          opcoes: ['Carro com uma pessoa', 'Moto', 'Bicicleta', 'Aplicativo de carro'],
          correta: 2,
          explicacao: 'A bicicleta não emite gases durante o uso e é uma das formas mais limpas de se locomover.',
        },
        {
          pergunta: 'O que é carona solidária?',
          opcoes: ['Alugar um carro', 'Dividir o carro com pessoas que fazem o mesmo trajeto', 'Andar sempre de ônibus', 'Pagar pedágio em dobro'],
          correta: 1,
          explicacao: 'Com mais pessoas por carro, há menos veículos nas ruas e menos emissões por pessoa.',
        },
        {
          pergunta: 'Por que o transporte coletivo ajuda as cidades?',
          opcoes: ['Aumenta o trânsito', 'Tira carros das ruas e reduz emissões', 'Gasta mais combustível por pessoa', 'Não faz diferença'],
          correta: 1,
          explicacao: 'Um ônibus cheio substitui muitos carros, reduzindo congestionamento e poluição.',
        },
      ],
    },
    {
      id: 'biodiversidade-ecossistemas',
      titulo: 'Biodiversidade e Ecossistemas',
      categoria: 'Biodiversidade',
      minutos: 18,
      xp: 100,
      imagem: '/conteudos/biodiversidade-ecossistemas.jpg',
      revisao: {
        resumo:
          'Biodiversidade é a variedade de vida na Terra: espécies, genes e ecossistemas. Ela sustenta alimentos, água limpa e clima estável.',
        pontos: [
          'O Brasil tem 6 biomas terrestres: Amazônia, Cerrado, Mata Atlântica, Caatinga, Pampa e Pantanal.',
          'Polinizadores, como as abelhas, são essenciais para a produção de muitos alimentos.',
          'Desmatamento, poluição, espécies invasoras e mudanças climáticas ameaçam a biodiversidade.',
          'Cada espécie tem um papel no ecossistema, e perder uma pode afetar várias outras.',
        ],
      },
      quiz: [
        {
          pergunta: 'Quantos biomas terrestres existem no Brasil?',
          opcoes: ['3', '4', '6', '10'],
          correta: 2,
          explicacao: 'São seis: Amazônia, Cerrado, Mata Atlântica, Caatinga, Pampa e Pantanal.',
        },
        {
          pergunta: 'Qual é o principal papel das abelhas nos ecossistemas?',
          opcoes: ['Decomposição', 'Polinização', 'Purificação da água', 'Controle de chuvas'],
          correta: 1,
          explicacao: 'Ao transportar pólen entre flores, elas permitem a reprodução de muitas plantas e a produção de alimentos.',
        },
        {
          pergunta: 'Qual das opções é uma das principais ameaças à biodiversidade?',
          opcoes: ['Plantio de árvores nativas', 'Desmatamento e perda de habitat', 'Criação de parques', 'Coleta seletiva'],
          correta: 1,
          explicacao: 'Quando o habitat é destruído, as espécies perdem abrigo e alimento.',
        },
      ],
    },
    {
      id: 'eficiencia-energetica-em-casa',
      titulo: 'Eficiência Energética em Casa',
      categoria: 'Energia',
      minutos: 7,
      xp: 55,
      imagem: '/conteudos/eficiencia-energetica-em-casa.jpg',
      revisao: {
        resumo:
          'Usar energia de forma eficiente é fazer o mesmo com menos consumo. Isso reduz a conta de luz e o impacto ambiental.',
        pontos: [
          'Lâmpadas de LED consomem bem menos que as incandescentes e duram mais.',
          'O selo Procel indica aparelhos com melhor desempenho energético.',
          'Aproveite a luz natural durante o dia.',
          'Aparelhos em espera (standby) continuam consumindo energia: desligue-os da tomada quando possível.',
        ],
      },
      quiz: [
        {
          pergunta: 'Qual tipo de lâmpada é mais eficiente?',
          opcoes: ['Incandescente', 'LED', 'Halógena', 'Todas iguais'],
          correta: 1,
          explicacao: 'A lâmpada de LED gera a mesma luz com muito menos energia e tem maior vida útil.',
        },
        {
          pergunta: 'O que o selo Procel indica?',
          opcoes: ['Aparelho mais barato', 'Aparelho importado', 'Aparelho com melhor eficiência energética', 'Aparelho reciclado'],
          correta: 2,
          explicacao: 'O selo Procel ajuda o consumidor a escolher produtos que gastam menos energia.',
        },
        {
          pergunta: 'Qual atitude ajuda a economizar energia em casa?',
          opcoes: ['Deixar luzes acesas de dia', 'Manter aparelhos em standby', 'Aproveitar a luz natural', 'Abrir a geladeira várias vezes'],
          correta: 2,
          explicacao: 'Usar luz natural reduz o tempo de lâmpadas acesas e o consumo de energia.',
        },
      ],
    },
    {
      id: 'plantas-nativas-reflorestamento',
      titulo: 'Plantas Nativas e Reflorestamento',
      categoria: 'Biodiversidade',
      minutos: 11,
      xp: 70,
      imagem: '/conteudos/plantas-nativas-reflorestamento.jpg',
      revisao: {
        resumo:
          'Plantas nativas são as que surgem naturalmente em uma região. Elas são a base do reflorestamento porque já estão adaptadas ao local.',
        pontos: [
          'Espécies nativas se adaptam ao clima e ao solo e sustentam a fauna local.',
          'As matas ciliares protegem as margens de rios e nascentes contra erosão.',
          'Árvores absorvem gás carbônico da atmosfera durante a fotossíntese.',
          'No reflorestamento, escolha espécies do bioma da sua região.',
        ],
      },
      quiz: [
        {
          pergunta: 'Por que preferir plantas nativas no reflorestamento?',
          opcoes: ['São mais caras', 'Estão adaptadas ao local e sustentam a fauna', 'Crescem sem água', 'Não precisam de solo'],
          correta: 1,
          explicacao: 'Por serem da região, elas se adaptam melhor e oferecem alimento e abrigo aos animais locais.',
        },
        {
          pergunta: 'Qual é o papel das matas ciliares?',
          opcoes: ['Proteger margens de rios e nascentes', 'Atrair trânsito', 'Aumentar a poluição', 'Secar o solo'],
          correta: 0,
          explicacao: 'A vegetação nas margens segura o solo e evita o assoreamento dos rios.',
        },
        {
          pergunta: 'Como as árvores ajudam a combater as mudanças climáticas?',
          opcoes: ['Emitem gás carbônico', 'Absorvem gás carbônico da atmosfera', 'Aquecem o ar', 'Não influenciam o clima'],
          correta: 1,
          explicacao: 'Na fotossíntese, as árvores retiram CO₂ do ar e armazenam carbono.',
        },
      ],
    },
  ]