import type { Messages } from "./types";

const messages: Messages = {
  nav: {
    spinTheWheel: "أدر العجلة",
    browseRecipes: "تصفح الوصفات",
    planYourWeek: "خطط لأسبوعك",
    shoppingList: "قائمة التسوق",
    cookFromFridge: "اطبخ مما لديك في الثلاجة",
    communityRecipes: "وصفات المجتمع",
    suggestARecipe: "اقترح وصفة",
    games: "الألعاب",
    blog: "المدونة",
    myFavorites: "المفضلة",
    myProfile: "ملفي الشخصي",
    about: "من نحن",
    contact: "تواصل معنا",
    munchlyGroup: "Munchly",
    accountGroup: "حسابك",
    infoGroup: "معلومات",
  },
  hero: {
    headline: "لا تعرف ماذا تأكل؟ أدر العجلة.",
    subhead:
      "اختر مزاجًا، أدر العجلة، وسيقترح عليك Munchly وجبة حقيقية مع وصفتها. لا مزيد من التمرير عبر مئة تبويب وأنت تزداد جوعًا.",
    spinTheWheel: "أدر العجلة",
    browseRecipes: "تصفح الوصفات",
    planYourWeek: "خطط لأسبوعك",
    suggestARecipe: "اقترح وصفة",
    playFoodGames: "العب ألعاب الطعام",
    readTheBlog: "اقرأ المدونة",
    freeToUse: "مجاني. لا حاجة لحساب لتدور العجلة.",
  },
  search: {
    placeholder: "ابحث عن وصفات، مقالات المدونة، ألعاب، صفحات...",
    hint: "اكتب حرفين على الأقل للبحث في الموقع بأكمله.",
    searching: "جارٍ البحث...",
    noResults: "لا توجد نتائج لـ ”{query}“.",
    close: "Esc",
    ariaLabel: "البحث في Munchly",
    groupRecipes: "الوصفات",
    groupPosts: "مقالات المدونة",
    groupGames: "الألعاب",
    groupPages: "الصفحات",
  },
  blogSection: {
    title: "من المدونة",
    subtitle: "وصفات وملاحظات مطبخ وقصص طبخ، طازجة من الموقد.",
    readMore: "اقرأ المدونة",
  },
  gamesSection: {
    title: "العب ألعاب الطعام",
    subtitle:
      "أربع ألعاب سريعة لوقت تحتاج فيه استراحة من التفكير في العشاء. مجانية، دون الحاجة لحساب.",
    seeAll: "عرض كل الألعاب",
  },
  localeSwitcher: {
    label: "اللغة",
  },
  common: {
    backToMunchly: "← العودة إلى Munchly",
  },
  recipesPage: {
    title: "كل الوصفات",
    countOne: "{count} وصفة في المكتبة حتى الآن.",
    countOther: "{count} وصفة في المكتبة حتى الآن.",
    empty: "لا توجد وصفات بعد — تحقق مرة أخرى قريبًا.",
  },
  recipeDetailPage: {
    ingredients: "المكونات",
    instructions: "طريقة التحضير",
  },
  gamesPage: {
    title: "الألعاب",
    subtitle: "ألعاب طعام صغيرة وسريعة لوقت تحتاج فيه إلى استراحة من التفكير في العشاء. لا حاجة لحساب.",
    play: "العب",
  },
  aboutPage: {
    title: "عن Munchly",
    paragraph1: "بدأ Munchly من مشكلة عادية جدًا: الوقوف أمام الثلاجة كل ليلة، دون رغبة في أي شيء محدد، ودون الرغبة في اتخاذ أي قرار بشأن ذلك. لذا بدلاً من موقع وصفات آخر للتمرير فيه بلا نهاية، بُني Munchly حول زر واحد: أدر العجلة، احصل على إجابة، اذهب لتناول الطعام.",
    paragraph2: "ومن هناك، تطور ليصبح مجموعة أدوات صغيرة لبقية الأسبوع أيضًا — تصفح مكتبة الوصفات كاملة عندما تريد الاختيار بنفسك، خطط لوجباتك للأسبوع القادم، حوّل تلك الخطة مباشرة إلى قائمة تسوق، واكتشف ما يمكنك طهيه مما هو موجود بالفعل في ثلاجتك.",
    paragraph3Before: "Munchly مشروع مستقل ولا يزال في طور النمو. يبنيه شخص واحد، لذا تظهر الوصفات والميزات الجديدة على خطوات صغيرة وليس دفعة واحدة. إذا كان هناك شيء تود رؤيته لاحقًا، فإن ",
    contactLink: "صفحة التواصل",
    paragraph3After: " تصل مباشرة إلى بريد إلكتروني حقيقي، وليس إلى نموذج يختفي في الفراغ.",
  },
  contactPage: {
    title: "تواصل معنا",
    subtitle: "هل وجدت خطأ، أو لديك وصفة لاقتراحها، أو تريد فقط إلقاء التحية؟ ستصل إلى شخص حقيقي.",
    emailLabel: "البريد الإلكتروني",
    note: "يدير Munchly شخص واحد، لذا الردود ليست فورية — لكن كل رسالة تُقرأ.",
  },
};

export default messages;
