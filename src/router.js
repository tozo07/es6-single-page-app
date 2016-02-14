import {$http} from 'js/$http.js';
import Page from 'js/page.js';
import {$cookie} from 'js/$cookie.js';
class Router {
  getFile(page) {
    if (page && page.file) {
      if(page.file.slice(-4) === 'html') {
        new Page(page.file);
      }
      else {
        System.import(page.file).then(function(C) {new C.default()});
      }
    }
  }
  /* Sometimes we have a hyperlink that needs to be a hyperlink but we don’t want it
  to process and open the link but only call a javascript function. Fortunately here
  comes a little sassy function to stop the hyperlink and trigger a function call.
  This could be very useful for changing the view of the page or adding information
  to it when making AJAX requests or asynchronous module loading instead of preserving
  the link natural behaviour and redirecting. This architecture help us provide
  graceful degradation functionality and provides key driver of SEO goodnes. */
  handleClick(e) {
    var el = e.target;
    /* Event delegation allows us to avoid adding event listeners to specific nodes; 
    instead, the event listener is added to one parent. That event listener analyses
    bubbled events to find a match on child elements. */
    do {
      if(el.nodeName === 'A') {
        let href = el.getAttribute('href');
        let page = Object.assign({}, this.routes[href]);
        if(page && page.file) {
          if(page.account && $cookie('username')) {
            page.file = page.account;
          }
          this.getFile(page);
          history.pushState({url: href}, page.file, href);
          e.preventDefault();
          return;
        }
      }
    } while(el = el.parentNode);
  }
  getRoute(path) {
    return path === '/' ? '/' : path.replace(/\//g, '');
  }
  handleRouteChange(first) {
    var page;
    if(first) {
      let path = location.href.split('/').slice(3).join('/');
      history.replaceState({url: path}, document.title, path);
    }       
    else if(location.hash) {
      return;
    }
    page = Object.assign(
      {},
      this.routes[this.getRoute(location.pathname)]
    );
    if(page && page.file) {
      var a = $cookie('username');
      if(page.account && $cookie('username')) {
        page.file = page.account;
        history.replaceState({url: '/'}, document.title, '/');
      }
      this.getFile(page);
    }
  }
  init() {
    var success = routes => {
        this.routes = JSON.parse(routes);
        this.handleRouteChange(1);
      },
      error = res => console.log('error', res);
    window.addEventListener('popstate', () => this.handleRouteChange());  
    document.addEventListener('click', e => this.handleClick(e));
    $http({
      method: 'GET', 
      url: '/routes.json'
    }).then(success, error);
  }
}
export default new Router();