// Material de estudo para corretores: objeções comuns e caminhos para conduzir a conversa.
// São modelos para cada um adaptar ao próprio jeito; a gerência revisa e complementa.
// Princípio: o cliente só cede quando enxerga a vantagem para ele.

export const TEMAS = {
  contato: "Primeiro contato",
  material: "Material e reunião",
  credito: "Documentos e crédito",
  decisao: "Decisão",
  investimento: "Litoral e alto padrão",
};

export const OBJECOES = [
  {
    id: "agora-nao-posso",
    tema: "contato",
    frase: "Agora não posso falar.",
    porTras: "Na maioria das vezes é falta de tempo de verdade, não falta de interesse: ele se cadastrou há pouco.",
    caminho: [
      "Seja rápido: nome, Place Brokers e o empreendimento em uma frase.",
      "Não insista na apresentação; o objetivo é sair com um horário marcado.",
      "Ofereça duas opções de horário em vez de perguntar \"quando pode?\".",
      "Marque o lembrete no app na hora, para não depender da memória.",
    ],
    exemplo: "Sem problema! Sou o João, da Place, sobre o cadastro do Araçá Prime. Fica melhor eu te ligar hoje às 18h ou amanhã às 9h?",
  },
  {
    id: "so-pesquisando",
    tema: "contato",
    frase: "Estou só pesquisando.",
    porTras: "Ele ainda não confia em quem está ligando e não quer se sentir pressionado.",
    caminho: [
      "Concorde: pesquisar é o certo antes de uma compra grande.",
      "Mostre que você ajuda a pesquisar melhor, não que quer vender agora.",
      "Faça perguntas abertas: o que chamou atenção no anúncio, onde mora hoje, para quem é o imóvel.",
      "Proponha uma conversa curta para ele comparar com mais informação.",
    ],
    exemplo: "Faz todo sentido. Meu papel é justamente te ajudar a comparar: a Place trabalha com várias construtoras. O que mais pesou para você se cadastrar nesse?",
  },
  {
    id: "manda-tudo-whatsapp",
    tema: "material",
    frase: "Me manda tudo pelo WhatsApp que eu olho.",
    porTras: "É a forma mais confortável para ele, mas com tudo na mão ele compara só por preço e fecha com quem estiver na frente.",
    caminho: [
      "Não negue de forma seca: mande algo que gere desejo (uma ou duas fotos, o essencial).",
      "Explique que tabela e condição dependem do perfil dele; por isso a conversa vale mais que um PDF.",
      "Mostre a vantagem para ele: sair da reunião sabendo parcela e entrada reais, não estimadas.",
      "Feche com horário: presencial de preferência, online se for o que dá.",
    ],
    exemplo: "Te mando umas fotos agora pra você sentir o empreendimento. A tabela muda conforme renda e entrada, então em 20 minutos eu te mostro a condição que vale pra você. Quinta às 18h no escritório ou prefere online?",
  },
  {
    id: "ja-tenho-corretor",
    tema: "contato",
    frase: "Já estou sendo atendido por outro corretor.",
    porTras: "Ele se cadastrou em vários anúncios; quem passar mais segurança e souber mais leva.",
    caminho: [
      "Respeite: não fale mal de outro profissional.",
      "Destaque o que é diferente: a Place tem vários empreendimentos e construtoras, então dá para comparar opções.",
      "Ofereça algo concreto (uma simulação, uma visita, outra opção parecida na mesma faixa).",
    ],
    exemplo: "Que bom que você já está bem acompanhado. Se quiser uma segunda opinião, eu consigo te mostrar esse e mais dois parecidos na mesma faixa, pra você ter certeza de que está fazendo a melhor escolha.",
  },
  {
    id: "documentos",
    tema: "credito",
    frase: "Vou ter que mandar documento? Ir no RH pegar contracheque?",
    porTras: "Ninguém gosta de mandar documento sem saber por quê. Ele só manda quando enxerga a vantagem.",
    caminho: [
      "Nunca peça documento sem explicar para que serve.",
      "Mostre com uma simulação: a renda considerada muda a faixa, o subsídio e a parcela.",
      "Compare dois cenários de renda na frente dele; a diferença de subsídio e de parcela convence mais que qualquer argumento.",
      "Deixe claro que, vendo os documentos antes, você orienta a comprovação de renda do jeito certo e ele não perde benefício por erro de documentação.",
      "Depois da aprovação, a condição fica definida; por isso o momento de orientar é antes.",
    ],
    exemplo: "Deixa eu te mostrar uma coisa: com renda de R$ 2.500 a simulação fica assim; com R$ 3.500 o subsídio cai e a parcela sobe. Por isso eu preciso ver seus contracheques antes de rodar a análise: pra comprovar sua renda do jeito certo e você não sair pagando mais por um erro de documento. Quantos você consegue me mandar hoje?",
  },
  {
    id: "nome-sujo",
    tema: "credito",
    frase: "Meu nome está sujo, não vai dar.",
    porTras: "Vergonha ou medo de ouvir um não. Muitas vezes a situação tem saída.",
    caminho: [
      "Acolha sem julgamento e sem prometer aprovação.",
      "Explique que a análise de crédito mostra o cenário real e o que precisa ser resolvido.",
      "Se for o caso, ajude com um caminho: regularizar, compor renda com alguém da família, planejar para um momento próximo.",
    ],
    exemplo: "Isso é mais comum do que parece e nem sempre impede. Fazendo a análise, a gente vê exatamente o que precisa resolver e em quanto tempo. Posso te explicar como funciona?",
  },
  {
    id: "sem-entrada",
    tema: "credito",
    frase: "Não tenho dinheiro para entrada.",
    porTras: "Ele imagina uma entrada grande à vista, como em imóvel usado.",
    caminho: [
      "Explique que no lançamento a entrada costuma ser parcelada durante a obra.",
      "Lembre do FGTS e, no MCMV, do subsídio, quando ele tiver direito.",
      "Leve para a simulação: o número real costuma ser menor que o medo dele.",
    ],
    exemplo: "No lançamento a entrada normalmente é dividida durante a obra, e dá pra usar FGTS. Fazendo a simulação com a sua renda, eu te mostro quanto fica por mês.",
  },
  {
    id: "vou-pensar",
    tema: "decisao",
    frase: "Vou pensar.",
    porTras: "Quase sempre existe uma dúvida que ele não falou: valor, local, prazo ou confiança.",
    caminho: [
      "Concorde e pergunte o que ainda pesa na decisão.",
      "Resolva a dúvida real, não a frase.",
      "Combine um próximo passo com data, e marque o lembrete.",
    ],
    exemplo: "Claro, é uma decisão importante. Pra eu te ajudar a pensar: o que ainda te deixa em dúvida, o valor, a localização ou o prazo de entrega?",
  },
  {
    id: "falar-com-familia",
    tema: "decisao",
    frase: "Preciso conversar com meu marido / minha esposa.",
    porTras: "A decisão é da família; quem não participou da conversa tende a dizer não.",
    caminho: [
      "Valorize: decisão de casa é a dois.",
      "Convide os dois para a próxima conversa ou visita.",
      "Evite que ele tenha que \"vender\" o imóvel sozinho em casa.",
    ],
    exemplo: "Com certeza, é decisão de vocês dois. Que tal a gente marcar uma conversa com os dois juntos? Assim eu tiro as dúvidas dele também. Sábado de manhã fica bom?",
  },
  {
    id: "esta-caro",
    tema: "decisao",
    frase: "Está caro. Vi mais barato.",
    porTras: "Ele está comparando valor total, sem considerar local, prazo, condição de pagamento e o que vem incluso.",
    caminho: [
      "Pergunte qual foi a comparação: local, metragem, prazo e condição.",
      "Mostre o que muda no dia a dia e no valor de revenda.",
      "Se a faixa não cabe, ofereça outra opção do catálogo da Place, sem forçar.",
    ],
    exemplo: "Entendo. Me conta qual foi a outra opção? Às vezes a diferença está na localização ou na forma de pagamento. E se a ideia for gastar menos, eu tenho outros empreendimentos nessa região que podem encaixar melhor.",
  },
  {
    id: "vale-investir",
    tema: "investimento",
    frase: "Não sei se vale a pena como investimento.",
    porTras: "No litoral e no alto padrão a decisão é racional: ele quer ver números e segurança.",
    caminho: [
      "Fale de rentabilidade com dados que você consegue sustentar (aluguel de temporada da região, valorização de lançamentos próximos).",
      "Compare com outros investimentos de forma honesta, sem prometer retorno.",
      "Mostre a solidez da construtora e o histórico de entregas.",
    ],
    exemplo: "Faz sentido olhar como investimento. Posso te mostrar quanto os flats da região rendem em temporada e como valorizaram os lançamentos vizinhos, pra você comparar com o que tem hoje.",
  },
];
