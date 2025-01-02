if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_HIDE = "onHide";
  const ON_LAUNCH = "onLaunch";
  const ON_LOAD = "onLoad";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const createHook = (lifecycle) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createHook(ON_SHOW);
  const onHide = /* @__PURE__ */ createHook(ON_HIDE);
  const onLaunch = /* @__PURE__ */ createHook(ON_LAUNCH);
  const onLoad = /* @__PURE__ */ createHook(ON_LOAD);
  const isObject = (val) => val !== null && typeof val === "object";
  const defaultDelimiters = ["{", "}"];
  class BaseFormatter {
    constructor() {
      this._caches = /* @__PURE__ */ Object.create(null);
    }
    interpolate(message, values, delimiters = defaultDelimiters) {
      if (!values) {
        return [message];
      }
      let tokens = this._caches[message];
      if (!tokens) {
        tokens = parse(message, delimiters);
        this._caches[message] = tokens;
      }
      return compile(tokens, values);
    }
  }
  const RE_TOKEN_LIST_VALUE = /^(?:\d)+/;
  const RE_TOKEN_NAMED_VALUE = /^(?:\w)+/;
  function parse(format, [startDelimiter, endDelimiter]) {
    const tokens = [];
    let position = 0;
    let text = "";
    while (position < format.length) {
      let char = format[position++];
      if (char === startDelimiter) {
        if (text) {
          tokens.push({ type: "text", value: text });
        }
        text = "";
        let sub = "";
        char = format[position++];
        while (char !== void 0 && char !== endDelimiter) {
          sub += char;
          char = format[position++];
        }
        const isClosed = char === endDelimiter;
        const type = RE_TOKEN_LIST_VALUE.test(sub) ? "list" : isClosed && RE_TOKEN_NAMED_VALUE.test(sub) ? "named" : "unknown";
        tokens.push({ value: sub, type });
      } else {
        text += char;
      }
    }
    text && tokens.push({ type: "text", value: text });
    return tokens;
  }
  function compile(tokens, values) {
    const compiled = [];
    let index = 0;
    const mode = Array.isArray(values) ? "list" : isObject(values) ? "named" : "unknown";
    if (mode === "unknown") {
      return compiled;
    }
    while (index < tokens.length) {
      const token = tokens[index];
      switch (token.type) {
        case "text":
          compiled.push(token.value);
          break;
        case "list":
          compiled.push(values[parseInt(token.value, 10)]);
          break;
        case "named":
          if (mode === "named") {
            compiled.push(values[token.value]);
          } else {
            {
              console.warn(`Type of token '${token.type}' and format of value '${mode}' don't match!`);
            }
          }
          break;
        case "unknown":
          {
            console.warn(`Detect 'unknown' type of token!`);
          }
          break;
      }
      index++;
    }
    return compiled;
  }
  const LOCALE_ZH_HANS = "zh-Hans";
  const LOCALE_ZH_HANT = "zh-Hant";
  const LOCALE_EN = "en";
  const LOCALE_FR = "fr";
  const LOCALE_ES = "es";
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasOwn = (val, key) => hasOwnProperty.call(val, key);
  const defaultFormatter = new BaseFormatter();
  function include(str, parts) {
    return !!parts.find((part) => str.indexOf(part) !== -1);
  }
  function startsWith(str, parts) {
    return parts.find((part) => str.indexOf(part) === 0);
  }
  function normalizeLocale(locale, messages2) {
    if (!locale) {
      return;
    }
    locale = locale.trim().replace(/_/g, "-");
    if (messages2 && messages2[locale]) {
      return locale;
    }
    locale = locale.toLowerCase();
    if (locale === "chinese") {
      return LOCALE_ZH_HANS;
    }
    if (locale.indexOf("zh") === 0) {
      if (locale.indexOf("-hans") > -1) {
        return LOCALE_ZH_HANS;
      }
      if (locale.indexOf("-hant") > -1) {
        return LOCALE_ZH_HANT;
      }
      if (include(locale, ["-tw", "-hk", "-mo", "-cht"])) {
        return LOCALE_ZH_HANT;
      }
      return LOCALE_ZH_HANS;
    }
    let locales = [LOCALE_EN, LOCALE_FR, LOCALE_ES];
    if (messages2 && Object.keys(messages2).length > 0) {
      locales = Object.keys(messages2);
    }
    const lang = startsWith(locale, locales);
    if (lang) {
      return lang;
    }
  }
  class I18n {
    constructor({ locale, fallbackLocale, messages: messages2, watcher, formater: formater2 }) {
      this.locale = LOCALE_EN;
      this.fallbackLocale = LOCALE_EN;
      this.message = {};
      this.messages = {};
      this.watchers = [];
      if (fallbackLocale) {
        this.fallbackLocale = fallbackLocale;
      }
      this.formater = formater2 || defaultFormatter;
      this.messages = messages2 || {};
      this.setLocale(locale || LOCALE_EN);
      if (watcher) {
        this.watchLocale(watcher);
      }
    }
    setLocale(locale) {
      const oldLocale = this.locale;
      this.locale = normalizeLocale(locale, this.messages) || this.fallbackLocale;
      if (!this.messages[this.locale]) {
        this.messages[this.locale] = {};
      }
      this.message = this.messages[this.locale];
      if (oldLocale !== this.locale) {
        this.watchers.forEach((watcher) => {
          watcher(this.locale, oldLocale);
        });
      }
    }
    getLocale() {
      return this.locale;
    }
    watchLocale(fn) {
      const index = this.watchers.push(fn) - 1;
      return () => {
        this.watchers.splice(index, 1);
      };
    }
    add(locale, message, override = true) {
      const curMessages = this.messages[locale];
      if (curMessages) {
        if (override) {
          Object.assign(curMessages, message);
        } else {
          Object.keys(message).forEach((key) => {
            if (!hasOwn(curMessages, key)) {
              curMessages[key] = message[key];
            }
          });
        }
      } else {
        this.messages[locale] = message;
      }
    }
    f(message, values, delimiters) {
      return this.formater.interpolate(message, values, delimiters).join("");
    }
    t(key, locale, values) {
      let message = this.message;
      if (typeof locale === "string") {
        locale = normalizeLocale(locale, this.messages);
        locale && (message = this.messages[locale]);
      } else {
        values = locale;
      }
      if (!hasOwn(message, key)) {
        console.warn(`Cannot translate the value of keypath ${key}. Use the value of keypath as default.`);
        return key;
      }
      return this.formater.interpolate(message[key], values).join("");
    }
  }
  function watchAppLocale(appVm, i18n) {
    if (appVm.$watchLocale) {
      appVm.$watchLocale((newLocale) => {
        i18n.setLocale(newLocale);
      });
    } else {
      appVm.$watch(() => appVm.$locale, (newLocale) => {
        i18n.setLocale(newLocale);
      });
    }
  }
  function getDefaultLocale() {
    if (typeof uni !== "undefined" && uni.getLocale) {
      return uni.getLocale();
    }
    if (typeof global !== "undefined" && global.getLocale) {
      return global.getLocale();
    }
    return LOCALE_EN;
  }
  function initVueI18n(locale, messages2 = {}, fallbackLocale, watcher) {
    if (typeof locale !== "string") {
      const options = [
        messages2,
        locale
      ];
      locale = options[0];
      messages2 = options[1];
    }
    if (typeof locale !== "string") {
      locale = getDefaultLocale();
    }
    if (typeof fallbackLocale !== "string") {
      fallbackLocale = typeof __uniConfig !== "undefined" && __uniConfig.fallbackLocale || LOCALE_EN;
    }
    const i18n = new I18n({
      locale,
      fallbackLocale,
      messages: messages2,
      watcher
    });
    let t2 = (key, values) => {
      if (typeof getApp !== "function") {
        t2 = function(key2, values2) {
          return i18n.t(key2, values2);
        };
      } else {
        let isWatchedAppLocale = false;
        t2 = function(key2, values2) {
          const appVm = getApp().$vm;
          if (appVm) {
            appVm.$locale;
            if (!isWatchedAppLocale) {
              isWatchedAppLocale = true;
              watchAppLocale(appVm, i18n);
            }
          }
          return i18n.t(key2, values2);
        };
      }
      return t2(key, values);
    };
    return {
      i18n,
      f(message, values, delimiters) {
        return i18n.f(message, values, delimiters);
      },
      t(key, values) {
        return t2(key, values);
      },
      add(locale2, message, override = true) {
        return i18n.add(locale2, message, override);
      },
      watch(fn) {
        return i18n.watchLocale(fn);
      },
      getLocale() {
        return i18n.getLocale();
      },
      setLocale(newLocale) {
        return i18n.setLocale(newLocale);
      }
    };
  }
  const en$1 = {
    "uni-countdown.day": "day",
    "uni-countdown.h": "h",
    "uni-countdown.m": "m",
    "uni-countdown.s": "s"
  };
  const zhHans$1 = {
    "uni-countdown.day": "天",
    "uni-countdown.h": "时",
    "uni-countdown.m": "分",
    "uni-countdown.s": "秒"
  };
  const zhHant$1 = {
    "uni-countdown.day": "天",
    "uni-countdown.h": "時",
    "uni-countdown.m": "分",
    "uni-countdown.s": "秒"
  };
  const messages$1 = {
    en: en$1,
    "zh-Hans": zhHans$1,
    "zh-Hant": zhHant$1
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const {
    t: t$1
  } = initVueI18n(messages$1);
  const _sfc_main$l = {
    name: "UniCountdown",
    emits: ["timeup"],
    props: {
      showDay: {
        type: Boolean,
        default: true
      },
      showHour: {
        type: Boolean,
        default: true
      },
      showMinute: {
        type: Boolean,
        default: true
      },
      showColon: {
        type: Boolean,
        default: true
      },
      start: {
        type: Boolean,
        default: true
      },
      backgroundColor: {
        type: String,
        default: ""
      },
      color: {
        type: String,
        default: "#333"
      },
      fontSize: {
        type: Number,
        default: 14
      },
      splitorColor: {
        type: String,
        default: "#333"
      },
      day: {
        type: Number,
        default: 0
      },
      hour: {
        type: Number,
        default: 0
      },
      minute: {
        type: Number,
        default: 0
      },
      second: {
        type: Number,
        default: 0
      },
      timestamp: {
        type: Number,
        default: 0
      },
      filterShow: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        timer: null,
        syncFlag: false,
        d: "00",
        h: "00",
        i: "00",
        s: "00",
        leftTime: 0,
        seconds: 0
      };
    },
    computed: {
      dayText() {
        return t$1("uni-countdown.day");
      },
      hourText(val) {
        return t$1("uni-countdown.h");
      },
      minuteText(val) {
        return t$1("uni-countdown.m");
      },
      secondText(val) {
        return t$1("uni-countdown.s");
      },
      timeStyle() {
        const {
          color,
          backgroundColor,
          fontSize
        } = this;
        return {
          color,
          backgroundColor,
          fontSize: `${fontSize}px`,
          width: `${fontSize * 22 / 14}px`,
          // 按字体大小为 14px 时的比例缩放
          lineHeight: `${fontSize * 20 / 14}px`,
          borderRadius: `${fontSize * 3 / 14}px`
        };
      },
      splitorStyle() {
        const { splitorColor, fontSize, backgroundColor } = this;
        return {
          color: splitorColor,
          fontSize: `${fontSize * 12 / 14}px`,
          margin: backgroundColor ? `${fontSize * 4 / 14}px` : ""
        };
      }
    },
    watch: {
      day(val) {
        this.changeFlag();
      },
      hour(val) {
        this.changeFlag();
      },
      minute(val) {
        this.changeFlag();
      },
      second(val) {
        this.changeFlag();
      },
      start: {
        immediate: true,
        handler(newVal, oldVal) {
          if (newVal) {
            this.startData();
          } else {
            if (!oldVal)
              return;
            clearInterval(this.timer);
          }
        }
      }
    },
    created: function(e) {
      this.seconds = this.toSeconds(this.timestamp, this.day, this.hour, this.minute, this.second);
      this.countDown();
    },
    unmounted() {
      clearInterval(this.timer);
    },
    methods: {
      toSeconds(timestamp, day, hours, minutes, seconds) {
        if (timestamp) {
          return timestamp - parseInt((/* @__PURE__ */ new Date()).getTime() / 1e3, 10);
        }
        return day * 60 * 60 * 24 + hours * 60 * 60 + minutes * 60 + seconds;
      },
      timeUp() {
        clearInterval(this.timer);
        this.$emit("timeup");
      },
      countDown() {
        let seconds = this.seconds;
        let [day, hour, minute, second] = [0, 0, 0, 0];
        if (seconds > 0) {
          day = Math.floor(seconds / (60 * 60 * 24));
          hour = Math.floor(seconds / (60 * 60)) - day * 24;
          minute = Math.floor(seconds / 60) - day * 24 * 60 - hour * 60;
          second = Math.floor(seconds) - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60;
        } else {
          this.timeUp();
        }
        this.d = String(day).padStart(this.validFilterShow(this.filterShow.d), "0");
        this.h = String(hour).padStart(this.validFilterShow(this.filterShow.h), "0");
        this.i = String(minute).padStart(this.validFilterShow(this.filterShow.m), "0");
        this.s = String(second).padStart(this.validFilterShow(this.filterShow.s), "0");
      },
      validFilterShow(filter) {
        return filter && filter > 0 ? filter : 2;
      },
      startData() {
        this.seconds = this.toSeconds(this.timestamp, this.day, this.hour, this.minute, this.second);
        if (this.seconds <= 0) {
          this.seconds = this.toSeconds(0, 0, 0, 0, 0);
          this.countDown();
          return;
        }
        clearInterval(this.timer);
        this.countDown();
        this.timer = setInterval(() => {
          this.seconds--;
          if (this.seconds < 0) {
            this.timeUp();
            return;
          }
          this.countDown();
        }, 1e3);
      },
      update() {
        this.startData();
      },
      changeFlag() {
        if (!this.syncFlag) {
          this.seconds = this.toSeconds(this.timestamp, this.day, this.hour, this.minute, this.second);
          this.startData();
          this.syncFlag = true;
        }
      }
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-countdown" }, [
      $props.showDay ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 0,
          style: vue.normalizeStyle([$options.timeStyle]),
          class: "uni-countdown__number"
        },
        vue.toDisplayString($data.d),
        5
        /* TEXT, STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.showDay ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 1,
          style: vue.normalizeStyle([$options.splitorStyle]),
          class: "uni-countdown__splitor"
        },
        vue.toDisplayString($options.dayText),
        5
        /* TEXT, STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.showHour ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 2,
          style: vue.normalizeStyle([$options.timeStyle]),
          class: "uni-countdown__number"
        },
        vue.toDisplayString($data.h),
        5
        /* TEXT, STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.showHour ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 3,
          style: vue.normalizeStyle([$options.splitorStyle]),
          class: "uni-countdown__splitor"
        },
        vue.toDisplayString($props.showColon ? ":" : $options.hourText),
        5
        /* TEXT, STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.showMinute ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 4,
          style: vue.normalizeStyle([$options.timeStyle]),
          class: "uni-countdown__number"
        },
        vue.toDisplayString($data.i),
        5
        /* TEXT, STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.showMinute ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 5,
          style: vue.normalizeStyle([$options.splitorStyle]),
          class: "uni-countdown__splitor"
        },
        vue.toDisplayString($props.showColon ? ":" : $options.minuteText),
        5
        /* TEXT, STYLE */
      )) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode(
        "text",
        {
          style: vue.normalizeStyle([$options.timeStyle]),
          class: "uni-countdown__number"
        },
        vue.toDisplayString($data.s),
        5
        /* TEXT, STYLE */
      ),
      !$props.showColon ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 6,
          style: vue.normalizeStyle([$options.splitorStyle]),
          class: "uni-countdown__splitor"
        },
        vue.toDisplayString($options.secondText),
        5
        /* TEXT, STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$k], ["__scopeId", "data-v-c592f7f2"], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/uni_modules/uni-countdown/components/uni-countdown/uni-countdown.vue"]]);
  const _imports_0$5 = "/static/advertisement/headerIcon.jpg";
  const _sfc_main$k = {
    __name: "advertisement",
    setup(__props, { expose: __expose }) {
      __expose();
      function goToLogin() {
        formatAppLog("log", "at pages/advertisement/advertisement.vue:27", 1111);
        uni.reLaunch({
          url: "/pages/login/login"
        });
      }
      const __returned__ = { goToLogin };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_countdown = resolveEasycom(vue.resolveDynamicComponent("uni-countdown"), __easycom_0$1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("view", {
        onClick: $setup.goToLogin,
        class: "skip"
      }, [
        vue.createElementVNode("text", { style: { "margin-left": "5px" } }, "跳过"),
        vue.createVNode(_component_uni_countdown, {
          onTimeup: $setup.goToLogin,
          color: "#747474",
          second: 5,
          "show-day": false,
          "show-hour": false,
          "show-minute": false
        })
      ]),
      vue.createElementVNode("view", { class: "pageData" }, [
        vue.createElementVNode("image", {
          class: "headerImage",
          src: _imports_0$5
        }),
        vue.createElementVNode("text", { class: "title" }, "同游世界，共享风情"),
        vue.createElementVNode("br"),
        vue.createElementVNode("text", { class: "field" }, "一起去最美的远方"),
        vue.createElementVNode("button", {
          class: "gotoButton",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.goToLogin())
        }, "开始体验")
      ])
    ]);
  }
  const PagesAdvertisementAdvertisement = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$j], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/advertisement/advertisement.vue"]]);
  const fontData = [
    {
      "font_class": "arrow-down",
      "unicode": ""
    },
    {
      "font_class": "arrow-left",
      "unicode": ""
    },
    {
      "font_class": "arrow-right",
      "unicode": ""
    },
    {
      "font_class": "arrow-up",
      "unicode": ""
    },
    {
      "font_class": "auth",
      "unicode": ""
    },
    {
      "font_class": "auth-filled",
      "unicode": ""
    },
    {
      "font_class": "back",
      "unicode": ""
    },
    {
      "font_class": "bars",
      "unicode": ""
    },
    {
      "font_class": "calendar",
      "unicode": ""
    },
    {
      "font_class": "calendar-filled",
      "unicode": ""
    },
    {
      "font_class": "camera",
      "unicode": ""
    },
    {
      "font_class": "camera-filled",
      "unicode": ""
    },
    {
      "font_class": "cart",
      "unicode": ""
    },
    {
      "font_class": "cart-filled",
      "unicode": ""
    },
    {
      "font_class": "chat",
      "unicode": ""
    },
    {
      "font_class": "chat-filled",
      "unicode": ""
    },
    {
      "font_class": "chatboxes",
      "unicode": ""
    },
    {
      "font_class": "chatboxes-filled",
      "unicode": ""
    },
    {
      "font_class": "chatbubble",
      "unicode": ""
    },
    {
      "font_class": "chatbubble-filled",
      "unicode": ""
    },
    {
      "font_class": "checkbox",
      "unicode": ""
    },
    {
      "font_class": "checkbox-filled",
      "unicode": ""
    },
    {
      "font_class": "checkmarkempty",
      "unicode": ""
    },
    {
      "font_class": "circle",
      "unicode": ""
    },
    {
      "font_class": "circle-filled",
      "unicode": ""
    },
    {
      "font_class": "clear",
      "unicode": ""
    },
    {
      "font_class": "close",
      "unicode": ""
    },
    {
      "font_class": "closeempty",
      "unicode": ""
    },
    {
      "font_class": "cloud-download",
      "unicode": ""
    },
    {
      "font_class": "cloud-download-filled",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload-filled",
      "unicode": ""
    },
    {
      "font_class": "color",
      "unicode": ""
    },
    {
      "font_class": "color-filled",
      "unicode": ""
    },
    {
      "font_class": "compose",
      "unicode": ""
    },
    {
      "font_class": "contact",
      "unicode": ""
    },
    {
      "font_class": "contact-filled",
      "unicode": ""
    },
    {
      "font_class": "down",
      "unicode": ""
    },
    {
      "font_class": "bottom",
      "unicode": ""
    },
    {
      "font_class": "download",
      "unicode": ""
    },
    {
      "font_class": "download-filled",
      "unicode": ""
    },
    {
      "font_class": "email",
      "unicode": ""
    },
    {
      "font_class": "email-filled",
      "unicode": ""
    },
    {
      "font_class": "eye",
      "unicode": ""
    },
    {
      "font_class": "eye-filled",
      "unicode": ""
    },
    {
      "font_class": "eye-slash",
      "unicode": ""
    },
    {
      "font_class": "eye-slash-filled",
      "unicode": ""
    },
    {
      "font_class": "fire",
      "unicode": ""
    },
    {
      "font_class": "fire-filled",
      "unicode": ""
    },
    {
      "font_class": "flag",
      "unicode": ""
    },
    {
      "font_class": "flag-filled",
      "unicode": ""
    },
    {
      "font_class": "folder-add",
      "unicode": ""
    },
    {
      "font_class": "folder-add-filled",
      "unicode": ""
    },
    {
      "font_class": "font",
      "unicode": ""
    },
    {
      "font_class": "forward",
      "unicode": ""
    },
    {
      "font_class": "gear",
      "unicode": ""
    },
    {
      "font_class": "gear-filled",
      "unicode": ""
    },
    {
      "font_class": "gift",
      "unicode": ""
    },
    {
      "font_class": "gift-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-down",
      "unicode": ""
    },
    {
      "font_class": "hand-down-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-up",
      "unicode": ""
    },
    {
      "font_class": "hand-up-filled",
      "unicode": ""
    },
    {
      "font_class": "headphones",
      "unicode": ""
    },
    {
      "font_class": "heart",
      "unicode": ""
    },
    {
      "font_class": "heart-filled",
      "unicode": ""
    },
    {
      "font_class": "help",
      "unicode": ""
    },
    {
      "font_class": "help-filled",
      "unicode": ""
    },
    {
      "font_class": "home",
      "unicode": ""
    },
    {
      "font_class": "home-filled",
      "unicode": ""
    },
    {
      "font_class": "image",
      "unicode": ""
    },
    {
      "font_class": "image-filled",
      "unicode": ""
    },
    {
      "font_class": "images",
      "unicode": ""
    },
    {
      "font_class": "images-filled",
      "unicode": ""
    },
    {
      "font_class": "info",
      "unicode": ""
    },
    {
      "font_class": "info-filled",
      "unicode": ""
    },
    {
      "font_class": "left",
      "unicode": ""
    },
    {
      "font_class": "link",
      "unicode": ""
    },
    {
      "font_class": "list",
      "unicode": ""
    },
    {
      "font_class": "location",
      "unicode": ""
    },
    {
      "font_class": "location-filled",
      "unicode": ""
    },
    {
      "font_class": "locked",
      "unicode": ""
    },
    {
      "font_class": "locked-filled",
      "unicode": ""
    },
    {
      "font_class": "loop",
      "unicode": ""
    },
    {
      "font_class": "mail-open",
      "unicode": ""
    },
    {
      "font_class": "mail-open-filled",
      "unicode": ""
    },
    {
      "font_class": "map",
      "unicode": ""
    },
    {
      "font_class": "map-filled",
      "unicode": ""
    },
    {
      "font_class": "map-pin",
      "unicode": ""
    },
    {
      "font_class": "map-pin-ellipse",
      "unicode": ""
    },
    {
      "font_class": "medal",
      "unicode": ""
    },
    {
      "font_class": "medal-filled",
      "unicode": ""
    },
    {
      "font_class": "mic",
      "unicode": ""
    },
    {
      "font_class": "mic-filled",
      "unicode": ""
    },
    {
      "font_class": "micoff",
      "unicode": ""
    },
    {
      "font_class": "micoff-filled",
      "unicode": ""
    },
    {
      "font_class": "minus",
      "unicode": ""
    },
    {
      "font_class": "minus-filled",
      "unicode": ""
    },
    {
      "font_class": "more",
      "unicode": ""
    },
    {
      "font_class": "more-filled",
      "unicode": ""
    },
    {
      "font_class": "navigate",
      "unicode": ""
    },
    {
      "font_class": "navigate-filled",
      "unicode": ""
    },
    {
      "font_class": "notification",
      "unicode": ""
    },
    {
      "font_class": "notification-filled",
      "unicode": ""
    },
    {
      "font_class": "paperclip",
      "unicode": ""
    },
    {
      "font_class": "paperplane",
      "unicode": ""
    },
    {
      "font_class": "paperplane-filled",
      "unicode": ""
    },
    {
      "font_class": "person",
      "unicode": ""
    },
    {
      "font_class": "person-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled-copy",
      "unicode": ""
    },
    {
      "font_class": "phone",
      "unicode": ""
    },
    {
      "font_class": "phone-filled",
      "unicode": ""
    },
    {
      "font_class": "plus",
      "unicode": ""
    },
    {
      "font_class": "plus-filled",
      "unicode": ""
    },
    {
      "font_class": "plusempty",
      "unicode": ""
    },
    {
      "font_class": "pulldown",
      "unicode": ""
    },
    {
      "font_class": "pyq",
      "unicode": ""
    },
    {
      "font_class": "qq",
      "unicode": ""
    },
    {
      "font_class": "redo",
      "unicode": ""
    },
    {
      "font_class": "redo-filled",
      "unicode": ""
    },
    {
      "font_class": "refresh",
      "unicode": ""
    },
    {
      "font_class": "refresh-filled",
      "unicode": ""
    },
    {
      "font_class": "refreshempty",
      "unicode": ""
    },
    {
      "font_class": "reload",
      "unicode": ""
    },
    {
      "font_class": "right",
      "unicode": ""
    },
    {
      "font_class": "scan",
      "unicode": ""
    },
    {
      "font_class": "search",
      "unicode": ""
    },
    {
      "font_class": "settings",
      "unicode": ""
    },
    {
      "font_class": "settings-filled",
      "unicode": ""
    },
    {
      "font_class": "shop",
      "unicode": ""
    },
    {
      "font_class": "shop-filled",
      "unicode": ""
    },
    {
      "font_class": "smallcircle",
      "unicode": ""
    },
    {
      "font_class": "smallcircle-filled",
      "unicode": ""
    },
    {
      "font_class": "sound",
      "unicode": ""
    },
    {
      "font_class": "sound-filled",
      "unicode": ""
    },
    {
      "font_class": "spinner-cycle",
      "unicode": ""
    },
    {
      "font_class": "staff",
      "unicode": ""
    },
    {
      "font_class": "staff-filled",
      "unicode": ""
    },
    {
      "font_class": "star",
      "unicode": ""
    },
    {
      "font_class": "star-filled",
      "unicode": ""
    },
    {
      "font_class": "starhalf",
      "unicode": ""
    },
    {
      "font_class": "trash",
      "unicode": ""
    },
    {
      "font_class": "trash-filled",
      "unicode": ""
    },
    {
      "font_class": "tune",
      "unicode": ""
    },
    {
      "font_class": "tune-filled",
      "unicode": ""
    },
    {
      "font_class": "undo",
      "unicode": ""
    },
    {
      "font_class": "undo-filled",
      "unicode": ""
    },
    {
      "font_class": "up",
      "unicode": ""
    },
    {
      "font_class": "top",
      "unicode": ""
    },
    {
      "font_class": "upload",
      "unicode": ""
    },
    {
      "font_class": "upload-filled",
      "unicode": ""
    },
    {
      "font_class": "videocam",
      "unicode": ""
    },
    {
      "font_class": "videocam-filled",
      "unicode": ""
    },
    {
      "font_class": "vip",
      "unicode": ""
    },
    {
      "font_class": "vip-filled",
      "unicode": ""
    },
    {
      "font_class": "wallet",
      "unicode": ""
    },
    {
      "font_class": "wallet-filled",
      "unicode": ""
    },
    {
      "font_class": "weibo",
      "unicode": ""
    },
    {
      "font_class": "weixin",
      "unicode": ""
    }
  ];
  const getVal$1 = (val) => {
    const reg = /^[0-9]*$/g;
    return typeof val === "number" || reg.test(val) ? val + "px" : val;
  };
  const _sfc_main$j = {
    name: "UniIcons",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: ""
      },
      color: {
        type: String,
        default: "#333333"
      },
      size: {
        type: [Number, String],
        default: 16
      },
      customPrefix: {
        type: String,
        default: ""
      },
      fontFamily: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        icons: fontData
      };
    },
    computed: {
      unicode() {
        let code = this.icons.find((v) => v.font_class === this.type);
        if (code) {
          return code.unicode;
        }
        return "";
      },
      iconSize() {
        return getVal$1(this.size);
      },
      styleObj() {
        if (this.fontFamily !== "") {
          return `color: ${this.color}; font-size: ${this.iconSize}; font-family: ${this.fontFamily};`;
        }
        return `color: ${this.color}; font-size: ${this.iconSize};`;
      }
    },
    methods: {
      _onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "text",
      {
        style: vue.normalizeStyle($options.styleObj),
        class: vue.normalizeClass(["uni-icons", ["uniui-" + $props.type, $props.customPrefix, $props.customPrefix ? $props.type : ""]]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options._onClick && $options._onClick(...args))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$i], ["__scopeId", "data-v-d31e1c47"], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
  const _imports_0$4 = "/static/login/video.mp4";
  const _sfc_main$i = {
    __name: "login",
    setup(__props, { expose: __expose }) {
      __expose();
      let username = vue.ref("super");
      let password = vue.ref("123456");
      let rememberPassword = vue.ref(false);
      let showPassword = vue.ref(true);
      function changePassword() {
        formatAppLog("log", "at pages/login/login.vue:40", "11111111");
        showPassword.value = !showPassword.value;
        formatAppLog("log", "at pages/login/login.vue:42", showPassword.value);
      }
      function gotorgister() {
        uni.navigateTo({
          url: "/pages/register/register"
        });
      }
      async function login() {
        let res = await uni.request({
          url: "http://59.46.190.164:7080/api/login",
          method: "POST",
          data: {
            "username": username.value,
            "password": password.value
          }
        });
        formatAppLog("log", "at pages/login/login.vue:116", res);
        if (res.data.code == 200) {
          uni.setStorage({
            key: "token",
            data: res.data.token
          });
          uni.reLaunch({
            url: "/pages/index/index"
          });
          formatAppLog("log", "at pages/login/login.vue:125", res);
          formatAppLog("log", "at pages/login/login.vue:126", uni.getStorageSync("token"));
        } else {
          uni.showToast({
            duration: 1500,
            title: "用户名或密码错误"
          });
        }
      }
      const __returned__ = { get username() {
        return username;
      }, set username(v) {
        username = v;
      }, get password() {
        return password;
      }, set password(v) {
        password = v;
      }, get rememberPassword() {
        return rememberPassword;
      }, set rememberPassword(v) {
        rememberPassword = v;
      }, get showPassword() {
        return showPassword;
      }, set showPassword(v) {
        showPassword = v;
      }, changePassword, gotorgister, login, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("view", { class: "page" }, [
        vue.createElementVNode("view", { class: "pageContent" }, [
          vue.createElementVNode("text", { class: "title" }, "欢迎登录智慧景区系统"),
          vue.createElementVNode("text", { class: "tips" }, "请登录:"),
          vue.createElementVNode("form", null, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "userNameInput",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.username = $event),
                placeholder: "请输入用户名"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.username]
            ]),
            vue.createElementVNode("view", { class: "passswordInputview uni-form-item" }, [
              vue.withDirectives(vue.createElementVNode("input", {
                class: "passswordInput uni-input",
                placeholder: "请输入密码",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.password = $event),
                password: $setup.showPassword
              }, null, 8, ["password"]), [
                [vue.vModelText, $setup.password]
              ]),
              $setup.showPassword ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                key: 0,
                type: "eye",
                size: "30",
                onClick: $setup.changePassword,
                color: "rgb(2 ,135, 253)"
              })) : (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                key: 1,
                type: "eye-slash",
                size: "30",
                onClick: $setup.changePassword
              }))
            ]),
            vue.createElementVNode("checkbox", {
              value: "rememberPassword",
              class: "rememberPassword"
            }),
            vue.createTextVNode("记住密码 "),
            vue.createElementVNode("button", {
              class: "login",
              onClick: $setup.login
            }, "登录"),
            vue.createElementVNode("text", { class: "registrationPrompt" }, [
              vue.createTextVNode(" 没有账号？去"),
              vue.createElementVNode("text", {
                class: "regins",
                onClick: $setup.gotorgister
              }, "注册")
            ])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "video-background" }, [
        vue.createElementVNode("video", {
          src: _imports_0$4,
          "object-fit": "cover",
          autoplay: true,
          controls: false,
          muted: true,
          loop: true,
          id: "videoRef",
          class: "video"
        })
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$h], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/login/login.vue"]]);
  const _sfc_main$h = {
    name: "UniRate",
    props: {
      isFill: {
        // 星星的类型，是否镂空
        type: [Boolean, String],
        default: true
      },
      color: {
        // 星星未选中的颜色
        type: String,
        default: "#ececec"
      },
      activeColor: {
        // 星星选中状态颜色
        type: String,
        default: "#ffca3e"
      },
      disabledColor: {
        // 星星禁用状态颜色
        type: String,
        default: "#c0c0c0"
      },
      size: {
        // 星星的大小
        type: [Number, String],
        default: 24
      },
      value: {
        // 当前评分
        type: [Number, String],
        default: 0
      },
      modelValue: {
        // 当前评分
        type: [Number, String],
        default: 0
      },
      max: {
        // 最大评分
        type: [Number, String],
        default: 5
      },
      margin: {
        // 星星的间距
        type: [Number, String],
        default: 0
      },
      disabled: {
        // 是否可点击
        type: [Boolean, String],
        default: false
      },
      readonly: {
        // 是否只读
        type: [Boolean, String],
        default: false
      },
      allowHalf: {
        // 是否显示半星
        type: [Boolean, String],
        default: false
      },
      touchable: {
        // 是否支持滑动手势
        type: [Boolean, String],
        default: true
      }
    },
    data() {
      return {
        valueSync: "",
        userMouseFristMove: true,
        userRated: false,
        userLastRate: 1
      };
    },
    watch: {
      value(newVal) {
        this.valueSync = Number(newVal);
      },
      modelValue(newVal) {
        this.valueSync = Number(newVal);
      }
    },
    computed: {
      stars() {
        const value = this.valueSync ? this.valueSync : 0;
        const starList = [];
        const floorValue = Math.floor(value);
        const ceilValue = Math.ceil(value);
        for (let i = 0; i < this.max; i++) {
          if (floorValue > i) {
            starList.push({
              activeWitch: "100%"
            });
          } else if (ceilValue - 1 === i) {
            starList.push({
              activeWitch: (value - floorValue) * 100 + "%"
            });
          } else {
            starList.push({
              activeWitch: "0"
            });
          }
        }
        return starList;
      },
      marginNumber() {
        return Number(this.margin);
      }
    },
    created() {
      this.valueSync = Number(this.value || this.modelValue);
      this._rateBoxLeft = 0;
      this._oldValue = null;
    },
    mounted() {
      setTimeout(() => {
        this._getSize();
      }, 100);
    },
    methods: {
      touchstart(e) {
        if (this.readonly || this.disabled)
          return;
        const {
          clientX,
          screenX
        } = e.changedTouches[0];
        this._getRateCount(clientX || screenX);
      },
      touchmove(e) {
        if (this.readonly || this.disabled || !this.touchable)
          return;
        const {
          clientX,
          screenX
        } = e.changedTouches[0];
        this._getRateCount(clientX || screenX);
      },
      /**
       * 兼容 PC @tian
       */
      mousedown(e) {
      },
      mousemove(e) {
      },
      mouseleave(e) {
      },
      /**
       * 获取星星个数
       */
      _getRateCount(clientX) {
        this._getSize();
        const size = Number(this.size);
        if (isNaN(size)) {
          return new Error("size 属性只能设置为数字");
        }
        const rateMoveRange = clientX - this._rateBoxLeft;
        let index = parseInt(rateMoveRange / (size + this.marginNumber));
        index = index < 0 ? 0 : index;
        index = index > this.max ? this.max : index;
        const range = parseInt(rateMoveRange - (size + this.marginNumber) * index);
        let value = 0;
        if (this._oldValue === index && !this.PC)
          return;
        this._oldValue = index;
        if (this.allowHalf) {
          if (range > size / 2) {
            value = index + 1;
          } else {
            value = index + 0.5;
          }
        } else {
          value = index + 1;
        }
        value = Math.max(0.5, Math.min(value, this.max));
        this.valueSync = value;
        this._onChange();
      },
      /**
       * 触发动态修改
       */
      _onChange() {
        this.$emit("input", this.valueSync);
        this.$emit("update:modelValue", this.valueSync);
        this.$emit("change", {
          value: this.valueSync
        });
      },
      /**
       * 获取星星距离屏幕左侧距离
       */
      _getSize() {
        uni.createSelectorQuery().in(this).select(".uni-rate").boundingClientRect().exec((ret) => {
          if (ret) {
            this._rateBoxLeft = ret[0].left;
          }
        });
      }
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode(
        "view",
        {
          ref: "uni-rate",
          class: "uni-rate"
        },
        [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($options.stars, (star, index) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  class: vue.normalizeClass(["uni-rate__icon", { "uni-cursor-not-allowed": $props.disabled }]),
                  style: vue.normalizeStyle({ "margin-right": $options.marginNumber + "px" }),
                  key: index,
                  onTouchstart: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.touchstart && $options.touchstart(...args), ["stop"])),
                  onTouchmove: _cache[1] || (_cache[1] = vue.withModifiers((...args) => $options.touchmove && $options.touchmove(...args), ["stop"])),
                  onMousedown: _cache[2] || (_cache[2] = vue.withModifiers((...args) => $options.mousedown && $options.mousedown(...args), ["stop"])),
                  onMousemove: _cache[3] || (_cache[3] = vue.withModifiers((...args) => $options.mousemove && $options.mousemove(...args), ["stop"])),
                  onMouseleave: _cache[4] || (_cache[4] = (...args) => $options.mouseleave && $options.mouseleave(...args))
                },
                [
                  vue.createVNode(_component_uni_icons, {
                    color: $props.color,
                    size: $props.size,
                    type: $props.isFill ? "star-filled" : "star"
                  }, null, 8, ["color", "size", "type"]),
                  vue.createElementVNode(
                    "view",
                    {
                      style: vue.normalizeStyle({ width: star.activeWitch }),
                      class: "uni-rate__icon-on"
                    },
                    [
                      vue.createVNode(_component_uni_icons, {
                        color: $props.disabled ? $props.disabledColor : $props.activeColor,
                        size: $props.size,
                        type: "star-filled"
                      }, null, 8, ["color", "size"])
                    ],
                    4
                    /* STYLE */
                  )
                ],
                38
                /* CLASS, STYLE, NEED_HYDRATION */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const __easycom_4 = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__scopeId", "data-v-5c8fbdf3"], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/uni_modules/uni-rate/components/uni-rate/uni-rate.vue"]]);
  const _imports_0$3 = "/static/index/carouselChart/1191728953784_.pic.jpg";
  const _imports_1$1 = "/static/index/carouselChart/1161728953781_.pic_hd.jpg";
  const _imports_2$1 = "/static/index/carouselChart/1171728953782_.pic_hd.jpg";
  const _imports_3 = "/static/index/carouselChart/1161728953781_.pic_hd.jpg";
  const _imports_4 = "/static/index/icon/tickets.png";
  const _imports_5 = "/static/index/icon/guidedTour.png";
  const _imports_6 = "/static/index/icon/appointment.png";
  const _imports_7 = "/static/index/icon/raiders.png";
  const _imports_0$2 = "/static/index/icon/albumIcon.png";
  const _sfc_main$g = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      let result = vue.ref();
      let listData = vue.ref();
      let storageData = vue.ref();
      onLoad((options) => {
        getResurt();
        getListData();
      });
      function getListData() {
        uni.request({
          method: "GET",
          url: "http://59.46.190.164:7080/appScenic/appAlbum/homeList?pageNum=1&pageSize=4",
          token: uni.getStorageSync("token"),
          header: {
            Authorization: uni.getStorageSync("token")
          }
        }).then((res) => {
          formatAppLog("log", "at pages/index/index.vue:164", res.data.code);
          if (res.data.code == 400 || res.data.code == 401) {
            gotoLogin();
          }
          listData.value = res.data.rows;
        });
      }
      function gotoLogin() {
        uni.reLaunch({
          url: "/pages/login/login"
        });
      }
      function getResurt() {
        let sData = uni.getStorageSync("storageData");
        if (sData != null) {
          result.value = sData;
        } else {
          uni.request({
            method: "GET",
            url: "http://59.46.190.164:7080/appScenic/scenic/list?pageNum=1&pageSize=6",
            token: uni.getStorageSync("token"),
            header: {
              Authorization: uni.getStorageSync("token")
            }
          }).then((res) => {
            result.value = res.data.rows;
            uni.setStorageSync("storageData", res.data.rows);
          });
        }
      }
      function gotoScenicAlbum() {
        uni.navigateTo({
          url: "/pages/scenicAlbum/scenicAlbum"
        });
      }
      function gotoInfo(id) {
        formatAppLog("log", "at pages/index/index.vue:216", id);
        uni.navigateTo({
          url: "/pages/showInfo/showInfo?id=" + id
        });
      }
      function gotoActivities() {
        uni.switchTab({
          url: "/pages/activities/activities"
        });
      }
      const __returned__ = { get result() {
        return result;
      }, set result(v) {
        result = v;
      }, get listData() {
        return listData;
      }, set listData(v) {
        listData = v;
      }, get storageData() {
        return storageData;
      }, set storageData(v) {
        storageData = v;
      }, getListData, gotoLogin, getResurt, gotoScenicAlbum, gotoInfo, gotoActivities, ref: vue.ref, get onLaunch() {
        return onLaunch;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      }, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_rate = resolveEasycom(vue.resolveDynamicComponent("uni-rate"), __easycom_4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("view", { class: "pageHader" }, [
        vue.createElementVNode("swiper", {
          class: "swiper",
          "indicator-dots": "true",
          autoplay: "",
          circular: ""
        }, [
          vue.createElementVNode("swiper-item", null, [
            vue.createElementVNode("image", {
              mode: "widthFix",
              src: _imports_0$3
            })
          ]),
          vue.createElementVNode("swiper-item", null, [
            vue.createElementVNode("image", {
              mode: "widthFix",
              src: _imports_1$1
            })
          ]),
          vue.createElementVNode("swiper-item", null, [
            vue.createElementVNode("image", {
              mode: "widthFix",
              src: _imports_2$1
            })
          ]),
          vue.createElementVNode("swiper-item", null, [
            vue.createElementVNode("image", {
              mode: "widthFix",
              src: _imports_3
            })
          ])
        ]),
        vue.createElementVNode("view", { class: "menu" }, [
          vue.createElementVNode("view", { class: "menuItem" }, [
            vue.createElementVNode("image", { src: _imports_4 }),
            vue.createElementVNode("text", null, "门票购买")
          ]),
          vue.createElementVNode("view", { class: "menuItem" }, [
            vue.createElementVNode("image", { src: _imports_5 }),
            vue.createElementVNode("text", null, "景区导览")
          ]),
          vue.createElementVNode("navigator", {
            url: "/pages/activities/activities",
            onClick: $setup.gotoActivities
          }, [
            vue.createElementVNode("view", { class: "menuItem" }, [
              vue.createElementVNode("image", { src: _imports_6 }),
              vue.createElementVNode("text", null, "活动预约")
            ])
          ]),
          vue.createElementVNode("navigator", { url: "/pages/raiders/raiders" }, [
            vue.createElementVNode("view", { class: "menuItem" }, [
              vue.createElementVNode("image", { src: _imports_7 }),
              vue.createElementVNode("text", null, "游玩攻略")
            ])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "scenicSpotTickets" }, [
        vue.createElementVNode("view", { class: "pagetitle" }, [
          vue.createElementVNode("view", null, [
            vue.createElementVNode("text", { style: { "font-size": "25px", "margin-right": "5px", "color": "#ed7e49", "font-weight": "1000" } }, "|"),
            vue.createElementVNode("text", { class: "title" }, "景区门票")
          ]),
          vue.createElementVNode("text", { class: "more" }, "更多> ")
        ]),
        vue.createElementVNode("view", { class: "ticketsList" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.result, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "ticketsListItem",
                onClick: ($event) => $setup.gotoInfo(item.id)
              }, [
                vue.createElementVNode("image", {
                  mode: "aspectFill",
                  src: `http://59.46.190.164:7080${item.cover}`
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "itemcontent" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "title" },
                    vue.toDisplayString(item.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "Introduction" },
                    vue.toDisplayString(item.describe),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { style: { "display": "flex", "align-items": "center" } }, [
                    vue.createVNode(_component_uni_rate, {
                      "allow-half": "",
                      value: item.starLevel,
                      size: 18,
                      touchable: "false"
                    }, null, 8, ["value"]),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(item.evaluationNum) + " 条评价",
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", null, [
                    vue.createElementVNode(
                      "text",
                      { class: "price" },
                      "¥" + vue.toDisplayString(item.price),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", null, "起")
                  ])
                ])
              ], 8, ["onClick"]);
            }),
            256
            /* UNKEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createElementVNode("view", { class: "activityReservation" }, [
        vue.createElementVNode("view", { class: "pagetitle" }, [
          vue.createElementVNode("view", null, [
            vue.createElementVNode("text", { style: { "font-size": "25px", "margin-right": "5px", "color": "#ed7e49", "font-weight": "1000" } }, "|"),
            vue.createElementVNode("text", { class: "title" }, "活动预约")
          ]),
          vue.createElementVNode("text", {
            class: "more",
            onClick: $setup.gotoActivities
          }, "更多> ")
        ]),
        vue.createElementVNode("view", { class: "item" }, [
          vue.createElementVNode("image", {
            mode: "aspectFill",
            src: "http://59.46.190.164:7080/profile/scenic/activity/cover/2023/02/08/cb2e13ea-9266-4b52-b580-8cedbe986d38.png"
          }),
          vue.createElementVNode("view", { class: "itemContent" }, [
            vue.createElementVNode("text", { class: "title" }, "侏罗纪欢乐岛"),
            vue.createElementVNode("text", { class: "describe" }, "欢乐岛整体以侏罗纪为年代背景，利用特色假山、沙地、雨林、恐龙骨胳进行造景.}"),
            vue.createElementVNode("view", { class: "dictLabelDiv" }, [
              vue.createElementVNode("text", { class: "dictLabel" }, "体重在120kg以下")
            ])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "scenicAlbum" }, [
        vue.createElementVNode("view", { class: "pagetitle" }, [
          vue.createElementVNode("view", null, [
            vue.createElementVNode("text", { style: { "font-size": "25px", "margin-right": "5px", "color": "#ed7e49", "font-weight": "1000" } }, "|"),
            vue.createElementVNode("text", { class: "title" }, "景区相册")
          ]),
          vue.createElementVNode("text", {
            class: "more",
            onClick: $setup.gotoScenicAlbum
          }, "更多> ")
        ]),
        vue.createElementVNode("view", { class: "albumContent" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.listData, (item) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  class: "albumContentItem",
                  style: vue.normalizeStyle({ backgroundImage: `url(http://59.46.190.164:7080${item.coverPath})` })
                },
                [
                  vue.createElementVNode("view", null, [
                    vue.createElementVNode("image", {
                      class: "albumIcon",
                      src: _imports_0$2
                    }),
                    vue.createElementVNode(
                      "text",
                      { class: "title" },
                      vue.toDisplayString(item.title),
                      1
                      /* TEXT */
                    )
                  ])
                ],
                4
                /* STYLE */
              );
            }),
            256
            /* UNKEYED_FRAGMENT */
          ))
        ])
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/index/index.vue"]]);
  const _sfc_main$f = {
    __name: "register",
    setup(__props, { expose: __expose }) {
      __expose();
      let showPassword = vue.ref(false);
      let agreeOrNot = vue.ref(false);
      const __returned__ = { get showPassword() {
        return showPassword;
      }, set showPassword(v) {
        showPassword = v;
      }, get agreeOrNot() {
        return agreeOrNot;
      }, set agreeOrNot(v) {
        agreeOrNot = v;
      }, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "contentView" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("text", { class: "title" }, "欢迎注册智慧景区"),
        vue.createElementVNode("text", { class: "tips" }, " 请注册: "),
        vue.createElementVNode("input", {
          class: "username",
          focus: "",
          placeholder: "请输入用户名"
        }),
        vue.createElementVNode("view", { class: "uni-input-wrapper" }, [
          vue.createElementVNode("input", {
            class: "userpassword",
            placeholder: "请输入密码",
            password: $setup.showPassword
          }, null, 8, ["password"]),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["uni-icon", [!$setup.showPassword ? "uni-eye-active" : ""]]),
              onClick: _cache[0] || (_cache[0] = (...args) => _ctx.changePassword && _ctx.changePassword(...args))
            },
            "",
            2
            /* CLASS */
          )
        ]),
        vue.createElementVNode("input", {
          class: "nicename",
          focus: "",
          placeholder: "请输入昵称"
        }),
        vue.createElementVNode("button", { class: "login" }, "注册"),
        vue.createElementVNode("checkbox", { value: "agreeOrNot" }),
        vue.createTextVNode("我已同意 ")
      ])
    ]);
  }
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/register/register.vue"]]);
  const _sfc_main$e = {
    __name: "activities",
    setup(__props, { expose: __expose }) {
      __expose();
      let response = vue.ref();
      onLoad(() => {
        uni.request({
          method: "GET",
          url: "http://59.46.190.164:7080/appScenic/activity/list",
          token: uni.getStorageSync("token"),
          header: {
            Authorization: uni.getStorageSync("token")
          }
        }).then((res) => {
          formatAppLog("log", "at pages/activities/activities.vue:48", res.data.rows);
          response.value = res.data.rows;
        });
      });
      const __returned__ = { get response() {
        return response;
      }, set response(v) {
        response = v;
      }, ref: vue.ref, get onLaunch() {
        return onLaunch;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      }, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "content"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.response, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", { class: "item" }, [
              vue.createElementVNode("image", {
                mode: "aspectFill",
                src: `http://59.46.190.164:7080${item.cover}`
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { class: "itemContent" }, [
                vue.createElementVNode(
                  "text",
                  { class: "title" },
                  vue.toDisplayString(item.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "describe" },
                  vue.toDisplayString(item.describe),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "dictLabelDiv" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(item.limitList, (limitList) => {
                      return vue.openBlock(), vue.createElementBlock(
                        "text",
                        { class: "dictLabel" },
                        vue.toDisplayString(limitList.dictLabel),
                        1
                        /* TEXT */
                      );
                    }),
                    256
                    /* UNKEYED_FRAGMENT */
                  ))
                ])
              ])
            ]);
          }),
          256
          /* UNKEYED_FRAGMENT */
        ))
      ])
    ]);
  }
  const PagesActivitiesActivities = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/activities/activities.vue"]]);
  const _imports_0$1 = "/static/my/bg.jpg";
  const _imports_1 = "/static/my/wallet.png";
  const _imports_2 = "/static/my/clear.png";
  const _sfc_main$d = {
    __name: "my",
    setup(__props, { expose: __expose }) {
      __expose();
      onLoad(() => {
        getUserInfoData();
      });
      let resure = vue.ref({
        msg: "操作成功",
        code: 200,
        data: {
          isLike: 0,
          isSave: 0,
          isClick: 0,
          likeNum: 1,
          saveNum: 2,
          clickNum: 1,
          trackNum: 3
        }
      });
      let userInfo = vue.ref();
      function gotoPage(i) {
        switch (i) {
          case 1:
            uni.navigateTo({
              url: "/pages/myFavorite/myFavorite/?id=" + userInfo.value.id
            });
            break;
          case 2:
            uni.navigateTo({
              url: "/pages/myCollection/myCollection"
            });
            break;
          default:
            uni.navigateTo({
              url: "/pages/myFootprints/myFootprints"
            });
        }
      }
      function clickLogout() {
        uni.showModal({
          title: "是否确认退出",
          cancelText: "取消",
          confirmText: "确定",
          complete: (res) => {
            if (res.confirm) {
              logout();
            }
          }
        });
      }
      function logout() {
        uni.request({
          url: "http://59.46.190.164:7080/logout",
          method: "POST",
          header: {
            Authorization: uni.getStorageSync("token")
          }
        }).then((res) => {
          formatAppLog("log", "at pages/my/my.vue:117", res.data.code);
          if (res.data.code == 200) {
            uni.removeStorageSync("token");
            uni.reLaunch({
              url: "/pages/login/login"
            });
          }
        });
      }
      function getUserInfoData() {
        uni.request({
          url: "http://59.46.190.164:7080/appScenic/appUserInfo",
          method: "POST",
          header: {
            Authorization: uni.getStorageSync("token")
          }
        }).then((res) => {
          formatAppLog("log", "at pages/my/my.vue:140", res.data.data);
          userInfo.value = res.data.data;
        });
      }
      const myData = vue.ref([
        {
          value: resure.value.data.likeNum,
          label: "喜欢",
          id: 1
        },
        {
          value: resure.value.data.saveNum,
          label: "收藏",
          id: 2
        },
        {
          value: resure.value.data.trackNum,
          label: "足迹",
          id: 3
        }
      ]);
      const __returned__ = { get resure() {
        return resure;
      }, set resure(v) {
        resure = v;
      }, get userInfo() {
        return userInfo;
      }, set userInfo(v) {
        userInfo = v;
      }, gotoPage, clickLogout, logout, getUserInfoData, myData, ref: vue.ref, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode("image", {
        class: "bg",
        src: _imports_0$1
      }),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("image", {
          src: "",
          class: "avatar"
        }),
        vue.createElementVNode("view", { class: "myData" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.myData, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "myDataItem",
                key: index,
                onClick: ($event) => $setup.gotoPage(item.id)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "value" },
                  vue.toDisplayString(item.value),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(item.label),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", { class: "list" }, [
          vue.createElementVNode("view", { class: "list-item" }, [
            vue.createElementVNode("view", null, [
              vue.createElementVNode("image", { src: _imports_1 }),
              vue.createElementVNode("text", null, "我的钱包")
            ]),
            vue.createElementVNode("text", { class: "arrow" }, ">")
          ]),
          vue.createElementVNode("view", { class: "list-item" }, [
            vue.createElementVNode("view", null, [
              vue.createElementVNode("image", { src: _imports_2 }),
              vue.createElementVNode("text", null, "清除缓存")
            ]),
            vue.createElementVNode("view", { class: "cache-info" }, [
              vue.createElementVNode("text", null, "23.588M"),
              vue.createElementVNode("text", { class: "arrow" }, ">")
            ])
          ])
        ]),
        vue.createElementVNode("button", {
          onClick: $setup.clickLogout,
          class: "logout"
        }, "退出登录")
      ])
    ]);
  }
  const PagesMyMy = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/my/my.vue"]]);
  const en = {
    "uni-fav.collect": "collect",
    "uni-fav.collected": "collected"
  };
  const zhHans = {
    "uni-fav.collect": "收藏",
    "uni-fav.collected": "已收藏"
  };
  const zhHant = {
    "uni-fav.collect": "收藏",
    "uni-fav.collected": "已收藏"
  };
  const messages = {
    en,
    "zh-Hans": zhHans,
    "zh-Hant": zhHant
  };
  const { t } = initVueI18n(messages);
  const _sfc_main$c = {
    name: "UniFav",
    // TODO 兼容 vue3，需要注册事件
    emits: ["click"],
    props: {
      star: {
        type: [Boolean, String],
        default: true
      },
      bgColor: {
        type: String,
        default: "#eeeeee"
      },
      fgColor: {
        type: String,
        default: "#666666"
      },
      bgColorChecked: {
        type: String,
        default: "#007aff"
      },
      fgColorChecked: {
        type: String,
        default: "#FFFFFF"
      },
      circle: {
        type: [Boolean, String],
        default: false
      },
      checked: {
        type: Boolean,
        default: false
      },
      contentText: {
        type: Object,
        default() {
          return {
            contentDefault: "",
            contentFav: ""
          };
        }
      },
      stat: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      contentDefault() {
        return this.contentText.contentDefault || t("uni-fav.collect");
      },
      contentFav() {
        return this.contentText.contentFav || t("uni-fav.collected");
      }
    },
    watch: {
      checked() {
        if (uni.report && this.stat) {
          if (this.checked) {
            uni.report("收藏", "收藏");
          } else {
            uni.report("取消收藏", "取消收藏");
          }
        }
      }
    },
    methods: {
      onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass([[$props.circle === true || $props.circle === "true" ? "uni-fav--circle" : ""], "uni-fav"]),
        style: vue.normalizeStyle([{ backgroundColor: $props.checked ? $props.bgColorChecked : $props.bgColor }]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
      },
      [
        !$props.checked && ($props.star === true || $props.star === "true") ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
          key: 0,
          color: $props.fgColor,
          style: vue.normalizeStyle({ color: $props.checked ? $props.fgColorChecked : $props.fgColor }),
          class: "uni-fav-star",
          size: "14",
          type: "star-filled"
        }, null, 8, ["color", "style"])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "text",
          {
            style: vue.normalizeStyle({ color: $props.checked ? $props.fgColorChecked : $props.fgColor }),
            class: "uni-fav-text"
          },
          vue.toDisplayString($props.checked ? $options.contentFav : $options.contentDefault),
          5
          /* TEXT, STYLE */
        )
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-8252a6d7"], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/uni_modules/uni-fav/components/uni-fav/uni-fav.vue"]]);
  const _sfc_main$b = {
    name: "UniStatusBar",
    data() {
      return {
        statusBarHeight: uni.getWindowInfo().statusBarHeight + "px"
      };
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        style: vue.normalizeStyle({ height: $data.statusBarHeight }),
        class: "uni-status-bar"
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      4
      /* STYLE */
    );
  }
  const statusBar = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-7920e3e0"], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/uni_modules/uni-nav-bar/components/uni-nav-bar/uni-status-bar.vue"]]);
  const getVal = (val) => typeof val === "number" ? val + "px" : val;
  const _sfc_main$a = {
    name: "UniNavBar",
    components: {
      statusBar
    },
    emits: ["clickLeft", "clickRight", "clickTitle"],
    props: {
      dark: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ""
      },
      leftText: {
        type: String,
        default: ""
      },
      rightText: {
        type: String,
        default: ""
      },
      leftIcon: {
        type: String,
        default: ""
      },
      rightIcon: {
        type: String,
        default: ""
      },
      fixed: {
        type: [Boolean, String],
        default: false
      },
      color: {
        type: String,
        default: ""
      },
      backgroundColor: {
        type: String,
        default: ""
      },
      statusBar: {
        type: [Boolean, String],
        default: false
      },
      shadow: {
        type: [Boolean, String],
        default: false
      },
      border: {
        type: [Boolean, String],
        default: true
      },
      height: {
        type: [Number, String],
        default: 44
      },
      leftWidth: {
        type: [Number, String],
        default: 60
      },
      rightWidth: {
        type: [Number, String],
        default: 60
      },
      stat: {
        type: [Boolean, String],
        default: ""
      }
    },
    computed: {
      themeBgColor() {
        if (this.dark) {
          if (this.backgroundColor) {
            return this.backgroundColor;
          } else {
            return this.dark ? "#333" : "#FFF";
          }
        }
        return this.backgroundColor || "#FFF";
      },
      themeColor() {
        if (this.dark) {
          if (this.color) {
            return this.color;
          } else {
            return this.dark ? "#fff" : "#333";
          }
        }
        return this.color || "#333";
      },
      navbarHeight() {
        return getVal(this.height);
      },
      leftIconWidth() {
        return getVal(this.leftWidth);
      },
      rightIconWidth() {
        return getVal(this.rightWidth);
      }
    },
    mounted() {
      if (uni.report && this.stat && this.title !== "") {
        uni.report("title", this.title);
      }
    },
    methods: {
      onClickLeft() {
        this.$emit("clickLeft");
      },
      onClickRight() {
        this.$emit("clickRight");
      },
      onClickTitle() {
        this.$emit("clickTitle");
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_status_bar = vue.resolveComponent("status-bar");
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["uni-navbar", { "uni-dark": $props.dark, "uni-nvue-fixed": $props.fixed }])
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["uni-navbar__content", { "uni-navbar--fixed": $props.fixed, "uni-navbar--shadow": $props.shadow, "uni-navbar--border": $props.border }]),
            style: vue.normalizeStyle({ "background-color": $options.themeBgColor, "border-bottom-color": $options.themeColor })
          },
          [
            $props.statusBar ? (vue.openBlock(), vue.createBlock(_component_status_bar, { key: 0 })) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode(
              "view",
              {
                style: vue.normalizeStyle({ color: $options.themeColor, backgroundColor: $options.themeBgColor, height: $options.navbarHeight }),
                class: "uni-navbar__header"
              },
              [
                vue.createElementVNode(
                  "view",
                  {
                    onClick: _cache[0] || (_cache[0] = (...args) => $options.onClickLeft && $options.onClickLeft(...args)),
                    class: "uni-navbar__header-btns uni-navbar__header-btns-left",
                    style: vue.normalizeStyle({ width: $options.leftIconWidth })
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "left", {}, () => [
                      $props.leftIcon.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "uni-navbar__content_view"
                      }, [
                        vue.createVNode(_component_uni_icons, {
                          color: $options.themeColor,
                          type: $props.leftIcon,
                          size: "20"
                        }, null, 8, ["color", "type"])
                      ])) : vue.createCommentVNode("v-if", true),
                      $props.leftText.length ? (vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          key: 1,
                          class: vue.normalizeClass([{ "uni-navbar-btn-icon-left": !$props.leftIcon.length > 0 }, "uni-navbar-btn-text"])
                        },
                        [
                          vue.createElementVNode(
                            "text",
                            {
                              style: vue.normalizeStyle({ color: $options.themeColor, fontSize: "12px" })
                            },
                            vue.toDisplayString($props.leftText),
                            5
                            /* TEXT, STYLE */
                          )
                        ],
                        2
                        /* CLASS */
                      )) : vue.createCommentVNode("v-if", true)
                    ], true)
                  ],
                  4
                  /* STYLE */
                ),
                vue.createElementVNode("view", {
                  class: "uni-navbar__header-container",
                  onClick: _cache[1] || (_cache[1] = (...args) => $options.onClickTitle && $options.onClickTitle(...args))
                }, [
                  vue.renderSlot(_ctx.$slots, "default", {}, () => [
                    $props.title.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "uni-navbar__header-container-inner"
                    }, [
                      vue.createElementVNode(
                        "text",
                        {
                          class: "uni-nav-bar-text uni-ellipsis-1",
                          style: vue.normalizeStyle({ color: $options.themeColor })
                        },
                        vue.toDisplayString($props.title),
                        5
                        /* TEXT, STYLE */
                      )
                    ])) : vue.createCommentVNode("v-if", true)
                  ], true)
                ]),
                vue.createElementVNode(
                  "view",
                  {
                    onClick: _cache[2] || (_cache[2] = (...args) => $options.onClickRight && $options.onClickRight(...args)),
                    class: "uni-navbar__header-btns uni-navbar__header-btns-right",
                    style: vue.normalizeStyle({ width: $options.rightIconWidth })
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "right", {}, () => [
                      $props.rightIcon.length ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
                        vue.createVNode(_component_uni_icons, {
                          color: $options.themeColor,
                          type: $props.rightIcon,
                          size: "22"
                        }, null, 8, ["color", "type"])
                      ])) : vue.createCommentVNode("v-if", true),
                      $props.rightText.length && !$props.rightIcon.length ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 1,
                        class: "uni-navbar-btn-text"
                      }, [
                        vue.createElementVNode(
                          "text",
                          {
                            class: "uni-nav-bar-right-text",
                            style: vue.normalizeStyle({ color: $options.themeColor })
                          },
                          vue.toDisplayString($props.rightText),
                          5
                          /* TEXT, STYLE */
                        )
                      ])) : vue.createCommentVNode("v-if", true)
                    ], true)
                  ],
                  4
                  /* STYLE */
                )
              ],
              4
              /* STYLE */
            )
          ],
          6
          /* CLASS, STYLE */
        ),
        $props.fixed ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "uni-navbar__placeholder"
        }, [
          $props.statusBar ? (vue.openBlock(), vue.createBlock(_component_status_bar, { key: 0 })) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode(
            "view",
            {
              class: "uni-navbar__placeholder-view",
              style: vue.normalizeStyle({ height: $options.navbarHeight })
            },
            null,
            4
            /* STYLE */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ],
      2
      /* CLASS */
    );
  }
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-26544265"], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.vue"]]);
  const _sfc_main$9 = {
    name: "UniSwiperDot",
    emits: ["clickItem"],
    props: {
      info: {
        type: Array,
        default() {
          return [];
        }
      },
      current: {
        type: Number,
        default: 0
      },
      dotsStyles: {
        type: Object,
        default() {
          return {};
        }
      },
      // 类型 ：default(默认) indexes long nav
      mode: {
        type: String,
        default: "default"
      },
      // 只在 nav 模式下生效，变量名称
      field: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        dots: {
          width: 6,
          height: 6,
          bottom: 10,
          color: "#fff",
          backgroundColor: "rgba(0, 0, 0, .3)",
          border: "1px rgba(0, 0, 0, .3) solid",
          selectedBackgroundColor: "#333",
          selectedBorder: "1px rgba(0, 0, 0, .9) solid"
        }
      };
    },
    watch: {
      dotsStyles(newVal) {
        this.dots = Object.assign(this.dots, this.dotsStyles);
      },
      mode(newVal) {
        if (newVal === "indexes") {
          this.dots.width = 14;
          this.dots.height = 14;
        } else {
          this.dots.width = 6;
          this.dots.height = 6;
        }
      }
    },
    created() {
      if (this.mode === "indexes") {
        this.dots.width = 12;
        this.dots.height = 12;
      }
      this.dots = Object.assign(this.dots, this.dotsStyles);
    },
    methods: {
      clickItem(index) {
        this.$emit("clickItem", index);
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-swiper__warp" }, [
      vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
      $props.mode === "default" ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          style: vue.normalizeStyle({ "bottom": $data.dots.bottom + "px" }),
          class: "uni-swiper__dots-box",
          key: "default"
        },
        [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($props.info, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                onClick: ($event) => $options.clickItem(index),
                style: vue.normalizeStyle({
                  "width": (index === $props.current ? $data.dots.width * 2 : $data.dots.width) + "px",
                  "height": $data.dots.width / 2 + "px",
                  "background-color": index !== $props.current ? $data.dots.backgroundColor : $data.dots.selectedBackgroundColor,
                  "border-radius": "0px"
                }),
                key: index,
                class: "uni-swiper__dots-item uni-swiper__dots-bar"
              }, null, 12, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        4
        /* STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.mode === "dot" ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          style: vue.normalizeStyle({ "bottom": $data.dots.bottom + "px" }),
          class: "uni-swiper__dots-box",
          key: "dot"
        },
        [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($props.info, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                onClick: ($event) => $options.clickItem(index),
                style: vue.normalizeStyle({
                  "width": $data.dots.width + "px",
                  "height": $data.dots.height + "px",
                  "background-color": index !== $props.current ? $data.dots.backgroundColor : $data.dots.selectedBackgroundColor,
                  "border": index !== $props.current ? $data.dots.border : $data.dots.selectedBorder
                }),
                key: index,
                class: "uni-swiper__dots-item"
              }, null, 12, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        4
        /* STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.mode === "round" ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          style: vue.normalizeStyle({ "bottom": $data.dots.bottom + "px" }),
          class: "uni-swiper__dots-box",
          key: "round"
        },
        [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($props.info, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                onClick: ($event) => $options.clickItem(index),
                class: vue.normalizeClass([[index === $props.current && "uni-swiper__dots-long"], "uni-swiper__dots-item"]),
                style: vue.normalizeStyle({
                  "width": (index === $props.current ? $data.dots.width * 3 : $data.dots.width) + "px",
                  "height": $data.dots.height + "px",
                  "background-color": index !== $props.current ? $data.dots.backgroundColor : $data.dots.selectedBackgroundColor,
                  "border": index !== $props.current ? $data.dots.border : $data.dots.selectedBorder
                }),
                key: index
              }, null, 14, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        4
        /* STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.mode === "nav" ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: "nav",
          style: vue.normalizeStyle({ "background-color": $props.dotsStyles.backgroundColor, "bottom": "0" }),
          class: "uni-swiper__dots-box uni-swiper__dots-nav"
        },
        [
          vue.createElementVNode(
            "text",
            {
              style: vue.normalizeStyle({ "color": $props.dotsStyles.color }),
              class: "uni-swiper__dots-nav-item"
            },
            vue.toDisplayString($props.current + 1 + "/" + $props.info.length + " " + $props.info[$props.current][$props.field]),
            5
            /* TEXT, STYLE */
          )
        ],
        4
        /* STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.mode === "indexes" ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: "indexes",
          style: vue.normalizeStyle({ "bottom": $data.dots.bottom + "px" }),
          class: "uni-swiper__dots-box"
        },
        [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($props.info, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                onClick: ($event) => $options.clickItem(index),
                style: vue.normalizeStyle({
                  "width": $data.dots.width + "px",
                  "height": $data.dots.height + "px",
                  "color": index === $props.current ? $data.dots.selectedColor : $data.dots.color,
                  "background-color": index !== $props.current ? $data.dots.backgroundColor : $data.dots.selectedBackgroundColor,
                  "border": index !== $props.current ? $data.dots.border : $data.dots.selectedBorder
                }),
                key: index,
                class: "uni-swiper__dots-item uni-swiper__dots-indexes"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-swiper__dots-indexes-text" },
                  vue.toDisplayString(index + 1),
                  1
                  /* TEXT */
                )
              ], 12, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        4
        /* STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-0667e3db"], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/uni_modules/uni-swiper-dot/components/uni-swiper-dot/uni-swiper-dot.vue"]]);
  const _imports_0 = "/static/index/icon/ars.png";
  const _sfc_main$8 = {
    __name: "showInfo",
    setup(__props, { expose: __expose }) {
      __expose();
      let data = vue.ref();
      let ticketPurchaseData = vue.ref();
      let swiperImgList = vue.ref([]);
      function getTicketPurchaseData(id) {
        uni.request({
          method: "GET",
          url: "http://59.46.190.164:7080/appScenic/order/scenicInfo?scenicId=" + id,
          token: uni.getStorageSync("token"),
          header: {
            Authorization: uni.getStorageSync("token")
          }
        }).then((res) => {
          formatAppLog("log", "at pages/showInfo/showInfo.vue:110", res.data);
          ticketPurchaseData.value = res.data.data;
        });
      }
      function leftClick() {
        uni.navigateBack();
      }
      async function getData(id) {
        await uni.request({
          method: "GET",
          url: "http://59.46.190.164:7080/appScenic/scenic/detail?id=" + id,
          token: uni.getStorageSync("token"),
          header: {
            Authorization: uni.getStorageSync("token")
          }
        }).then((res) => {
          formatAppLog("log", "at pages/showInfo/showInfo.vue:132", res.data);
          swiperImgList.value = res.data.data.imgList;
          data.value = res.data;
        });
      }
      onLoad((options) => {
        getData(options.id);
        getTicketPurchaseData(options.id);
      });
      const __returned__ = { get data() {
        return data;
      }, set data(v) {
        data = v;
      }, get ticketPurchaseData() {
        return ticketPurchaseData;
      }, set ticketPurchaseData(v) {
        ticketPurchaseData = v;
      }, get swiperImgList() {
        return swiperImgList;
      }, set swiperImgList(v) {
        swiperImgList = v;
      }, getTicketPurchaseData, leftClick, getData, ref: vue.ref, get onLaunch() {
        return onLaunch;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      }, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0);
    const _component_uni_fav = resolveEasycom(vue.resolveDynamicComponent("uni-fav"), __easycom_1);
    const _component_uni_nav_bar = resolveEasycom(vue.resolveDynamicComponent("uni-nav-bar"), __easycom_2);
    const _component_uni_swiper_dot = resolveEasycom(vue.resolveDynamicComponent("uni-swiper-dot"), __easycom_3);
    const _component_uni_rate = resolveEasycom(vue.resolveDynamicComponent("uni-rate"), __easycom_4);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createVNode(_component_uni_nav_bar, {
          border: false,
          style: { "width": "100%" },
          fixed: false,
          "left-icon": "arrowleft",
          title: $setup.data.data.title,
          color: "#333333",
          "background-color": "#FFFFFF"
        }, {
          left: vue.withCtx(() => [
            vue.createVNode(_component_uni_icons, {
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.leftClick()),
              type: "left",
              size: "30"
            })
          ]),
          right: vue.withCtx(() => [
            vue.createVNode(_component_uni_fav, { circle: true })
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title"]),
        vue.createElementVNode("view", null, [
          vue.createVNode(_component_uni_swiper_dot, {
            info: _ctx.info,
            current: _ctx.current,
            field: "content",
            mode: _ctx.mode
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("swiper", {
                class: "swiper",
                circular: "",
                autoplay: "",
                "indicator-dots": ""
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.swiperImgList, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("swiper-item", { key: index }, [
                      vue.createElementVNode("image", {
                        src: `http://59.46.190.164:7080${item}`,
                        mode: ""
                      }, null, 8, ["src"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            _: 1
            /* STABLE */
          }, 8, ["info", "current", "mode"]),
          vue.createElementVNode("view", { class: "content" }, [
            vue.createElementVNode("view", { class: "pageInfo" }, [
              vue.createElementVNode(
                "text",
                { class: "title" },
                vue.toDisplayString($setup.data.data.title),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "evaluation" }, [
                vue.createVNode(_component_uni_rate, {
                  touchable: false,
                  size: "15",
                  value: $setup.data.data.starLevel
                }, null, 8, ["value"]),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($setup.data.data.evaluationNum) + "条评论",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode(
                "text",
                { class: "describe" },
                vue.toDisplayString($setup.data.data.describe),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "address" }, [
              vue.createElementVNode("view", null, [
                vue.createElementVNode("image", { src: _imports_0 }),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($setup.data.data.location),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", null, [
                vue.createElementVNode("image", { src: _imports_0$2 }),
                vue.createElementVNode("text", null, "导览")
              ])
            ]),
            vue.createElementVNode("view", { class: "ticketPurchaseView" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.ticketPurchaseData.scenicInfo, (item) => {
                  return vue.openBlock(), vue.createElementBlock("view", { class: "ticketPurchaseItem" }, [
                    vue.createElementVNode("view", { class: "leftView" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "dictLabel" },
                        vue.toDisplayString(item.dictLabel),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", { class: "features" }, [
                        vue.createElementVNode("text", null, "今日可预定"),
                        vue.createElementVNode("text", { style: { "color": "#e0e0e0" } }, "｜"),
                        vue.createElementVNode("text", null, "随时退")
                      ]),
                      vue.createElementVNode(
                        "text",
                        { class: "saleNum" },
                        "已售" + vue.toDisplayString(item.scenicTicket.saleNum),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "rightView" }, [
                      vue.createElementVNode("view", null, [
                        vue.createElementVNode(
                          "text",
                          { class: "price" },
                          "¥" + vue.toDisplayString(item.scenicTicket.price),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("text", null, "起")
                      ]),
                      vue.createElementVNode("button", {
                        class: "scheduleButton",
                        size: "mini"
                      }, "预定")
                    ])
                  ]);
                }),
                256
                /* UNKEYED_FRAGMENT */
              ))
            ]),
            vue.createElementVNode("view", { class: "introductionTitle" }, [
              vue.createElementVNode("text", { class: "item1" }, "｜"),
              vue.createElementVNode("text", { class: "title" }, "产品介绍")
            ]),
            vue.createElementVNode("view", {
              class: "introduction",
              innerHTML: $setup.data.data.introduction
            }, null, 8, ["innerHTML"])
          ])
        ])
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesShowInfoShowInfo = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/showInfo/showInfo.vue"]]);
  const _sfc_main$7 = {
    __name: "scenicAlbum",
    setup(__props, { expose: __expose }) {
      __expose();
      let data = vue.ref();
      function getData() {
        uni.request({
          method: "GET",
          url: "http://59.46.190.164:7080/appScenic/appAlbum/list",
          token: uni.getStorageSync("token"),
          header: {
            Authorization: uni.getStorageSync("token")
          }
        }).then((res) => {
          formatAppLog("log", "at pages/scenicAlbum/scenicAlbum.vue:45", "=====================");
          formatAppLog("log", "at pages/scenicAlbum/scenicAlbum.vue:46", res);
          data.value = res.data;
        });
      }
      function showImage(index, list) {
        formatAppLog("log", "at pages/scenicAlbum/scenicAlbum.vue:53", index + "=========");
        formatAppLog("log", "at pages/scenicAlbum/scenicAlbum.vue:54", list);
        const result = list.split(",").map((item) => "http://59.46.190.164:7080" + item);
        formatAppLog("log", "at pages/scenicAlbum/scenicAlbum.vue:57", "====-=-=-=-=-=-=-=-=-=-=-=-=-");
        formatAppLog("log", "at pages/scenicAlbum/scenicAlbum.vue:58", result);
        formatAppLog("log", "at pages/scenicAlbum/scenicAlbum.vue:59", result);
        uni.previewImage({
          current: result[index],
          // 当前图片的 URL
          urls: result
          // 所有图片的 URL 数组
        });
      }
      onLoad(() => {
        getData();
      });
      const __returned__ = { get data() {
        return data;
      }, set data(v) {
        data = v;
      }, getData, showImage, ref: vue.ref, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($setup.data.data, (item, index) => {
          return vue.openBlock(), vue.createElementBlock("view", {
            class: "item",
            key: index
          }, [
            vue.createElementVNode("view", { class: "pagetitle" }, [
              vue.createElementVNode("view", { class: "title-container" }, [
                vue.createElementVNode("text", { class: "separator" }, "|"),
                vue.createElementVNode(
                  "text",
                  { class: "title" },
                  vue.toDisplayString(item.title),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "imageList" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(item.list, (image, idx) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    onClick: ($event) => $setup.showImage(idx, image.loopPicPath),
                    class: "imageItem",
                    key: idx,
                    style: vue.normalizeStyle({ backgroundImage: `url(http://59.46.190.164:7080${image.coverPath})` })
                  }, [
                    vue.createElementVNode("view", null, [
                      vue.createElementVNode("image", {
                        class: "albumIcon",
                        src: _imports_0$2
                      }),
                      vue.createElementVNode(
                        "text",
                        { class: "title" },
                        vue.toDisplayString(image.title),
                        1
                        /* TEXT */
                      )
                    ])
                  ], 12, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]);
        }),
        128
        /* KEYED_FRAGMENT */
      ))
    ]);
  }
  const PagesScenicAlbumScenicAlbum = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/scenicAlbum/scenicAlbum.vue"]]);
  const _sfc_main$6 = {
    data() {
      return {
        images: [
          "http://59.46.190.164:7080/profile/scenic/album/cover/2023/02/08/711875a7-34b9-4a95-b73d-c817e24290ad.png",
          "http://59.46.190.164:7080/profile/scenic/album/cover/2023/02/08/dae59cae-5948-4ec3-97b5-9f98b0761db7.png",
          "http://59.46.190.164:7080/profile/scenic/album/cover/2023/02/08/e71f9a0d-7425-4c1a-bf2a-a9d4f813dd9b.png",
          "http://59.46.190.164:7080/profile/scenic/album/cover/2023/02/08/cd66f786-44d9-43ba-9859-95eb447a14c2.png"
        ]
      };
    },
    methods: {
      previewImage(index) {
        uni.previewImage({
          current: this.images[index],
          // 当前显示图片的链接
          urls: this.images
          // 需要预览的图片链接列表
        });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("view", { class: "imageList" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.images, (image, index) => {
            return vue.openBlock(), vue.createElementBlock("image", {
              key: index,
              src: image,
              onClick: ($event) => $options.previewImage(index),
              mode: "aspectFill",
              class: "imageItem"
            }, null, 8, ["src", "onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]);
  }
  const PagesTestTest = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/test/test.vue"]]);
  const _sfc_main$5 = {
    __name: "raiders",
    setup(__props, { expose: __expose }) {
      __expose();
      let data = vue.ref();
      function getData() {
        uni.request({
          method: "GET",
          url: "http://59.46.190.164:7080/appScenic/strategy/list?title=",
          token: uni.getStorageSync("token"),
          header: {
            Authorization: uni.getStorageSync("token")
          }
        }).then((res) => {
          formatAppLog("log", "at pages/raiders/raiders.vue:46", "=====================");
          formatAppLog("log", "at pages/raiders/raiders.vue:47", res.data.rows);
          data.value = res.data;
        });
      }
      function gotoInfo(id) {
        uni.navigateTo({
          url: "raidersInfo?id=" + id
        });
      }
      onLoad(() => {
        getData();
      });
      const __returned__ = { get data() {
        return data;
      }, set data(v) {
        data = v;
      }, getData, gotoInfo, ref: vue.ref, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", { class: "pageContent" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "pageTitle" }, [
          vue.createVNode(_component_uni_icons, {
            type: "back",
            size: "30",
            color: "#ccc"
          }),
          vue.createElementVNode("input", {
            class: "searchInput",
            "confirm-type": "search",
            placeholder: "搜索攻略"
          }),
          vue.createElementVNode("button", {
            class: "searchButton",
            size: "mini"
          }, "搜索")
        ]),
        vue.createElementVNode("scroll-view", { "scroll-y": "" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.data.rows, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                onClick: ($event) => $setup.gotoInfo(item.id),
                class: "item"
              }, [
                vue.createElementVNode("image", {
                  src: `http://59.46.190.164:7080${item.cover}`
                }, null, 8, ["src"]),
                vue.createElementVNode(
                  "text",
                  { class: "title" },
                  vue.toDisplayString(item.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "subtitle" },
                  vue.toDisplayString(item.subtitle),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            256
            /* UNKEYED_FRAGMENT */
          ))
        ])
      ])
    ]);
  }
  const PagesRaidersRaiders = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/raiders/raiders.vue"]]);
  const _sfc_main$4 = {
    __name: "raidersInfo",
    setup(__props, { expose: __expose }) {
      __expose();
      let data = vue.ref();
      function getData(id) {
        uni.request({
          method: "GET",
          url: "http://59.46.190.164:7080/appScenic/strategy/detail?id=" + id,
          token: uni.getStorageSync("token"),
          header: {
            Authorization: uni.getStorageSync("token")
          }
        }).then((res) => {
          data.value = res.data;
        });
      }
      onLoad((infoData) => {
        formatAppLog("log", "at pages/raiders/raidersInfo.vue:43", infoData.id);
        getData(infoData.id);
      });
      const __returned__ = { get data() {
        return data;
      }, set data(v) {
        data = v;
      }, getData, ref: vue.ref, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("view", { class: "pageBackImage" }, [
        vue.createElementVNode("image", {
          src: `http://59.46.190.164:7080${$setup.data.data.cover}`
        }, null, 8, ["src"])
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($setup.data.data.title),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", {
          innerHTML: $setup.data.data.introduction
        }, null, 8, ["innerHTML"])
      ])
    ]);
  }
  const PagesRaidersRaidersInfo = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/raiders/raidersInfo.vue"]]);
  const _sfc_main$3 = {};
  function _sfc_render$2(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("view");
  }
  const PagesMyFavoriteMyFavorite = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/myFavorite/myFavorite.vue"]]);
  const _sfc_main$2 = {};
  function _sfc_render$1(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("view");
  }
  const PagesMyCollectionMyCollection = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/myCollection/myCollection.vue"]]);
  const _sfc_main$1 = {};
  function _sfc_render(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("view");
  }
  const PagesMyFootprintsMyFootprints = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/pages/myFootprints/myFootprints.vue"]]);
  __definePage("pages/advertisement/advertisement", PagesAdvertisementAdvertisement);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/register/register", PagesRegisterRegister);
  __definePage("pages/activities/activities", PagesActivitiesActivities);
  __definePage("pages/my/my", PagesMyMy);
  __definePage("pages/showInfo/showInfo", PagesShowInfoShowInfo);
  __definePage("pages/scenicAlbum/scenicAlbum", PagesScenicAlbumScenicAlbum);
  __definePage("pages/test/test", PagesTestTest);
  __definePage("pages/raiders/raiders", PagesRaidersRaiders);
  __definePage("pages/raiders/raidersInfo", PagesRaidersRaidersInfo);
  __definePage("pages/myFavorite/myFavorite", PagesMyFavoriteMyFavorite);
  __definePage("pages/myCollection/myCollection", PagesMyCollectionMyCollection);
  __definePage("pages/myFootprints/myFootprints", PagesMyFootprintsMyFootprints);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "/Users/null/Desktop/智慧景区/wisdomScenicSpot/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
