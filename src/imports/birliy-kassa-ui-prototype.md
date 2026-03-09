Create a complete mobile-first UI prototype for a Telegram Mini App called **BirLiy Kassa**.

The application must be designed for **restaurants and cafes in Uzbekistan**.

IMPORTANT REQUIREMENTS:

• Interface language must be **Russian**
• Currency must be **Uzbekistani Sum (UZS)**
• Prices must be displayed like: **12 000 сум**
• Use spaces as thousand separators

---

ABOUT THE PRODUCT

BirLiy Kassa is a **simple restaurant order management system** used by small cafes and restaurants.

The system helps staff manage:

• tables
• orders
• menu
• payment method selection
• order history
• waiter performance

The main users are:

• Waiters
• Restaurant Owners
• Platform Super Admin

---

IMPORTANT DESIGN INSTRUCTION

You are free to design the **UI layout, components, buttons, spacing, typography and visual style**.

Focus on creating a **modern, clean, and highly usable restaurant interface**.

Do not overcomplicate the UI.

The goal is **speed and clarity for waiters working in a busy environment**.

---

COLOR GUIDELINES

Primary color: **Dark Green**
Background: **White**

You can derive additional colors automatically.

Table status colors:

Free table → Green
Table occupied by current waiter → Blue
Table occupied by another waiter → Orange
Reserved table → Purple

You are free to design the rest of the visual system.

---

APP TYPE

This is a **Telegram Mini App**, so the UI must be **mobile-first**.

Use large touch targets and simple layouts.

---

CORE USER FLOW (WAITER)

The waiter workflow must be extremely fast.

1. Open app
2. See list of tables
3. Select table
4. Create or open order
5. Add dishes
6. Change quantities
7. Close order
8. Select payment method

Design this flow to require **as few taps as possible**.

---

SCREEN 1 — TABLES

The main screen shows all restaurant tables.

Each table card shows:

Table number
Table status

Examples of statuses:

Стол 5
Свободен

Стол 5
Занят вами

Стол 5
Занят другим официантом

Стол 5
Забронирован
18:00

Users can tap a free table to open an order.

---

SCREEN 2 — ORDER

Shows an active order for a table.

Information shown:

Стол
Официант

List of ordered dishes.

Each item should show:

Название блюда
Количество
Цена

Example:

Плов

* 1 +
  12 000 сум

Controls should allow:

Increase quantity
Decrease quantity
Delete item

Show total amount:

Итого: 48 000 сум

Buttons:

Добавить блюдо
Закрыть заказ

---

SCREEN 3 — MENU

Menu appears when adding dishes.

Structure:

Dish categories

Examples:

Все
Супы
Основные блюда
Напитки

Dish cards show:

Название блюда
Цена

Tap a dish to add it to the order.

---

SCREEN 4 — PAYMENT SELECTION

When closing the order, show payment options:

Наличные
PayMe
Click
Терминал

Design this as a simple and clear modal.

---

SCREEN 5 — ORDER HISTORY (OWNER)

Owner can view previous orders.

Each order card shows:

Заказ номер
Стол
Официант
Сумма
Способ оплаты

Example:

Заказ #245
Стол 4
Официант: Али
48 000 сум
PayMe

Tapping opens order details.

---

SCREEN 6 — ORDER DETAILS

Shows:

Стол
Официант
Время открытия
Время закрытия
Способ оплаты

List of dishes with quantities and prices.

---

SCREEN 7 — OWNER DASHBOARD

Owner dashboard should show restaurant performance.

Cards:

Заказов сегодня
Выручка сегодня
Средний чек
Активные столы

Below show waiter performance:

Имя официанта
Количество заказов
Общая сумма

---

SCREEN 8 — STAFF MANAGEMENT

Owner manages waiters.

List shows:

Имя
Статус (активен / заблокирован)

Actions:

Добавить официанта
Заблокировать
Удалить

---

SCREEN 9 — TABLE RESERVATIONS

Owner can reserve tables.

Reservation form includes:

Стол
Имя клиента
Время
Комментарий

Reserved tables must appear with a special visual status in the tables screen.

---

SCREEN 10 — SUPER ADMIN PANEL

Super admin manages the platform.

Sections:

Заведения
Пользователи
Owners

Functions:

Создать заведение
Назначить owner
Управлять пользователями

---

FINAL DESIGN GOAL

Design a modern, elegant and extremely usable interface.

The UI should feel like a **modern restaurant POS system adapted for Telegram Mini Apps**.

Focus on clarity, speed, and ease of use for waiters.
