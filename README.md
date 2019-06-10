# Saudi Map

## Установка

1. Установить Node js 
2. Из папки проекта запустить npm install

## Конфигурация
1. В папку files подложить excel файл saudi.xlsx. Первая строка - заголовки, остальные строки - данные. Обязательно должен быть столбец Region и столбец Governorate
2. В файл config.json - прописываем те заголовки которые будут фильтром (columns). Там же указваем метод расчета для региона (summary или average). А также заполняем названия листа в excel (sheet)

## Cборка
1. Запускаем node converter для преобразования excel -> json
2. Запускаем npm run build

## Запуск
1. В папке dist открываем index.html
