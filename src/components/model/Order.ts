import { IOrderFinal, IOrder, PaymentMethod, FormErrors } from "../../types";
import { Model } from "../base/Model";

export class Order extends Model<IOrder> {
    protected _payment: PaymentMethod;
    protected _address: string;
    protected _email: string;
    protected _phone: string;
    protected formErrors: FormErrors = {};

    set payment(value: PaymentMethod) {
        this._payment = value;
        this.emitOrderReady();
    }
    set address(value: string) {
        this._address = value;
        this.emitOrderReady();
    }
    set email(value: string) {
        this._email = value;
        this.emitOrderReady();
    }
    set phone(value: string) {
        this._phone = value;
        this.emitOrderReady();
    }

    checkValidation(): boolean {
        const errors: typeof this.formErrors = {};
        if(!this._payment) {
            console.log('no payment');
            errors.payment = 'Необходимо выбрать способ оплаты';
        }
        if(!this._address) {
            console.log('no address');
            errors.address = 'Необходимо указать адрес';
        }
        if (!this._email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this._phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    getReadyOrder(items: string[], total: number): IOrderFinal {
        return {
            payment: this._payment,
            address: this._address,
            email: this._email,
            phone: this._phone,
            items,
            total
        };
    }

    private emitOrderReady() {
        if(this.checkValidation())
            this.events.emit('order:ready', {
                payment: this._payment,
                address: this._address,
                email: this._email,
                phone: this._phone
            });
    }
}