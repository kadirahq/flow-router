const Url = Npm.require('url');
const Cheerio = Npm.require('cheerio');

Route = class extends SharedRoute {
  constructor(router, pathDef, options, group) {
    super(router, pathDef, options, group);

    this._cache = {};
  }

  _init() {
    const cookieParser = Npm.require('cookie-parser');
    Picker.middleware(cookieParser());
    // process null subscriptions with FR support
    Picker.middleware(FastRender.handleOnAllRoutes);

    const route = FlowRouter.basePath + this.pathDef;
    Picker.route(route, (params, req, res, next) => {
      if (!this._isHtmlPage(req.url)) {
        return next();
      }

      const cachedPage = this._getCachedPage(req.url);
      if (cachedPage) {
        return this._processFromCache(cachedPage, res, next);
      }

      const processFromSsr = this._processFromSsr.bind(this, params, req, res);
      FastRender.handleRoute(processFromSsr, params, req, res, next);
    });
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
          const frData = res.getData("fast-render-data");
          if(frData) {
            ssrContext.addData(frData.collectionData);
          }

          if(self.options.action) {
            self.options.action.call(
              self, routeContext.params, routeContext.queryParams
            );
          }
        } catch(ex) {
          console.error(`Error when doing SSR. path:${req.url}: ${ex.message}`);
          console.error(ex.stack);
        }
      });

      self._injectHtml(req, res, ssrContext);
    });
  }

  _injectHtml(req, res, ssrContext) {
    const self = this;
    const originalWrite = res.write;
    res.write = function (data) {
      if(typeof data === 'string') {
        const head = ssrContext.getHead();
        if(head && head.trim() !== "") {
          data = data.replace('</head>', `${head}\n</head>`);
        }

        const body = ssrContext.getHtml();
        if (self._router.deferScriptLoading) {
          data = self._moveScriptsToBottom(data);
        }
        data = data.replace('<body>', `<body>\n${body}`);

        const pageInfo = {
          frData: res.getData("fast-render-data"),
          html: data
        };

        // cache the page if mentioned a timeout
        if(self._router.pageCacheTimeout) {
          self._cachePage(req.url, pageInfo, self._router.pageCacheTimeout);
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

  _processFromCache(pageInfo, res, next) {
    const originalWrite = res.write;
    res.write = function (data) {
      originalWrite.call(this, pageInfo.html);
    }

    res.pushData('fast-render-data', pageInfo.frData);
    next();
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
      queryParams
    };

    return context;
  }

  _isHtmlPage(url) {
    const pathname = Url.parse(url).pathname;
    const ext = pathname.split('.').slice(1).join('.');

    // if there is no extention, yes that's a html page
    if(!ext) {
      return true;
    }

    // if this is htm or html, yes that's a html page
    if(/^htm/.test(ext)) {
      return true;
    }

    // if not we assume this is not as a html page
    // this doesn't do any harm. But no SSR
    return false;
  }

  _getCachedPage(url) {
    const info = this._cache[url];
    if(info) {
      return info.data;
    }
  }

  _cachePage(url, data, timeout) {
    const existingInfo = this._cache[url];
    if(existingInfo) {
      throw new Error(`Cannot cache a existing cahced page: ${url}`);
    }

    const info = {
      data: data,
      timeoutHandle: setTimeout(() => {
        delete this._cache[url];
      }, timeout)
    };

    this._cache[url] = info;
  }
}
