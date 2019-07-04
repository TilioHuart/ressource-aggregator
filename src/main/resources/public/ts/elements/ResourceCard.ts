import {css, html, LitElement} from "lit-element";
import Element from './Element';

class ResourceCard extends LitElement {

    static get styles() {
        return css`
            :host {
                background-color: #FFF;
                border-radius: 10px;
                box-shadow: 0px 5px 5px rgba(0, 0, 0, .2);
            }
        `
    };

    render(): any {
        return html`<div class="card">
            <slot></slot>
        </div>`
    }
}

export const element: Element = {
    name: 'resource-card',
    element: ResourceCard
};
