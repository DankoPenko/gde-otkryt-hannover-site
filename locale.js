(() => {
  const translations = {
    'Сохранённый расчёт': 'Saved analysis', 'Сохранённый снимок': 'Saved snapshot',
    'Домов ближайшего заведения': 'Nearby business catchment', 'Дома этой пекарни': 'Homes assigned to this bakery',
    'Дома этого салона': 'Homes assigned to this salon', 'Наведите на значок, чтобы увидеть ближайшие дома и оценку жителей.': 'Hover over a marker to see nearby homes and the estimated population.',
    'Пользовательские точки добавляются в проверочную выборку.': 'User-submitted locations are added to the validation sample.',
    'OSM может содержать пропуски.': 'OpenStreetMap data may be incomplete.',
    'Загрузить подборку помещений…': 'Loading available spaces…', 'Загружаем подборку помещений…': 'Loading available spaces…',
    'Подборка не загрузилась.': 'Could not load listings.', 'Повторить': 'Try again',
    'Место для бизнеса': 'A place for your business', 'Объявления и окружение.': 'Listings and neighbourhood context.', 'Без обещаний доходности.': 'No promises of profitability.',
    'Аренда · Ганновер': 'Commercial rent · Hannover', 'Помещения в аренду': 'Spaces for rent', 'Панель анализа': 'Analysis panel', 'Режим карты': 'Map view', 'Тип заведений': 'Business type', 'Выбранный город': 'Selected city',
    'Где открыть': 'Where to open', 'Ганновер': 'Hannover', 'Помещения': 'Spaces', 'Заведения': 'Businesses', 'Пекарни': 'Bakeries', 'Пекарня': 'Bakery', 'Маникюр / салон красоты': 'Nail & beauty salon',
    'Nails & beauty': 'Nails & beauty', ' мин': ' min', 'Высокий потенциал': 'High potential', 'Средний': 'Medium', 'Радиус на карте · пешком': 'Map radius · walking time', 'Время пешком': 'Walking time',
    'Точки интереса': 'Points of interest', 'Остановки': 'Stops', 'Школы': 'Schools', 'Школа': 'School', 'Автобусная остановка': 'Bus stop', 'Железнодорожная / трамвайная остановка': 'Rail / tram stop',
    'Как считается': 'Methodology', 'О методике': 'About the methodology', 'Анализ локаций': 'Location analysis', 'Точек на карте': 'Locations on map', 'Карта домов': 'Building view', 'мягкий объём': 'soft 3D',
    'сохранённый снимок': 'saved snapshot', 'Демонстрационные зоны': 'Example opportunity areas', 'не рейтинг помещений': 'not a ranking of rental spaces',
    'Открываем сохранённый расчёт…': 'Loading saved analysis…', 'Наведите на значок, чтобы увидеть ближайшие дома': 'Hover over a marker to see nearby homes',
    'Наведите на значок · нажмите, чтобы рассмотреть дома': 'Hover over a marker · click to inspect nearby homes',
    'Карта временно недоступна': 'Map temporarily unavailable', 'Показать карту': 'Show map', 'Показать помещения': 'Show spaces',
    'Показать 6 лучших зон': 'Show the 6 example areas', 'Вернуться к карте': 'Back to map', 'Потенциал зоны': 'Area potential',
    'высокий': 'high', 'средний': 'medium', 'умеренный': 'moderate', 'Жителей рядом': 'Estimated nearby residents', 'Ближайшая точка': 'Nearest business',
    'Конкурентов': 'Competitors', 'Нехватка': 'Potential gap', 'Почему зона в рейтинге': 'Why this area ranks',
    'Предварительная оценка · требует проверки аренды и трафика': 'Preliminary estimate · verify rent and foot traffic',
    'Потенциал, а не прогноз прибыли': 'Potential, not a profit forecast', 'Методика MVP': 'MVP methodology',
    'Закрыть': 'Close', 'Закрыть сравнение': 'Close comparison', 'Закрыть карточку заведения': 'Close business card',
    'Нажмите на значок, чтобы закрепить': 'Click a marker to pin it', 'Выбрано заведение · Esc, чтобы снять выбор': 'Business selected · press Esc to clear',
    'жителей · модельная оценка': 'residents · model estimate', 'Жилых домов': 'Residential buildings', 'Зданий в расчёте': 'Buildings in analysis',
    'Население оценено только для': 'Population estimated only for', 'жилых домов. Это не число реальных покупателей.': 'residential buildings. This is not an estimate of actual customers.',
    'В этой группе нет зданий с жилым типом в OSM. Население не оценено.': 'No buildings tagged as residential were found in this group. Population was not estimated.',
    'Жилые': 'Residential', 'Прочие / тип неизвестен / постройки': 'Other / unknown type / auxiliary structures',
    'Серые контуры — вне выбранной группы или отсутствуют в сохранённом снимке.': 'Gray footprints are outside the selected group or missing from the saved snapshot.',
    'Загружаем сохранённые дома…': 'Loading saved building data…', 'Для этой точки пока нет расчёта.': 'No saved analysis is available for this location yet.',
    'Дома выбранного заведения выделены на карте': 'Buildings assigned to this business are highlighted on the map',
    'Контуры не загрузились.': 'Could not load building outlines.', 'Показать все дома': 'Show all assigned buildings', 'Как рассчитано': 'How this is calculated',
    'Допущения модели, не перепись.': 'These are model assumptions, not census data.', 'Население — модель, не перепись.': 'Population is a model estimate, not a census count.',
    'Объявления проверены': 'Listings checked', 'Свободность владельцем не подтверждена.': 'Availability has not been confirmed by the owner.',
    'Ручная подборка, не весь рынок.': 'Curated sample, not the entire market.', 'Снимок устарел — перепроверьте условия.': 'This snapshot may be out of date — verify current terms.',
    'Готовое кафе в Nordstadt': 'Ready-to-run café in Nordstadt', 'Помещение у Deisterkreisel': 'Commercial space near Deisterkreisel',
    'Ориентир квартала, не вход в помещение': 'Neighbourhood reference point, not the premises entrance', 'Центр здания по адресу, вход не уточнён': 'Building centre at the listed address; entrance not verified',
    'Аренда и расходы по запросу. Без комиссии.': 'Rent and additional costs on request. No commission.',
    'В карточке указаны доплаты 200 €/мес.; состав уточнить. Электричество и другие договоры отдельно. Залог ≈ 2 700 €.': 'The listing shows €200/month in additional charges; confirm what is included. Electricity and other contracts are separate. Deposit approx. €2,700.',
    'В объявлении: III квартал 2026': 'Listing states: Q3 2026', '11,40 €/м² + 2,83 €/м² расходов (≈ 300 €/мес.), без НДС. Комиссия: 3 месячные аренды брутто + НДС.': '€11.40/m² plus €2.83/m² service charges (approx. €300/month), excluding VAT. Commission: 3 gross monthly rents plus VAT.',
    '17 €/м² × 90 м². Дополнительные расходы и НДС уточнить. Есть комиссия; сумма не указана.': '€17/m² × 90 m². Confirm additional costs and VAT. Commission applies; amount not stated.',
    'Пекарня / кафе предусмотрены': 'Bakery / café use is envisaged', 'Действующее кафе к передаче': 'Existing café available for transfer', 'Предлагается под гастрономию': 'Offered for food service use', 'Назначение нужно проверить': 'Permitted use must be verified',
    'Площадь прямо предлагается под пекарню или кафе.': 'The space is explicitly offered for a bakery or café.', 'В квартале заявлены 165 квартир, офисы и детский сад.': 'The development is stated to include 165 apartments, offices and a daycare centre.', 'Новое помещение; оснащение по договорённости.': 'New premises; fit-out by arrangement.',
    'Цена и стоимость обустройства не опубликованы.': 'Rent and fit-out costs have not been published.', 'Мощность для печей, вытяжка и производство на месте не подтверждены.': 'Oven power supply, extraction and on-site production have not been confirmed.', 'В объявлении указан № 432, в материалах проекта — № 454. Точное помещение нужно уточнить.': 'The listing says No. 432, while project materials say No. 454. Confirm the exact unit.',
    'Заявлены кофемашина, кофемолки, охлаждение и мебель.': 'Coffee machine, grinders, refrigeration and furniture are listed.', 'В карточке отмечены кухня и силовое электропитание.': 'The listing mentions a kitchen and three-phase power.', 'Разовая плата за передачу — 35 000 €, возможен торг.': 'One-time transfer fee is €35,000; negotiable.',
    'Свободность, состав оборудования и условия нового договора не подтверждены владельцем.': 'The owner has not confirmed availability, included equipment or terms of a new lease.', 'Возможность выпечки на месте нужно проверить.': 'Confirm whether baking on site is permitted.', 'Без точного адреса нельзя достоверно оценить ближайших конкурентов и жильё.': 'Without an exact address, nearby competitors and housing cannot be reliably assessed.',
    'В объявлении указан гастрономический формат.': 'The listing specifies a food-service use.', 'Отделка и планировка по пожеланиям арендатора.': 'Finishes and layout can be adapted to the tenant’s requirements.', 'Бюджет ремонта, коммуникации и возможность пекарни не подтверждены.': 'Renovation budget, utilities and bakery use have not been confirmed.', 'Точный адрес скрыт — статистика локации пока не рассчитана.': 'The exact address is withheld, so location statistics have not been calculated.',
    'Торговое помещение на первом этаже с витринами.': 'Ground-floor retail space with display windows.', 'Заявлены WC, небольшая кухня и офисная зона.': 'The listing mentions a restroom, small kitchen and office area.', 'Пекарня и гастрономия в объявлении не заявлены.': 'Bakery and food-service uses are not mentioned in the listing.', 'Согласие на выбранный формат, мощность и вентиляция требуют проверки.': 'Verify permitted use, electrical capacity and ventilation.',
    'По запросу': 'On request', 'По договорённости': 'By arrangement', 'Сравнить': 'Compare', 'Сравнение помещений': 'Compare spaces',
    'На одинаковых условиях': 'Compared on the same basis', 'Порядок': 'Sort by', 'Подборка': 'Curated order', 'Аренда по возрастанию': 'Rent: low to high',
    'Меньше конкурентов рядом': 'Fewest nearby competitors', 'объявления': 'listings', 'на карте': 'on map', 'Подборка под пекарню / кафе.': 'Selected for a bakery / café.',
    'Подборка помещений под пекарню / кафе.': 'Spaces selected for a bakery / café.', 'Возможность салона пока не проверена.': 'Suitability for a salon has not been verified.', 'Статистика:': 'Analysis:',
    'Жителей: ≈': 'Residents: ≈', '· модель': '· model estimate', 'Конкурентов в 800 м:': 'Competitors within 800 m:',
    'Адрес скрыт · статистика недоступна': 'Address withheld · statistics unavailable', 'Приблизительно: ориентир квартала': 'Approximate: neighbourhood reference point',
    'Все помещения': 'All spaces', 'Базовая аренда, не полная стоимость': 'Base rent, not the total cost', 'Разовый платёж за передачу:': 'One-time transfer fee:',
    'Это не месячная аренда.': 'This is not monthly rent.', 'Доступность по объявлению:': 'Availability stated in listing:', 'Открыть объявление ·': 'Open listing ·',
    'Окружение · 800 м': 'Neighbourhood · 800 m', 'По прямой ·': 'Straight-line distance ·', 'приблизительный ориентир': 'approximate reference point',
    'жителей по модели': 'modelled residents', 'конкурентов в OSM': 'competitors in OSM', 'жилых зданий': 'residential buildings', 'до ближайшей точки': 'to nearest business',
    'Не число клиентов и не эксклюзивная зона.': 'Not a customer count or exclusive catchment area.', 'зданий без типа не учтены в населении.': 'buildings without a type tag are excluded from the population estimate.',
    'Показать жилые дома': 'Show residential buildings', 'Ближайшие': 'Nearest', 'пекарни': 'bakeries', 'салоны': 'salons',
    'Что известно': 'What we know', 'Что проверить': 'What to verify', 'Источники и методика': 'Sources and methodology', 'Геопривязка OSM': 'OSM location reference',
    'Адрес в объявлении': 'address stated in listing', 'точный адрес скрыт': 'exact address withheld', 'Точный адрес не опубликован.': 'The exact address is not published.',
    'Поэтому здесь нет маркера, оценки жителей и конкурентов.': 'Therefore, no marker, population estimate or competitor analysis is shown.', 'Сначала запросите адрес у автора объявления.': 'Ask the advertiser for the address first.',
    'Пригодность под nail / beauty в источнике не подтверждена.': 'The source does not confirm suitability for a nail / beauty business.',
    'Карта ещё загружается. Попробуйте через несколько секунд.': 'The map is still loading. Please try again in a few seconds.',
    'Загружаем сохранённые контуры…': 'Loading saved building outlines…', 'Бирюзовым выделены жилые дома из расчёта. Серые — остальные.': 'Residential buildings included in the analysis are highlighted in teal. Other buildings are gray.',
    'Не удалось загрузить контуры. Нажмите кнопку ещё раз.': 'Could not load the outlines. Please try again.',
    'Аренда не включает все расходы: доплаты, комиссию, НДС, ремонт и оснащение смотрите в карточках.': 'Rent may exclude additional costs, commission, VAT, renovation and fit-out; check each listing for details.',
    'Отсутствующая цена не означает бесплатную аренду.': 'A missing price does not mean the space is free.',
    'Показатель': 'Metric', 'Условия и источник': 'Terms and source', 'Объявление': 'Listing', 'Не указан': 'Not stated', 'Под салон не проверено': 'Salon use not verified',
    'Адрес скрыт': 'Address withheld', 'Нет адреса': 'No address', 'Нет адреса ≠ нет конкурентов.': 'No address does not mean no competitors.',
    'Таблица сравнения, прокрутка по горизонтали': 'Comparison table; scroll horizontally', 'Снимок домов OSM:': 'OSM building snapshot:', 'заведений:': 'businesses:',
    'Выборка:': 'Coverage area:', 'Вне этой области дома и заведения не учтены; у границ оценка неполная.': 'Buildings and businesses outside this area are not included; estimates are incomplete near the edges.',
    'Пересчёт выполняется при публикации нового снимка, а не при открытии страницы.': 'Data is recalculated when a new snapshot is published, not when the page is opened.',
    'Зона достигает границы выборки — охват неполный.': 'This area reaches the edge of the data coverage, so the estimate is incomplete.',
    'Где открыть — на главную': 'Where to open — home', 'Открыть зону': 'Open area', 'потенциал': 'potential', 'из 100': 'out of 100',
    'Объявления и окружение.': 'Listings and neighbourhood context.', 'Без обещаний доходности.': 'No promises of profitability.',
    'Пекарни · Ганновер': 'Bakeries · Hannover', 'Nails & beauty · Ганновер': 'Nails & beauty · Hannover',
    'Наведите на значок · нажмите, чтобы рассмотреть дома': 'Hover over a marker · click to inspect nearby buildings',
    '≈': '≈', 'мин до точки': 'min to nearest business', 'м²': 'm²', 'Радиус на карте · пешком': 'Map radius · walking time',
    'Дома ближайшего заведения': 'Homes assigned to the selected business', 'Дома этой пекарни': 'Homes assigned to this bakery',
    'Дома этого салона': 'Homes assigned to this salon', 'Карта бизнес-потенциала': 'Business potential map', 'Легенда карты': 'Map legend',
    'Высокий потенциал': 'High potential', 'Средний': 'Medium', 'Показываем расчёт': 'Showing saved analysis',
    'Крупный жилой кластер и мало точек в комфортной пешей доступности.': 'A large residential area with few businesses within a comfortable walking distance.',
    'Для помещений считаем жилые дома, модельное население и конкурентов в пределах 800 м по прямой.': 'For rental spaces, we estimate residential buildings, modelled population and competitors within 800 m straight-line distance.',
    'Для помещений считаем': 'For rental spaces, we estimate', 'жителей · модельная оценка': 'residents · model estimate',
    'Объявления проверены': 'Listings checked', 'Снимок домов OSM:': 'OSM building snapshot:', 'заведений:': 'businesses:',
    'Выборка:': 'Coverage:', 'пересчёт': 'recalculation', 'Точный адрес не опубликован. Поэтому здесь нет маркера, оценки жителей и конкурентов. Сначала запросите адрес у автора объявления.': 'The exact address is not published, so no marker, population estimate or competitor analysis is available. Ask the advertiser for the address first.',
    'Цена не опубликована': 'Price not published', 'Отсутствующая цена не означает бесплатную аренду.': 'A missing price does not mean the space is free.',
    'всего': 'total', 'мес.': 'mo.', 'м²': 'm²', 'квартал': 'neighbourhood', 'салона': 'salon',
    'Модельная оценка жителей в закреплённых жилых домах OSM': 'model estimate of residents in assigned OSM residential buildings',
    'Каждый дом закреплён за одним ближайшим заведением по прямой, отдельно внутри каждой категории.': 'Each building is assigned to its nearest business by straight-line distance, separately for each category.',
    'Это не перепись и не прогноз клиентов; неизвестные типы зданий исключены из оценки жителей.': 'This is neither a census nor a customer forecast; buildings with unknown types are excluded from the population estimate.',
    'Рейтинг кандидатных зон доступен только для пекарен.': 'Example opportunity areas are currently available for bakeries only.',
    'Это отдельная демонстрационная модель: число жителей в этих зонах пока задано вручную.': 'This is a separate demonstration model; population figures for these areas are currently entered manually.',
    'Оно не связано с распределением домов по заведениям.': 'It is not connected to the building assignment analysis for individual businesses.',
    'Доступность:': 'Accessibility:', 'расстояние по прямой переводится в приблизительные минуты, без маршрутов и барьеров. Радиусы сейчас скрыты.': 'Straight-line distance is converted to approximate walking minutes; routes and barriers are not considered. Radius overlays are currently hidden.',
    'Конкуренция:': 'Competition:', 'снижаем балл, если рядом много похожих точек.': 'the score decreases when many similar businesses are nearby.',
    'Спрос:': 'Demand:', 'повышаем балл для плотных жилых кластеров.': 'the score increases for dense residential areas.',
    'OSM не гарантирует полноту.': 'OpenStreetMap data may be incomplete.', 'Для реального решения нужно сверить выдачу с Google Maps и местными каталогами, а затем добавить Zensus 2022, аренду и пешеходный трафик.': 'For a real decision, verify results against Google Maps and local directories, then add 2022 census data, rents and pedestrian traffic.',
    'Для помещений считаем жилые дома, модельное население и конкурентов в пределах 800 м по прямой.': 'For rental spaces, we estimate residential buildings, modelled population and competitors within 800 m straight-line distance.',
    'Это окружение адреса, не эксклюзивный охват и не пешеходный маршрут.': 'This describes the area around an address; it is not an exclusive catchment or a walking route.',
    'Для скрытых адресов расчёт отсутствует; ориентиры кварталов отмечены как приблизительные.': 'No location analysis is available for withheld addresses; neighbourhood reference points are marked as approximate.',
    'Объявления — ручная подборка с датой проверки, без подтверждения свободности владельцем.': 'Listings are a manually curated snapshot; availability has not been confirmed by the owner.',
    'жителей в радиусе анализа': 'residents in the analysis area', 'конкурент': 'competitor', 'конкурентов': 'competitors', 'в пределах 800 м': 'within 800 m',
    'ближайшая точка — около': 'nearest business is about', 'минут пешком': 'minutes away on foot', 'Жилой кластер остаётся за пределами комфортной прогулки до ближайшей точки.': 'The residential area is beyond a comfortable walk from the nearest business.',
    'Спрос поддерживается плотностью жителей, но ближайшие конкуренты снижают потенциал.': 'Population density supports demand, but nearby competitors reduce the opportunity.',
    'Жилой кластер с потенциалом для новой точки.': 'A residential area with potential for a new business.', 'точка': 'location', 'точки': 'locations',
    'центр': 'centre', 'север': 'north', 'восток': 'east', 'юг': 'south', 'станция': 'station',
    'Не удалось загрузить сохранённый расчёт.': 'Could not load the saved analysis.', 'Загружаем контуры выбранных домов…': 'Loading outlines for assigned buildings…',
    'Дополнительно подсвечены': 'Also highlighted:', 'вспомогательных и малых построек: гаражи, навесы и другие контуры меньше 20 м². Они не входят в число зданий выше и в оценку жителей.': 'auxiliary and small structures: garages, shelters and other footprints under 20 m². They are excluded from the building count above and from the population estimate.',
    'Каждое здание относится к ближайшему заведению выбранной категории': 'Each building is assigned to the nearest business in the selected category',
    'по расстоянию по прямой от центра контура. Категории рассчитываются независимо.': 'by straight-line distance from its footprint centre. Categories are analysed independently.',
    'Площадь × этажи × 80% ÷ 45 м² на жителя.': 'Area × floors × 80% ÷ 45 m² per resident.',
    'этажность принята: 2 для отдельных домов, 3 для многоквартирных.': 'floor counts are assumed: 2 for detached houses and 3 for apartment buildings.',
    'зданий без типа и': 'buildings with no type and', 'нежилых не входят в оценку населения.': 'non-residential buildings are excluded from the population estimate.',
    'Среднее расстояние:': 'Average distance:', 'Учтены центры контуров в пределах 800 м.': 'Building footprint centres within 800 m are included.',
    'Население = площадь × этажи × 80% ÷ 45 м².': 'Population = area × floors × 80% ÷ 45 m².',
    'При неизвестной этажности — 2 для домов, 3 для многоквартирных зданий.': 'When the number of floors is unknown, 2 is assumed for houses and 3 for apartment buildings.',
    'Пешеходный трафик, офисные работники, покупательная способность, дороги и барьеры не учтены.': 'Pedestrian traffic, office workers, purchasing power, roads and barriers are not included.',
    'Расчёты сохранены при публикации, а не выполняются в браузере.': 'Calculations are saved when the snapshot is published; they do not run in the browser.',
    'Площадь': 'Area', 'Базовая аренда': 'Base rent', 'Разовый платёж': 'One-time fee', 'Назначение': 'Permitted use', 'Геопривязка': 'Location reference',
    'Жители в 800 м · модель': 'Residents within 800 m · model', 'Конкуренты в 800 м': 'Competitors within 800 m', 'Условия и источник': 'Terms and source',
    'Не указан': 'Not stated', 'Аренда': 'Rent', 'Помещение:': 'Space:', 'Геопривязка OSM': 'OSM location reference', 'Адрес квартала у брокера': 'Neighbourhood reference from broker',
    'Leineauen — расчёт от ориентира квартала.': 'Leineauen analysis uses a neighbourhood reference point.'
  };
  const entries = Object.entries(translations).sort((a, b) => b[0].length - a[0].length);
  const translate = value => {
    let result = String(value);
    for (const [ru, en] of entries) result = result.split(ru).join(en);
    return result;
  };
  const current = () => localStorage.getItem('hannover-map-language') === 'en' ? 'en' : 'ru';
  function apply(root = document) {
    if (current() !== 'en') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    if (root.nodeType === Node.TEXT_NODE) nodes.push(root);
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (node.parentElement?.closest('script,style,textarea,[data-no-translate]')) continue;
      const next = translate(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
    const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll('*')] : [...(root.querySelectorAll?.('*') || [])];
    for (const element of elements) for (const attr of ['aria-label', 'title', 'placeholder']) {
      if (element.hasAttribute?.(attr)) {
        const value = element.getAttribute(attr), next = translate(value);
        if (next !== value) element.setAttribute(attr, next);
      }
    }
  }
  const languageButton = document.getElementById('languageToggle');
  if (languageButton) {
    languageButton.textContent = current() === 'en' ? 'RU' : 'EN';
    languageButton.addEventListener('click', () => {
      localStorage.setItem('hannover-map-language', current() === 'en' ? 'ru' : 'en');
      location.reload();
    });
  }
  document.documentElement.lang = current();
  if (current() === 'en') {
    document.title = 'Where to Open — Hannover Location Map';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Explore rental spaces, bakeries and beauty businesses in Hannover with neighbourhood statistics.');
    apply();
  }
  new MutationObserver(records => {
    if (current() !== 'en') return;
    for (const record of records) {
      if (record.type === 'childList') record.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) apply(node); });
      else if (record.type === 'characterData') apply(record.target);
      else if (record.type === 'attributes') apply(record.target);
    }
  }).observe(document.documentElement, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'title', 'placeholder']});
  window.Locale = {current, translate, apply};
})();
