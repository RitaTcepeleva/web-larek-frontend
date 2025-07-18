import { IBasketItem, IBasket } from "../../types";
import { Model } from "../base/Model";

export class Basket extends Model<IBasket> {
    // protected _products: IBasketItem[];
    protected _products = new Map<string, IBasketItem>();

    get products(): IBasketItem[] {
        return [...this._products.values()];
    }

    get total(): number {
        return this.products.reduce((acc, item) => {
            if(item.price) return acc + item.price;
            else return acc;
        }, 0)
    }

    addProduct(product: IBasketItem) {
        if(!this._products.has(product.id)) {
            this._products.set(product.id, product);
        }
    }

    removeProduct(productId: string) {
        this._products.delete(productId);
    }

    removeProductsWithoutValue() {
        this.products.forEach(item => {
            if(item.price === null) {
                this.removeProduct(item.id);
                this.events.emit('basket:changed:removed', {productId: item.id});
            }
        });
    }

    clear() {
        this.events.emit('basket:clear', this.products);
        this._products.clear();
    }
}