import { IProductsData, IProductItem } from "../../types";
import { Model } from "../base/Model";

export class ProductsData extends Model<IProductsData> {
    protected _products: IProductItem[];
    protected _productPreview: string | null;

    set products(products: IProductItem[]) {
        this._products = products;
        this.events.emit("products:changed", {products: this._products});
    }

    get products() {
        return this._products;
    }

    set productPreview(productId: string | null) {
        if (!productId) {
            this._productPreview = null;
            return;
        }
        const selectedCard = this.getProduct(productId);
        if (selectedCard) {
            this._productPreview = productId;
            this.events.emit('preview:changed', selectedCard)
        }
    }

    get productPreview() {
        return this._productPreview;
    }

    getProduct(productId: string): IProductItem | undefined {
        return this._products.find((product) => product.id === productId);
    }

    private getProductIndex(productId: string): number {
        return this._products.findIndex((product) => product.id === productId);
    }

    setInBasketStatus(productId: string, status: boolean): void {
        const index = this.getProductIndex(productId);
        if(index > -1) {
            this._products[index].inBusket = status;
            this.events.emit('product:changed', this._products[index]);
        }
    }
}