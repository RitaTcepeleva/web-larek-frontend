export type ProductCategory = 'софт-скил' | 'кнопка' | 'другое' | 'дополнительное' | 'хард-скил'

export type PaymentMethod = 'cash' | 'card' | '';

export interface IProductItem {
    id: string;
    description: string;
    image: string;
    title: string;
    category: ProductCategory;
    price: number | null;
    inBusket?: boolean;
}

export interface IProductsData {
    products: IProductItem[];
    productPreview: string | null;
    getProduct(productId: string): IProductItem;
    setInBasketStatus(productId: string, status: boolean): void;
}

export type IBasketItem = Pick<IProductItem, 'id' | 'title' | 'price' >

export interface IBasket {
    products: IBasketItem[];
    total: number;
    addProduct(product: IBasketItem): void;
    removeProduct(productId: string): void;
    removeProductsWithoutValue(): void;
    clear(): void;
}

export interface IOrderForm {
    payment: PaymentMethod;
    address: string;
    email: string;
    phone: string;
}

export interface IOrderFinal extends IOrderForm {
    items: string[];
    total: number;
}

export interface IOrder extends IOrderForm {
    checkValidation(): boolean;
    getReadyOrder(items: string[], total: number): IOrder;
}

export type FormErrors = Partial<Record<keyof IOrderForm, string>>;

export interface IOrderResult {
    id: string;
    total: number;
    error?: string;
}
