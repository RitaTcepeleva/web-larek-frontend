import './scss/styles.scss';

import { MarketAPI } from './components/MarketAPI';
import {API_URL, CDN_URL} from './utils/constants';
import { IProductItem, IBasketItem, IOrderForm, PaymentMethod } from './types';
import { EventEmitter } from './components/base/events'
import { ProductsData } from './components/model/ProductsData';
import { Basket } from './components/model/Basket';
import { Order } from './components/model/Order';
import { Page } from "./components/view/Page";
import { Modal } from './components/common/Modal';
import { cloneTemplate, createElement, ensureElement } from "./utils/utils";
import { ProductCard, BasketItem } from './components/view/ProductCard';
import { BasketView } from './components/view/BasketView';
import { OrderView, ContactsView } from './components/view/OrderView';
import { Success } from './components/common/Success';

const api = new MarketAPI(CDN_URL, API_URL);
const events = new EventEmitter();

// Модель данных приложения
const productsData = new ProductsData({}, events);
const basket = new Basket({}, events);
const order = new Order({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Темплейты
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Объекты слоя представления
const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const orderView = new OrderView(cloneTemplate(orderTemplate), events);
const contactsView = new ContactsView(cloneTemplate(contactsTemplate), events);

// Повторяющийся функционал вынесен в отдельные методы
const setOrderField = (data: { field: keyof IOrderForm, value: string }) => {
    if(data.field === 'payment') order[`${data.field}`] = data.value as PaymentMethod;
    else order[`${data.field}`] = data.value;
};

const changeInBusketStatus = (productId: string, status: boolean) => {
    productsData.setInBasketStatus(productId, status);
}

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Изменились элементы каталога
events.on('products:changed', () => {
    page.catalog = productsData.products.map(item => {
        const card = new ProductCard('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            title: item.title,
            description: item.description,
            image: item.image,
            category: item.category,
            price: item.price,
        });
    });

    page.counter = basket.products.length;
});

// Поменялся товер (inBusketStatus) => надо поменять каунтер
events.on('product:changed', () => {
    page.counter = basket.products.length;
})

// Удалился товар из корзины (эмитится только в случае оформления заказа для товаров с нулевой стоимостью)
events.on('basket:changed:removed', (data: {productId: string}) => {
    changeInBusketStatus(data.productId, false);
    page.counter = basket.products.length;
})

// Очистилась корзина (эмитится только в случае оформления заказа)
events.on('basket:clear', (products: IBasketItem[]) => {
    products.forEach(item => changeInBusketStatus(item.id, false));
    page.counter = 0;
})

// Открыть карточку товара
events.on('card:select', (item: IProductItem) => {
    productsData.productPreview = item.id;
});

// Изменен выбранный товар
events.on('preview:changed', (item: IProductItem) => {
    const showItem = (item: IProductItem) => {
        const card = new ProductCard('card', cloneTemplate(cardPreviewTemplate), {
            onClick: () => {
                if(!item.inBusket) basket.addProduct({
                    id: item.id,
                    title: item.title,
                    price: item.price
                });
                else basket.removeProduct(item.id);
                productsData.setInBasketStatus(item.id, !item.inBusket);
                card.render({
                    title: item.title,
                    image: item.image,
                    description: item.description,
                    category: item.category,
                    price: item.price,
                    buttonText: item.inBusket
                })
            }
        });

        modal.render({
            content: card.render({
                title: item.title,
                image: item.image,
                description: item.description,
                category: item.category,
                price: item.price,
                buttonText: item.inBusket
            })
        });
    };

    if (item) {
        showItem(item);
    } else {
        modal.close();
    }
});

// Открыть корзину
events.on('basket:open', () => {
    const items = basket.products.map((item, index) => {
        const card = new BasketItem('card', cloneTemplate(cardBasketTemplate), {
            onClick: ()=> {
                basket.removeProduct(item.id);
                productsData.setInBasketStatus(item.id, false);
                events.emit('basket:open'); // to re-render basket without deleted element
            }
        });
        return card.render({
            title: item.title,
            price: item.price,
            index: index + 1
        });
    });

    modal.render({
        content: basketView.render({
            items,
            total: basket.total
        })
    });
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
    const { email, phone, address, payment } = errors;
    orderView.valid = !payment && !address;
    orderView.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
    contactsView.valid = !email && !phone;
    contactsView.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей Order
events.on(/^order\..*:change/, setOrderField);

// Изменилось одно из полей Contacts
events.on(/^contacts\..*:change/, setOrderField);

// Открыть форму заказа
events.on('order:open', () => {
    modal.render({
        content: orderView.render({
            // phone: '',
            // email: '',
            address: '',
            payment: '',
            valid: false,
            errors: []
        })
    });
});

// Первый этап заполнения формы заказа пройден
events.on('order:submit', () => {
    modal.render({
        content: contactsView.render({
            phone: '',
            email: '',
            // address: '',
            // payment: '',
            valid: false,
            errors: []
        })
    });
})

// Оформление заказа завершено, можно отправлять запрос на покупку товаров
events.on('contacts:submit', () => {
    basket.removeProductsWithoutValue();
    api.orderProducts(
        order.getReadyOrder(basket.products.map(item => item.id), basket.total)
    )
        .then(result => {
            const success = new Success(cloneTemplate(successTemplate), {
                onClick: () => {
                    modal.close();
                    basket.clear();
                }
            });

            modal.render({
                content: success.render({
                    total: result.total
                })
            });
        })
        .catch(err => {
            console.error(err);
        });
})

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
    page.locked = false;
});

// Получаем товары с сервера
api.getProductList()
    .then(result => {
        productsData.products = result;
    })
    .catch(err => console.log(err));
