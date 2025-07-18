import {Form} from "../common/Form";
import {IOrderForm, PaymentMethod} from "../../types";
import {IEvents} from "../base/events";
import { Tabs } from "../common/Tabs";

export class OrderView extends Form<IOrderForm> {
    protected _payment: Tabs;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._payment = new Tabs(container, {
            onClick: (name) => {
                this.onInputChange('payment' as keyof IOrderForm, name);

                this._payment.render({
                    selected: name
                })
            }
        })
    }

    set payment(value: PaymentMethod | '') {
        this._payment.selected = value;
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }
}

export class ContactsView extends Form<IOrderForm> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }
}