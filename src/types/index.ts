export type ProductCategory = 'софт-скил' | 'кнопка' | 'другое' | 'дополнительное' | 'хард-скил'

export type PaymentMethod = 'cash' | 'card'

export interface IProductItem {
    id: string;
    description: string;
    image: string;
    title: string;
    category: ProductCategory;
    price: number | null;
    inBusket: boolean;
}

export interface IProductsData {
    products: IProductItem[];
    productPreview: string | null;
    getProduct(productId: string): IProductItem;
    setInBusketStatus(product: IProductItem, status: boolean, callback: Function | null): void;
}

export type IBasketItem = Pick<IProductItem, 'id' | 'title' | 'price' >

export interface IBasket {
    products: IBasketItem[];
    total: number;
    addProduct(product: IBasketItem): void;
    removeProduct(product: IBasketItem): void;
    clear(): void;
}

export interface IOrderForm {
    payment: PaymentMethod;
    address: string;
    email: string;
    phone: string;
}

export interface IOrder extends IOrderForm {
    items: string[];
    total: number;
    checkValidation(data: Record<keyof IOrderForm, string>): boolean;
}

// export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
    id: string;
    total: number;
    error?: string;
}