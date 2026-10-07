import type { Messages } from "./types";

const messages: Messages = {
  nav: {
    spinTheWheel: "Girar la ruleta",
    browseRecipes: "Ver recetas",
    planYourWeek: "Planifica tu semana",
    shoppingList: "Lista de compras",
    cookFromFridge: "Cocina con tu nevera",
    communityRecipes: "Recetas de la comunidad",
    suggestARecipe: "Sugerir una receta",
    games: "Juegos",
    blog: "Blog",
    myFavorites: "Mis favoritos",
    myProfile: "Mi perfil",
    about: "Acerca de",
    contact: "Contacto",
    munchlyGroup: "Munchly",
    accountGroup: "Tu cuenta",
    infoGroup: "Información",
  },
  hero: {
    headline: "¿No sabes qué comer? Gira y decide.",
    subhead:
      "Elige un estado de ánimo, gira la ruleta y Munchly te sugiere una comida real con su receta. Nada de buscar en cien pestañas mientras te da más hambre.",
    spinTheWheel: "Girar la ruleta →",
    browseRecipes: "Ver recetas",
    planYourWeek: "Planifica tu semana",
    suggestARecipe: "Sugerir una receta",
    playFoodGames: "Jugar juegos de comida",
    readTheBlog: "Leer el blog",
    freeToUse: "Gratis. No necesitas cuenta para girar.",
  },
  search: {
    placeholder: "Buscar recetas, artículos, juegos, páginas...",
    hint: "Escribe al menos 2 caracteres para buscar en todo el sitio.",
    searching: "Buscando...",
    noResults: "Sin resultados para “{query}”.",
    close: "Esc",
    ariaLabel: "Buscar en Munchly",
    groupRecipes: "Recetas",
    groupPosts: "Artículos del blog",
    groupGames: "Juegos",
    groupPages: "Páginas",
  },
  blogSection: {
    title: "Desde el blog",
    subtitle: "Recetas, notas de cocina e historias culinarias, recién salidas del fuego.",
    readMore: "Leer el blog →",
  },
  gamesSection: {
    title: "Jugar juegos de comida",
    subtitle:
      "Cuatro juegos rápidos para cuando necesites un descanso de decidir qué cenar. Gratis, sin necesidad de cuenta.",
    seeAll: "Ver todos los juegos →",
  },
  localeSwitcher: {
    label: "Idioma",
  },
  common: {
    backToMunchly: "← Volver a Munchly",
  },
  recipesPage: {
    title: "Todas las recetas",
    countOne: "{count} receta en la biblioteca por ahora.",
    countOther: "{count} recetas en la biblioteca por ahora.",
    empty: "Aún no hay recetas — vuelve pronto.",
  },
  recipeDetailPage: {
    ingredients: "Ingredientes",
    instructions: "Instrucciones",
  },
  gamesPage: {
    title: "Juegos",
    subtitle: "Pequeños juegos de comida para cuando necesites un descanso de decidir qué cenar. No se necesita cuenta.",
    play: "Jugar",
  },
  aboutPage: {
    title: "Sobre Munchly",
    paragraph1: "Munchly nació de un problema muy común: parado frente al refrigerador cada noche, sin hambre de “nada en particular” y sin ganas de tomar ni una sola decisión al respecto. Así que, en lugar de otro sitio de recetas para desplazarte sin fin, Munchly se construyó alrededor de un solo botón: gira la rueda, obtén una respuesta, ve a comer.",
    paragraph2: "A partir de ahí, se ha convertido también en un pequeño conjunto de herramientas para el resto de la semana: explora toda la biblioteca de recetas cuando quieras elegir algo tú mismo, planifica tus comidas para la semana, convierte ese plan directamente en una lista de compras y descubre qué puedes cocinar con lo que ya tienes en el refrigerador.",
    paragraph3Before: "Munchly es un proyecto independiente que sigue creciendo. Lo construye una sola persona, así que las nuevas recetas y funciones aparecen poco a poco en lugar de todas a la vez. Si hay algo que te encantaría ver a continuación, la ",
    contactLink: "página de contacto",
    paragraph3After: " va directo a una bandeja de entrada real, no a un formulario que desaparece en el vacío.",
  },
  contactPage: {
    title: "Ponte en contacto",
    subtitle: "¿Encontraste un error, tienes una receta que sugerir o solo quieres saludar? Llega a una persona real.",
    emailLabel: "Correo electrónico",
    note: "Munchly lo gestiona una sola persona, así que las respuestas no son instantáneas, pero cada mensaje se lee.",
  },
};

export default messages;
