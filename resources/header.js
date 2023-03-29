class Header extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.innerHTML = `
        <header>
            <div class="site-title">
                <h1><b>basic webgames</b></h1>
            </div>
            <div class="menus">
                <a class="btn btn-primary menu-item" href="/index.html">Home</a>
                
            </div>
        </header>
      `;
    }
  }
  
  customElements.define('header-component', Header);