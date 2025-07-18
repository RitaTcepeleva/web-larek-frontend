import {Component} from "../base/Component";
import {ProductCategory} from "../../types";
import {ensureElement} from "../../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

interface IProductCard {
    title: string;
    description?: string;
    image?: string;
    category?: ProductCategory;
    index?: number;
    price: number;
    buttonText: boolean;
}

export class ProductCard extends Component<IProductCard> {
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _category?: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
        this._image = container.querySelector(`.${blockName}__image`);
        this._button = container.querySelector(`.${blockName}__button`);
        this._description = container.querySelector(`.${blockName}__text`);
        this._category = container.querySelector(`.${blockName}__category`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set description(value: string | string[]) {
        if (Array.isArray(value)) {
            this._description.replaceWith(...value.map(str => {
                const descTemplate = this._description.cloneNode() as HTMLElement;
                this.setText(descTemplate, str);
                return descTemplate;
            }));
        } else {
            this.setText(this._description, value);
        }
    }

    set price(value: number | null) {
        if(value) this.setText(this._price, value + ' синапсов');
        else this.setText(this._price, 'Бесценно');
    }

    set category(value: ProductCategory) {
        switch(value) {
            case 'хард-скил':
                this.toggleClass(this._category, 'card__category_hard', true);
                break;
            case 'дополнительное':
                this.toggleClass(this._category, 'card__category_additional', true);
                break;
            case 'другое':
                this.toggleClass(this._category, 'card__category_other', true);
                break;
            case 'кнопка':
                this.toggleClass(this._category, 'card__category_button', true);
                break;
            case 'софт-скил':
                this.toggleClass(this._category, 'card__category_soft', true);
                break;
        }
        this.setText(this._category, value);
    }

    set buttonText(value: Boolean) {
        if(value) {
            this.setText(this._button, 'Удалить из корзины');
        } else this.setText(this._button, 'В корзину');
    }
}

export class BasketItem extends ProductCard {
    protected _index: HTMLElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(blockName, container, actions);

        this._index = ensureElement<HTMLElement>('.basket__item-index', container);
    }

    set index(value: number) {
        this.setText(this._index, value);
    }
}