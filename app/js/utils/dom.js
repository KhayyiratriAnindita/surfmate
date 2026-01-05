// DOM Utility Functions, functions untuk manipulasi DOM

export const DOM = {
    // Query selector wrapper
    select: (selector) => document.querySelector(selector),
    
    // Query selector all wrapper
    selectAll: (selector) => document.querySelectorAll(selector),
    
    // Create element dengan atribut
    createElement: (tag, className = '', innerHTML = '') => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (innerHTML) el.innerHTML = innerHTML;
        return el;
    },
    
    // Add event listener ke multiple elements
    addEventToAll: (selector, event, callback) => {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener(event, callback);
        });
    },
    
    // Add style ke head
    addStyle: (content) => {
        const style = document.createElement('style');
        style.textContent = content;
        document.head.appendChild(style);
        return style;
    },
    
    // Remove element
    remove: (el) => {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }
};
