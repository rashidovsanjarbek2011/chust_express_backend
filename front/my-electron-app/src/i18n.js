import { createI18n } from 'vue-i18n'

const messages = {
  ru: {
    search: 'Поиск',
    categories: 'Категории',
    all: 'Все',
    products: 'Продукты',
    cart: 'Корзина',
    profile: 'Профиль',
    delivery_text: 'САМАЯ БЫСТРАЯ ДОСТАВКА',
    hero_title_1: 'Ваш',
    hero_title_2: 'Выбор',
    hero_subtitle: 'Качественные продукты из лучших ресторанов и магазинов теперь на расстоянии вытянутой руки.',
    start_shopping: 'Начать покупки',
    view_cart: 'Посмотреть корзину',
    items_found: 'продуктов найдено',
    no_results: 'Ничего не найдено по вашему запросу',
    items: 'продуктов',
    search_placeholder: 'Поиск...',
    active_search: 'ПОИСК'
  },
  en: {
    search: 'Search',
    categories: 'Categories',
    all: 'All',
    products: 'Products',
    cart: 'Cart',
    profile: 'Profile',
    delivery_text: 'FASTEST DELIVERY',
    hero_title_1: 'Your',
    hero_title_2: 'Choice',
    hero_subtitle: 'Quality products from the best restaurants and shops are now just a hand\'s reach away.',
    start_shopping: 'Start Shopping',
    view_cart: 'View Cart',
    items_found: 'items found',
    no_results: 'No results found for your search',
    items: 'items',
    search_placeholder: 'Search...',
    active_search: 'SEARCH'
  },
  uz: {
    search: 'Qidiruv',
    categories: 'Kategoriyalar',
    all: 'Barchasi',
    products: 'Mahsulotlar',
    cart: 'Savat',
    profile: 'Profil',
    delivery_text: 'ENG TEZKOR YETKAZIB BERISH',
    hero_title_1: 'Sizning',
    hero_title_2: 'Tanlovingiz',
    hero_subtitle: 'Eng sara restoranlar va do\'konlardan olingan sifatli mahsulotlar endi bir qo\'l masofasida.',
    start_shopping: 'Xaridni boshlash',
    view_cart: 'Savatni ko\'rish',
    items_found: 'ta mahsulot',
    no_results: 'Sizning so\'rovingiz bo\'yicha hech narsa topilmadi',
    items: 'mahsulot',
    search_placeholder: 'Qidiruv...',
    active_search: 'QIDIRUV'
  },
  zh: {
    search: '搜索',
    categories: '类别',
    all: '全部',
    products: '产品',
    cart: '购物车',
    profile: '轮廓',
    delivery_text: '最快进',
    hero_title_1: '您的',
    hero_title_2: '选择',
    hero_subtitle: '来自最好餐厅和商店的高品质产品现在近在咫尺。',
    start_shopping: '开始购物',
    view_cart: '查看购物车',
    items_found: '件产品',
    no_results: '未找到搜索结果',
    items: '产品',
    search_placeholder: '搜索...',
    active_search: '搜索'
  }
}

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('lang') || 'ru',
  fallbackLocale: 'ru',
  messages
})

export default i18n
