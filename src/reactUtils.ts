import { ReactInstance } from 'react';
import { findDOMNode } from 'react-dom';

export type DOMElement = HTMLElement | SVGElement;

export function asHTMLElement(instance: ReactInstance | null | undefined): DOMElement | null {
    if (!instance) {
        return null;
    }

    const domNode = findDOMNode(instance);
    if (domNode instanceof SVGElement) {
        return domNode;
    }

    if (domNode instanceof HTMLElement) {
        return domNode;
    }

    throw new Error('Failed to identify DOM element from ' + instance);
}

export function toDOMElement(instance: Element): DOMElement {
    if (instance instanceof SVGElement) {
        return instance;
    }

    if (instance instanceof HTMLElement) {
        return instance;
    }

    throw new Error('Failed to determine DOM element from ' + instance);
}
