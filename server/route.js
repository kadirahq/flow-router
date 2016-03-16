const Url = require('url');
const Cheerio = require('cheerio');
const logger = console;

Route = class extends SharedRoute {
  constructor(router, pathDef, options, group) {
    super(router, pathDef, options, group);

    this._cache = {};
  }

  _init() {
    const cookieParser = require('cookie-parser');
    Picker.middleware(cookieParser());
    // process null subscriptions with FR support
    Picker.middleware(FastRender.handleOnAllRoutes);

    const route = FlowRouter.basePath + this.pathDef;
    Picker.route(route, this._handleRoute.bind(this));
  }

  _handleRoute(params, req, res, next) {
    if (!this._isHtmlPage(req.url)) {
      return next();
    }

    // This userId will be useful in the at the later on when
    // it's time to cache the page.
    // Normally, we can't access `Meteor.userId()` outside of a method
    // But here, we could do it because we call `FastRender.handleOnAllRoutes`.
    // It creates a FastRender context and assign it for the current fiber.
    req.__userId = Meteor.userId();
    const cachedPage = this._getCachedPage(req.url, req.__userId);
    if (cachedPage) {
      return this._processFromCache(cachedPage, res, next);
    }

    // Here we need to processFromSsr,
    // but also we need to process with FastRender as well.
    // That's why we bind processFromSsr and pass args as below.
    // It does not get any arguments from FastRender.
    // FastRender just trigger the following handler and do it's job
    const processFromSsr = this._processFromSsr.bind(this, params, req, res);
    FastRender.handleRoute(processFromSsr, params, req, res, next);
  }

  _processFromCache(pageInfo, res, next) {
    // Here we can't simply call res.write.
    // That's because, the HTML we've cached does not have the
    // injected fast-render data.
    // That's why we hijack the res.write and let FastRender to push
    // the frData we've cached.
    const originalWrite = res.write;
    res.write = function() {
      originalWrite.call(this, pageInfo.html);
    };
    InjectData.pushData(res, 'fast-render-data', pageInfo.frData);
    next();
  }

  _processFromSsr(params, req, res) {
    const self = this;
    const ssrContext = new SsrContext();
    const routeContext = self._buildContext(req, params);

    self._router.ssrContext.withValue(ssrContext, () => {
      self._router.routeContext.withValue(routeContext, () => {
        try {
          // get the data for null subscriptions and add them to the
          // ssrContext
          const frData = InjectData.getData(res, 'fast-render-data');
          if (frData) {
            ssrContext.addData(frData.collectionData);
          }

          if (self.options.action) {
            self.options.action(routeContext.params, routeContext.queryParams);
          }
        } catch (ex) {
          logger.error(`Error when doing SSR. path:${req.url}: ${ex.message}`);
          logger.error(ex.stack);
        }
      });

      self._injectHtml(req, res, ssrContext);
    });
  }

  _injectHtml(req, res, ssrContext) {
    const self = this;
    const originalWrite = res.write;
    res.write = function(data) {
      if (typeof data === 'string') {
        const head = ssrContext.getHead();
        if (head && head.trim() !== '') {
          data = data.replace('</head>', `${head}\n</head>`);
        }

        const body = ssrContext.getHtml();
        data = data.replace('<body>', `<body>\n${body}`);

        if (self._router.deferScriptLoading) {
          data = self._moveScriptsToBottom(data);
        }

        // cache the page if mentioned a timeout
        if (self._router.pageCacheTimeout) {
          const pageInfo = {
            frData: InjectData.getData(res, 'fast-render-data'),
            html: data
          };
          self._cachePage(req.url, req.__userId, pageInfo, self._router.pageCacheTimeout);
        }
      }

      originalWrite.call(this, data);
    };
  }

  _moveScriptsToBottom(html) {
    const $ = Cheerio.load(html, {
      decodeEntities: false
    });
    const heads = $('head script');
    $('body').append(heads);

    // Remove empty lines caused by removing scripts
    $('head').html($('head').html().replace(/(^[ \t]*\n)/gm, ''));

    return $.html();
  }

  _buildContext(req, _params) {
    const queryParams = _params.query;
    // We need to remove `.query` since it's not part of our params API
    // But we only need to remove it in our copy.
    // We should not trigger any side effects
    const params = _.clone(_params);
    delete params.query;

    const context = {
      route: this,
      path: req.url,
      params,
      queryParams,
      // We might change this later on. That's why it's starting with _
      _serverRequest: req
    };

    return context;
  }

  _isHtmlPage(url) {
    const pathname = Url.parse(url).pathname;
    const ext = pathname.split('.').slice(1).join('.');

    // if there is no extention, yes that's a html page
    if (!ext) {
      return true;
    }

    // if this is htm or html, yes that's a html page
    if (/^htm/.test(ext)) {
      return true;
    }

    // if not we assume this is not as a html page
    // this doesn't do any harm. But no SSR
    return false;
  }

  _getCachedPage(url, userId) {
    const cacheInfo = {url, userId};
    const cacheKey = this._getCacheKey(cacheInfo);
    const info = this._cache[cacheKey];
    if (info) {
      return info.data;
    }
  }

  _cachePage(url, userId, data, timeout) {
    const cacheInfo = {url, userId};
    const cacheKey = this._getCacheKey(cacheInfo);
    const existingInfo = this._cache[cacheKey];
    if (existingInfo) {
      // Sometimes, it's possible get this called multiple times
      // due to race conditions. So, in that case, simply discard
      // caching this page.
      return;
    }

    const info = {
      data: data,
      timeoutHandle: setTimeout(() => {
        delete this._cache[cacheKey];
      }, timeout)
    };

    this._cache[cacheKey] = info;
  }

  _getCacheKey({userId = '', url}) {
    return `${userId}::${url}`;
  }
};
