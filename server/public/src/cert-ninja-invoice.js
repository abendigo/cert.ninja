(function () {

  class CertNinjaInvoice extends HTMLElement {

    static get observedAttributes() {
      return ['data'];
    }

    constructor() {
      super();
    }

    connectedCallback() {
      console.log('connectedCallback')
      this.innerHTML = "<b>I'm an x-foo-with-markup!</b>";
    }

    disconnectedCallback() {
      console.log('disconnectedCallback')
    }

    attributeChangedCallback(name, nv, ov) {
      console.log('attributeChangedCallback', name, nv, ov)
    }
  }

  window.customElements.define('cert-ninja-invoice', CertNinjaInvoice);

  customElements.whenDefined('cert-ninja-invoice').then(() => {
    console.log('cert-ninja-invoice defined');
  });
})();
