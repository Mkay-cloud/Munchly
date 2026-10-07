import type { Messages } from "./types";

const messages: Messages = {
  nav: {
    spinTheWheel: "Girar a roda",
    browseRecipes: "Ver receitas",
    planYourWeek: "Planeje sua semana",
    shoppingList: "Lista de compras",
    cookFromFridge: "Cozinhe com sua geladeira",
    communityRecipes: "Receitas da comunidade",
    suggestARecipe: "Sugerir uma receita",
    games: "Jogos",
    blog: "Blog",
    myFavorites: "Meus favoritos",
    myProfile: "Meu perfil",
    about: "Sobre",
    contact: "Contato",
    munchlyGroup: "Munchly",
    accountGroup: "Sua conta",
    infoGroup: "Informações",
  },
  hero: {
    headline: "Não sabe o que comer? Gire e decida.",
    subhead:
      "Escolha um humor, gire a roda, e o Munchly sugere uma refeição de verdade com a receita. Chega de rolar cem abas enquanto a fome aumenta.",
    spinTheWheel: "Girar a roda →",
    browseRecipes: "Ver receitas",
    planYourWeek: "Planeje sua semana",
    suggestARecipe: "Sugerir uma receita",
    playFoodGames: "Jogar jogos de comida",
    readTheBlog: "Ler o blog",
    freeToUse: "Grátis. Não precisa de conta para girar.",
  },
  search: {
    placeholder: "Buscar receitas, posts do blog, jogos, páginas...",
    hint: "Digite ao menos 2 caracteres para buscar em todo o site.",
    searching: "Buscando...",
    noResults: "Nenhum resultado para “{query}”.",
    close: "Esc",
    ariaLabel: "Buscar no Munchly",
    groupRecipes: "Receitas",
    groupPosts: "Posts do blog",
    groupGames: "Jogos",
    groupPages: "Páginas",
  },
  blogSection: {
    title: "Do blog",
    subtitle: "Receitas, notas de cozinha e histórias culinárias, direto do fogão.",
    readMore: "Ler o blog →",
  },
  gamesSection: {
    title: "Jogar jogos de comida",
    subtitle:
      "Quatro jogos rápidos para quando você precisar de uma pausa na hora de decidir o jantar. Grátis, sem necessidade de conta.",
    seeAll: "Ver todos os jogos →",
  },
  localeSwitcher: {
    label: "Idioma",
  },
  common: {
    backToMunchly: "← Voltar ao Munchly",
  },
  recipesPage: {
    title: "Todas as receitas",
    countOne: "{count} receita na biblioteca até agora.",
    countOther: "{count} receitas na biblioteca até agora.",
    empty: "Ainda não há receitas — volte em breve.",
  },
  recipeDetailPage: {
    ingredients: "Ingredientes",
    instructions: "Modo de preparo",
  },
  gamesPage: {
    title: "Jogos",
    subtitle: "Pequenos jogos sobre comida para quando você precisar de uma pausa de decidir o que jantar. Sem necessidade de conta.",
    play: "Jogar",
  },
  aboutPage: {
    title: "Sobre o Munchly",
    paragraph1: "O Munchly nasceu de um problema bem comum: parado na frente da geladeira todas as noites, sem fome de “nada em especial”, e sem vontade de tomar nenhuma decisão sobre isso. Então, em vez de mais um site de receitas para rolar sem fim, o Munchly foi construído em torno de um único botão: gire a roda, receba uma resposta, vá comer.",
    paragraph2: "A partir daí, cresceu também para um pequeno conjunto de ferramentas para o resto da semana — explore toda a biblioteca de receitas quando quiser escolher algo você mesmo, planeje suas refeições para a semana, transforme esse plano direto em lista de compras e veja o que dá para cozinhar com o que já tem na geladeira.",
    paragraph3Before: "O Munchly é um projeto independente, ainda em crescimento. É construído por uma única pessoa, então novas receitas e funcionalidades aparecem aos poucos, não tudo de uma vez. Se há algo que você adoraria ver a seguir, a ",
    contactLink: "página de contato",
    paragraph3After: " vai direto para uma caixa de entrada de verdade, não para um formulário que desaparece no vazio.",
  },
  contactPage: {
    title: "Entre em contato",
    subtitle: "Encontrou um bug, tem uma receita para sugerir, ou só quer dizer oi? Chega até uma pessoa de verdade.",
    emailLabel: "E-mail",
    note: "O Munchly é administrado por uma única pessoa, então as respostas não são instantâneas — mas toda mensagem é lida.",
  },
};

export default messages;
